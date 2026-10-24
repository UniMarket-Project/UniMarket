import { prisma } from '../../src/platform/database/prisma.client.js';
import type { ListingType, ListingStatus } from '@unimarket/shared';

export interface CreateTestListingOptions {
  createdById: string;
  title?: string;
  description?: string;
  category?: string;
  transactionType?: ListingType;
  price?: number;
  currency?: string;
  quantityAvailable?: number;
  status?: ListingStatus;
  images?: string[];
  address?: string;
  expiresAt?: Date;
}

export async function createTestListing(options: CreateTestListingOptions) {
  const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  return prisma.listing.create({
    data: {
      createdById: options.createdById,
      title: options.title || 'Original Casio fx-991EX ClassWiz Calculator',
      description: options.description || 'Authentic scientific calculator for engineering courses.',
      category: options.category || 'Electronics',
      transactionType: options.transactionType || 'sell',
      price: options.price !== undefined ? options.price : 1850.0,
      currency: options.currency || 'ETB',
      quantityAvailable: options.quantityAvailable !== undefined ? options.quantityAvailable : 1,
      status: options.status || 'active',
      images: options.images || ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600'],
      address: options.address || 'AAU 4-Kilo Science Library',
      expiresAt: options.expiresAt || sixtyDaysLater,
    },
  });
}
