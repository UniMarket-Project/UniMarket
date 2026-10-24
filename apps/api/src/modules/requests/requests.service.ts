import { prisma } from '../../platform/database/prisma.client.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../../platform/errors/http-errors.js';
import type { CreateRequestInput, UpdateRequestInput, RequestsQueryInput } from '@unimarket/shared';
import type { Prisma } from '@prisma/client';

export class RequestsService {
  private static formatRequest(r: any) {
    return {
      requestId: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      type: r.type,
      status: r.status,
      budgetMin: r.budgetMin ? Number(r.budgetMin) : null,
      budgetMax: r.budgetMax ? Number(r.budgetMax) : null,
      exchangeHave: r.exchangeHave,
      exchangeWant: r.exchangeWant,
      location: r.address ? { address: r.address, latitude: r.latitude, longitude: r.longitude } : null,
      createdBy: {
        userId: r.createdBy.id,
        firstName: r.createdBy.firstName,
        lastName: r.createdBy.lastName,
        avatarUrl: r.createdBy.profile?.avatarUrl ?? null,
        verificationStatus: r.createdBy.verificationStatus,
        averageRating: r.createdBy.profile?.averageRating ?? 0,
        totalRatings: r.createdBy.profile?.totalRatings ?? 0,
        totalTransactions: r.createdBy.profile?.totalTransactions ?? 0,
      },
      createdAt: r.createdAt.toISOString(),
    };
  }

  public static async createRequest(userId: string, input: CreateRequestInput) {
    const req = await prisma.request.create({
      data: {
        createdById: userId,
        title: input.title,
        description: input.description,
        category: input.category,
        type: input.type,
        budgetMin: input.budgetMin !== undefined && input.budgetMin !== null ? input.budgetMin : null,
        budgetMax: input.budgetMax !== undefined && input.budgetMax !== null ? input.budgetMax : null,
        exchangeHave: input.exchangeHave,
        exchangeWant: input.exchangeWant,
        latitude: input.location?.latitude ?? null,
        longitude: input.location?.longitude ?? null,
        address: input.location?.address ?? null,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    });

    return { request: this.formatRequest(req) };
  }

  public static async getRequests(query: RequestsQueryInput, callerUserId?: string) {
    const { page, limit, q, category, type, status, mine } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RequestWhereInput = {
      isDeleted: false,
    };

    if (mine && callerUserId) {
      where.createdById = callerUserId;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category.toLowerCase();
    }

    if (type) {
      where.type = type;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.request.count({ where }),
      prisma.request.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            include: { profile: true },
          },
        },
      }),
    ]);

    const items = requests.map((r) => this.formatRequest(r));

    return {
      requests: items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }

  public static async getRequestById(id: string) {
    const req = await prisma.request.findUnique({
      where: { id },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    });

    if (!req || req.isDeleted) {
      throw new NotFoundError('Request not found');
    }

    // Find related listings in the same category within budget
    const listingWhere: Prisma.ListingWhereInput = {
      status: 'active',
      isDeleted: false,
      category: req.category,
    };

    if (req.budgetMax) {
      listingWhere.price = { lte: req.budgetMax };
    }

    const relatedListings = await prisma.listing.findMany({
      where: listingWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    });

    const formattedRelated = relatedListings.map((l) => ({
      listingId: l.id,
      title: l.title,
      category: l.category,
      transactionType: l.transactionType,
      price: l.price ? Number(l.price) : null,
      currency: l.currency,
      images: Array.isArray(l.images) ? (l.images as string[]) : [],
      availabilityStatus: l.availabilityStatus,
      location: l.address ? { address: l.address } : null,
      createdBy: {
        userId: l.createdBy.id,
        firstName: l.createdBy.firstName,
        lastName: l.createdBy.lastName,
        avatarUrl: l.createdBy.profile?.avatarUrl ?? null,
        verificationStatus: l.createdBy.verificationStatus,
        averageRating: l.createdBy.profile?.averageRating ?? 0,
        totalRatings: l.createdBy.profile?.totalRatings ?? 0,
        totalTransactions: l.createdBy.profile?.totalTransactions ?? 0,
      },
      createdAt: l.createdAt.toISOString(),
    }));

    return {
      request: this.formatRequest(req),
      relatedListings: formattedRelated,
    };
  }

  public static async updateRequest(
    id: string,
    callerUserId: string,
    isAdmin: boolean,
    input: UpdateRequestInput
  ) {
    const existing = await prisma.request.findUnique({
      where: { id },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundError('Request not found');
    }

    if (existing.createdById !== callerUserId && !isAdmin) {
      throw new ForbiddenError('You can only update your own request');
    }

    if (existing.status === 'closed' && input.status && input.status !== 'closed') {
      throw new ConflictError('Cannot reopen a closed request');
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.description ? { description: input.description } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.budgetMin !== undefined ? { budgetMin: input.budgetMin } : {}),
        ...(input.budgetMax !== undefined ? { budgetMax: input.budgetMax } : {}),
        ...(input.exchangeHave !== undefined ? { exchangeHave: input.exchangeHave } : {}),
        ...(input.exchangeWant !== undefined ? { exchangeWant: input.exchangeWant } : {}),
        ...(input.location
          ? {
              latitude: input.location.latitude ?? null,
              longitude: input.location.longitude ?? null,
              address: input.location.address ?? null,
            }
          : {}),
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    });

    return { request: this.formatRequest(updated) };
  }
}
