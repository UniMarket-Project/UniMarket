import { prisma } from '../../platform/database/prisma.client.js';
import type { Prisma } from '@prisma/client';
import type { ListingsSearchParams } from './listings.search.js';

export class ListingsRepository {
  public static async create(data: Prisma.ListingUncheckedCreateInput) {
    return prisma.listing.create({
      data,
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    });
  }

  public static async findById(id: string) {
    return prisma.listing.findUnique({
      where: { id },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    });
  }

  public static async incrementViewCount(id: string) {
    return prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  public static async update(id: string, data: Prisma.ListingUpdateInput) {
    return prisma.listing.update({
      where: { id },
      data,
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    });
  }

  public static async softDelete(id: string) {
    return prisma.listing.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'removed',
      },
    });
  }

  public static async search(params: ListingsSearchParams) {
    const { where, orderBy, skip, take } = params;
    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          createdBy: {
            include: { profile: true },
          },
        },
      }),
    ]);

    return { total, listings };
  }
}
