import type { Prisma } from '@prisma/client';
import type { ListingsQueryInput } from '@unimarket/shared';

export interface ListingsSearchParams {
  where: Prisma.ListingWhereInput;
  orderBy: Prisma.ListingOrderByWithRelationInput;
  skip: number;
  take: number;
}

export function buildListingsSearchQuery(query: ListingsQueryInput): ListingsSearchParams {
  const { page, limit, q, category, transactionType, minPrice, maxPrice, sortBy, universityCode } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ListingWhereInput = {
    status: 'active',
    isDeleted: false,
    expiresAt: { gt: new Date() },
  };

  if (category) {
    where.category = category.toLowerCase();
  }

  if (transactionType) {
    where.transactionType = transactionType;
  }

  if (universityCode && universityCode !== 'ALL') {
    where.createdBy = { universityCode };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ];
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  if (sortBy === 'price_asc') orderBy = { price: 'asc' };
  if (sortBy === 'price_desc') orderBy = { price: 'desc' };

  return {
    where,
    orderBy,
    skip,
    take: limit,
  };
}
