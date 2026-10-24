import { NotFoundError, ForbiddenError, ConflictError } from '../../platform/errors/http-errors.js';
import { LIMITS, type CreateListingInput, type UpdateListingInput, type ListingsQueryInput } from '@unimarket/shared';
import { ListingsRepository } from './listings.repository.js';
import { buildListingsSearchQuery } from './listings.search.js';
import type { Prisma } from '@prisma/client';

export class ListingsService {
  private static formatListingSummary(l: any) {
    return {
      listingId: l.id,
      title: l.title,
      category: l.category,
      transactionType: l.transactionType,
      price: l.price ? Number(l.price) : null,
      currency: l.currency,
      images: Array.isArray(l.images) ? l.images : [],
      availabilityStatus: l.availabilityStatus,
      location: l.address ? { address: l.address, latitude: l.latitude, longitude: l.longitude } : null,
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
    };
  }

  private static formatListingDetail(l: any) {
    const summary = this.formatListingSummary(l);
    return {
      ...summary,
      description: l.description,
      quantityAvailable: l.quantityAvailable,
      rentalStartDate: l.rentalStartDate ? l.rentalStartDate.toISOString() : null,
      rentalEndDate: l.rentalEndDate ? l.rentalEndDate.toISOString() : null,
      metadata: (l.metadata as Record<string, unknown>) ?? {},
      viewCount: l.viewCount,
      status: l.status,
      updatedAt: l.updatedAt.toISOString(),
      expiresAt: l.expiresAt.toISOString(),
      createdBy: {
        ...summary.createdBy,
        bio: l.createdBy.profile?.bio ?? null,
        joinedAt: l.createdBy.createdAt.toISOString(),
      },
    };
  }

  public static async createListing(userId: string, input: CreateListingInput) {
    const expiresAt = new Date(Date.now() + LIMITS.LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const listing = await ListingsRepository.create({
      createdById: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      transactionType: input.transactionType,
      price: input.price !== undefined && input.price !== null ? input.price : null,
      currency: input.currency ?? 'ETB',
      quantityAvailable: input.quantityAvailable ?? 1,
      images: input.images ?? [],
      availabilityStatus: input.availabilityStatus ?? 'available',
      rentalStartDate: input.rentalStartDate ? new Date(input.rentalStartDate) : null,
      rentalEndDate: input.rentalEndDate ? new Date(input.rentalEndDate) : null,
      metadata: (input.metadata as Prisma.InputJsonValue) ?? {},
      latitude: input.location?.latitude ?? null,
      longitude: input.location?.longitude ?? null,
      address: input.location?.address ?? null,
      expiresAt,
    });

    return { listing: this.formatListingDetail(listing) };
  }

  public static async getListings(query: ListingsQueryInput) {
    const searchParams = buildListingsSearchQuery(query);
    const { total, listings } = await ListingsRepository.search(searchParams);

    const items = listings.map((l) => this.formatListingSummary(l));

    return {
      listings: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasMore: searchParams.skip + items.length < total,
      },
    };
  }

  public static async getListingById(id: string, callerUserId?: string, isAdmin = false) {
    const listing = await ListingsRepository.findById(id);

    if (!listing || listing.isDeleted) {
      throw new NotFoundError('Listing not found');
    }

    const isOwner = callerUserId && listing.createdById === callerUserId;

    if (listing.status !== 'active' && !isOwner && !isAdmin) {
      throw new NotFoundError('Listing not found');
    }

    // Increment view count asynchronously
    ListingsRepository.incrementViewCount(id).catch(() => {});

    return { listing: this.formatListingDetail(listing) };
  }

  public static async updateListing(
    id: string,
    callerUserId: string,
    isAdmin: boolean,
    input: UpdateListingInput
  ) {
    const existing = await ListingsRepository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new NotFoundError('Listing not found');
    }

    if (existing.createdById !== callerUserId && !isAdmin) {
      throw new ForbiddenError('You can only update your own listing');
    }

    if (existing.status === 'removed') {
      throw new ConflictError('Cannot update a removed listing');
    }

    const updated = await ListingsRepository.update(id, {
      ...(input.title ? { title: input.title } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.transactionType ? { transactionType: input.transactionType } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.currency ? { currency: input.currency } : {}),
      ...(input.quantityAvailable !== undefined ? { quantityAvailable: input.quantityAvailable } : {}),
      ...(input.images ? { images: input.images } : {}),
      ...(input.availabilityStatus ? { availabilityStatus: input.availabilityStatus } : {}),
      ...(input.rentalStartDate !== undefined
        ? { rentalStartDate: input.rentalStartDate ? new Date(input.rentalStartDate) : null }
        : {}),
      ...(input.rentalEndDate !== undefined
        ? { rentalEndDate: input.rentalEndDate ? new Date(input.rentalEndDate) : null }
        : {}),
      ...(input.metadata ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
      ...(input.location
        ? {
            latitude: input.location.latitude ?? null,
            longitude: input.location.longitude ?? null,
            address: input.location.address ?? null,
          }
        : {}),
    });

    return { listing: this.formatListingDetail(updated) };
  }

  public static async deleteListing(id: string, callerUserId: string, isAdmin: boolean) {
    const existing = await ListingsRepository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new NotFoundError('Listing not found');
    }

    if (existing.createdById !== callerUserId && !isAdmin) {
      throw new ForbiddenError('You can only delete your own listing');
    }

    await ListingsRepository.softDelete(id);
  }
}
