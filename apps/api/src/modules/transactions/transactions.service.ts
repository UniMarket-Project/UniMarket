import { prisma } from '../../platform/database/prisma.client.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../platform/errors/http-errors.js';
import { ErrorCode, type CreateTransactionInput, type TransactionsQueryInput } from '@unimarket/shared';
import { eventBus } from '../../platform/events/event-bus.js';
import type { Prisma } from '@prisma/client';

export class TransactionsService {
  private static formatTransaction(t: any) {
    return {
      transactionId: t.id,
      listingId: t.listingId,
      requestId: t.requestId,
      title: t.title,
      transactionType: t.transactionType,
      status: t.status,
      amount: Number(t.amount),
      currency: t.currency,
      quantity: t.quantity,
      rentalStartDate: t.rentalStartDate ? t.rentalStartDate.toISOString() : null,
      rentalEndDate: t.rentalEndDate ? t.rentalEndDate.toISOString() : null,
      buyer: {
        userId: t.buyer.id,
        firstName: t.buyer.firstName,
        lastName: t.buyer.lastName,
        avatarUrl: t.buyer.profile?.avatarUrl ?? null,
        verificationStatus: t.buyer.verificationStatus,
        averageRating: t.buyer.profile?.averageRating ?? 0,
        totalRatings: t.buyer.profile?.totalRatings ?? 0,
        totalTransactions: t.buyer.profile?.totalTransactions ?? 0,
      },
      seller: {
        userId: t.seller.id,
        firstName: t.seller.firstName,
        lastName: t.seller.lastName,
        avatarUrl: t.seller.profile?.avatarUrl ?? null,
        verificationStatus: t.seller.verificationStatus,
        averageRating: t.seller.profile?.averageRating ?? 0,
        totalRatings: t.seller.profile?.totalRatings ?? 0,
        totalTransactions: t.seller.profile?.totalTransactions ?? 0,
      },
      payment: t.payment
        ? {
            method: t.payment.method,
            status: t.payment.status,
            notes: t.payment.notes,
          }
        : {
            method: 'cash',
            status: 'recorded',
            notes: null,
          },
      buyerConfirmed: t.buyerConfirmed,
      sellerConfirmed: t.sellerConfirmed,
      buyerConfirmedAt: t.buyerConfirmedAt ? t.buyerConfirmedAt.toISOString() : null,
      sellerConfirmedAt: t.sellerConfirmedAt ? t.sellerConfirmedAt.toISOString() : null,
      cancelReason: t.cancelReason,
      cancelledBy: t.cancelledById,
      metadata: (t.metadata as Record<string, unknown>) ?? {},
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      expiresAt: t.expiresAt.toISOString(),
    };
  }

  public static async createTransaction(callerUserId: string, input: CreateTransactionInput) {
    let buyerId: string;
    let sellerId: string;
    let title: string;
    let transactionType: any;
    let amount: number;

    if (input.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing || listing.isDeleted) {
        throw new NotFoundError('Listing not found');
      }

      if (listing.createdById === callerUserId) {
        throw new BadRequestError('You cannot buy or deal with your own listing');
      }

      if (listing.status !== 'active' || listing.availabilityStatus === 'unavailable') {
        throw new ConflictError('Listing is not currently available for deals', ErrorCode.INVALID_STATE);
      }

      if (listing.quantityAvailable < input.quantity) {
        throw new ConflictError('Requested quantity exceeds available stock', ErrorCode.INVALID_STATE);
      }

      buyerId = callerUserId;
      sellerId = listing.createdById;
      title = listing.title;
      transactionType = listing.transactionType;
      amount = input.amount !== undefined ? input.amount : Number(listing.price || 0) * input.quantity;
    } else {
      const request = await prisma.request.findUnique({
        where: { id: input.requestId! },
      });

      if (!request || request.isDeleted) {
        throw new NotFoundError('Request not found');
      }

      if (request.createdById === callerUserId) {
        throw new BadRequestError('You cannot offer to fulfill your own request');
      }

      buyerId = request.createdById;
      sellerId = callerUserId;
      title = request.title;
      transactionType = 'service';
      amount = input.amount;
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const transaction = await prisma.transaction.create({
      data: {
        listingId: input.listingId ?? null,
        requestId: input.requestId ?? null,
        buyerId,
        sellerId,
        title,
        transactionType,
        amount,
        quantity: input.quantity,
        rentalStartDate: input.rentalStartDate ? new Date(input.rentalStartDate) : null,
        rentalEndDate: input.rentalEndDate ? new Date(input.rentalEndDate) : null,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? {},
        notes: input.notes,
        expiresAt,
        status: 'pending',
      },
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
        payment: true,
      },
    });

    eventBus.emit('deal.created', {
      transactionId: transaction.id,
      listingId: transaction.listingId,
      requestId: transaction.requestId,
      buyerId,
      sellerId,
    });

    return { transaction: this.formatTransaction(transaction) };
  }

  public static async acceptTransaction(transactionId: string, callerUserId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status !== 'pending') {
      throw new ConflictError('Transaction is not in pending status', ErrorCode.INVALID_STATE);
    }

    // Counterparty check: if initiated from listing, seller must accept
    if (callerUserId !== transaction.sellerId && callerUserId !== transaction.buyerId) {
      throw new ForbiddenError('You are not a participant in this deal');
    }

    // Accept and decrement quantity in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      if (transaction.listingId && transaction.listing) {
        const remaining = Math.max(0, transaction.listing.quantityAvailable - transaction.quantity);
        await tx.listing.update({
          where: { id: transaction.listingId },
          data: {
            quantityAvailable: remaining,
            availabilityStatus: remaining === 0 ? 'unavailable' : transaction.listing.availabilityStatus,
          },
        });
      }

      // Upsert payment record
      await tx.payment.upsert({
        where: { transactionId: transaction.id },
        create: {
          transactionId: transaction.id,
          method: 'cash',
          status: 'recorded',
        },
        update: {
          status: 'recorded',
        },
      });

      return tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'in_progress' },
        include: {
          buyer: { include: { profile: true } },
          seller: { include: { profile: true } },
          payment: true,
        },
      });
    });

    eventBus.emit('deal.accepted', {
      transactionId: updated.id,
      listingId: updated.listingId,
      buyerId: updated.buyerId,
      sellerId: updated.sellerId,
      quantity: updated.quantity,
    });

    return { transaction: this.formatTransaction(updated) };
  }

  public static async declineTransaction(transactionId: string, callerUserId: string, reason?: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status !== 'pending') {
      throw new ConflictError('Only pending transactions can be declined', ErrorCode.INVALID_STATE);
    }

    if (callerUserId !== transaction.sellerId && callerUserId !== transaction.buyerId) {
      throw new ForbiddenError('You are not a participant in this deal');
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'cancelled',
        cancelReason: reason || 'Declined by counterparty',
        cancelledById: callerUserId,
      },
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
        payment: true,
      },
    });

    return { transaction: this.formatTransaction(updated) };
  }

  public static async confirmTransaction(transactionId: string, callerUserId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
      },
    });

    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status !== 'in_progress') {
      throw new ConflictError('Transaction must be in progress to confirm completion', ErrorCode.INVALID_STATE);
    }

    const isBuyer = callerUserId === transaction.buyerId;
    const isSeller = callerUserId === transaction.sellerId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenError('You are not a participant in this deal');
    }

    const now = new Date();
    const updateData: Prisma.TransactionUpdateInput = {};

    if (isBuyer) {
      updateData.buyerConfirmed = true;
      updateData.buyerConfirmedAt = now;
    }

    if (isSeller) {
      updateData.sellerConfirmed = true;
      updateData.sellerConfirmedAt = now;
    }

    const willBeCompleted =
      (isBuyer && transaction.sellerConfirmed) || (isSeller && transaction.buyerConfirmed);

    if (willBeCompleted) {
      updateData.status = 'completed';
      updateData.completedAt = now;
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
        payment: true,
      },
    });

    if (willBeCompleted) {
      eventBus.emit('deal.completed', {
        transactionId: updated.id,
        buyerId: updated.buyerId,
        sellerId: updated.sellerId,
      });
    }

    return { transaction: this.formatTransaction(updated) };
  }

  public static async cancelTransaction(transactionId: string, callerUserId: string, reason: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { listing: true },
    });

    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status === 'completed' || transaction.status === 'cancelled') {
      throw new ConflictError(`Cannot cancel a ${transaction.status} transaction`, ErrorCode.INVALID_STATE);
    }

    const isBuyer = callerUserId === transaction.buyerId;
    const isSeller = callerUserId === transaction.sellerId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenError('You are not a participant in this deal');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Restore quantity if was in progress
      if (transaction.status === 'in_progress' && transaction.listingId && transaction.listing) {
        await tx.listing.update({
          where: { id: transaction.listingId },
          data: {
            quantityAvailable: { increment: transaction.quantity },
            availabilityStatus: 'available',
          },
        });
      }

      return tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'cancelled',
          cancelReason: reason,
          cancelledById: callerUserId,
        },
        include: {
          buyer: { include: { profile: true } },
          seller: { include: { profile: true } },
          payment: true,
        },
      });
    });

    eventBus.emit('deal.cancelled', {
      transactionId: updated.id,
      listingId: updated.listingId,
      cancelledById: callerUserId,
      reason,
      quantity: updated.quantity,
    });

    return { transaction: this.formatTransaction(updated) };
  }

  public static async getTransactionById(transactionId: string, callerUserId: string, isAdmin = false) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
        payment: true,
      },
    });

    if (!transaction) throw new NotFoundError('Transaction not found');

    const isParticipant = callerUserId === transaction.buyerId || callerUserId === transaction.sellerId;

    if (!isParticipant && !isAdmin) {
      throw new ForbiddenError('You are not authorized to view this transaction');
    }

    return { transaction: this.formatTransaction(transaction) };
  }

  public static async getTransactions(callerUserId: string, query: TransactionsQueryInput) {
    const { page, limit, role, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (role === 'buyer') {
      where.buyerId = callerUserId;
    } else if (role === 'seller') {
      where.sellerId = callerUserId;
    } else {
      where.OR = [{ buyerId: callerUserId }, { sellerId: callerUserId }];
    }

    if (status) {
      where.status = status;
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { include: { profile: true } },
          seller: { include: { profile: true } },
          payment: true,
        },
      }),
    ]);

    const items = transactions.map((t) => this.formatTransaction(t));

    return {
      transactions: items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }
}
