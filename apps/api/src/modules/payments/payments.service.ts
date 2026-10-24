import { prisma } from '../../platform/database/prisma.client.js';
import { NotFoundError, ForbiddenError } from '../../platform/errors/http-errors.js';
import type { RecordOfflinePaymentInput } from '@unimarket/shared';

export class PaymentsService {
  public static async recordOfflinePayment(callerUserId: string, input: RecordOfflinePaymentInput) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
      include: { payment: true },
    });

    if (!transaction) throw new NotFoundError('Transaction not found');

    if (callerUserId !== transaction.buyerId && callerUserId !== transaction.sellerId) {
      throw new ForbiddenError('You are not authorized to update payment details for this transaction');
    }

    const payment = await prisma.payment.upsert({
      where: { transactionId: input.transactionId },
      create: {
        transactionId: input.transactionId,
        method: input.method,
        status: 'recorded',
        notes: input.notes,
      },
      update: {
        method: input.method,
        notes: input.notes,
      },
    });

    return {
      payment: {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        method: payment.method,
        status: payment.status,
        notes: payment.notes,
      },
      escrowProtected: false,
    };
  }
}
