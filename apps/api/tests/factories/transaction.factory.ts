import { prisma } from '../../src/platform/database/prisma.client.js';
import type { TransactionStatus, ListingType } from '@unimarket/shared';

export interface CreateTestTransactionOptions {
  listingId?: string;
  requestId?: string;
  buyerId: string;
  sellerId: string;
  title?: string;
  transactionType?: ListingType;
  status?: TransactionStatus;
  amount?: number;
  currency?: string;
  quantity?: number;
  buyerConfirmed?: boolean;
  sellerConfirmed?: boolean;
  notes?: string;
}

export async function createTestTransaction(options: CreateTestTransactionOptions) {
  const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  return prisma.transaction.create({
    data: {
      listingId: options.listingId,
      requestId: options.requestId,
      buyerId: options.buyerId,
      sellerId: options.sellerId,
      title: options.title || 'Introduction to Algorithms (CLRS 3rd Edition)',
      transactionType: options.transactionType || 'sell',
      status: options.status || 'pending',
      amount: options.amount !== undefined ? options.amount : 1200.0,
      currency: options.currency || 'ETB',
      quantity: options.quantity || 1,
      buyerConfirmed: options.buyerConfirmed ?? false,
      sellerConfirmed: options.sellerConfirmed ?? false,
      notes: options.notes || 'Meeting at AAU 4-Kilo Gate 1',
      expiresAt: sixtyDaysLater,
    },
  });
}
