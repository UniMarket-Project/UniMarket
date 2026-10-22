import { prisma } from '../../platform/database/prisma.client.js';
import { BadRequestError, NotFoundError } from '../../platform/errors/http-errors.js';
import { eventBus } from '../../platform/events/event-bus.js';
import type { SendMessageInput, ConversationThreadQueryInput } from '@unimarket/shared';

export class MessagesService {
  public static async sendMessage(senderId: string, input: SendMessageInput) {
    if (senderId === input.recipientId) {
      throw new BadRequestError('You cannot send a message to yourself');
    }

    const recipient = await prisma.user.findUnique({
      where: { id: input.recipientId },
      select: { id: true, isDeleted: true },
    });

    if (!recipient || recipient.isDeleted) {
      throw new NotFoundError('Recipient not found');
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId: input.recipientId,
        content: input.content,
        listingId: input.listingId,
        requestId: input.requestId,
        transactionId: input.transactionId,
      },
      include: {
        listing: { select: { id: true, title: true } },
        request: { select: { id: true, title: true } },
        transaction: { select: { id: true, title: true } },
      },
    });

    eventBus.emit('message.sent', {
      messageId: message.id,
      senderId,
      recipientId: input.recipientId,
      listingId: input.listingId,
      requestId: input.requestId,
    });

    let context = undefined;
    if (message.listing) {
      context = { type: 'listing' as const, id: message.listing.id, title: message.listing.title };
    } else if (message.request) {
      context = { type: 'request' as const, id: message.request.id, title: message.request.title };
    } else if (message.transaction) {
      context = { type: 'transaction' as const, id: message.transaction.id, title: message.transaction.title };
    }

    return {
      message: {
        messageId: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        context,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      },
    };
  }

  public static async listConversations(userId: string, page = 1, limit = 20) {
    // Find all distinct other participants
    const partners = await prisma.$queryRaw<Array<{ partner_id: string; last_message_at: Date }>>`
      SELECT 
        CASE WHEN sender_id = ${userId}::uuid THEN recipient_id ELSE sender_id END AS partner_id,
        MAX(created_at) AS last_message_at
      FROM messages
      WHERE sender_id = ${userId}::uuid OR recipient_id = ${userId}::uuid
      GROUP BY partner_id
      ORDER BY last_message_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    const totalCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT CASE WHEN sender_id = ${userId}::uuid THEN recipient_id ELSE sender_id END) as count
      FROM messages
      WHERE sender_id = ${userId}::uuid OR recipient_id = ${userId}::uuid
    `;

    const total = Number(totalCountResult[0]?.count ?? 0);

    const conversations = await Promise.all(
      partners.map(async ({ partner_id }) => {
        const partner = await prisma.user.findUnique({
          where: { id: partner_id },
          include: { profile: true },
        });

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, recipientId: partner_id },
              { senderId: partner_id, recipientId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: partner_id,
            recipientId: userId,
            isRead: false,
          },
        });

        return {
          user: {
            userId: partner?.id ?? partner_id,
            firstName: partner?.firstName ?? 'User',
            lastName: partner?.lastName ?? '',
            avatarUrl: partner?.profile?.avatarUrl ?? null,
            verificationStatus: partner?.verificationStatus ?? 'unverified',
          },
          lastMessage: {
            messageId: lastMessage?.id ?? '',
            content: lastMessage?.content ?? '',
            senderId: lastMessage?.senderId ?? '',
            createdAt: lastMessage?.createdAt.toISOString() ?? new Date().toISOString(),
            isRead: lastMessage?.isRead ?? true,
          },
          unreadCount,
        };
      })
    );

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        hasMore: (page - 1) * limit + conversations.length < total,
      },
    };
  }

  public static async getThread(userId: string, partnerId: string, query: ConversationThreadQueryInput) {
    const { page, limit, after } = query;
    const skip = (page - 1) * limit;

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      include: { profile: true },
    });

    if (!partner || partner.isDeleted) {
      throw new NotFoundError('User not found');
    }

    const where: any = {
      OR: [
        { senderId: userId, recipientId: partnerId },
        { senderId: partnerId, recipientId: userId },
      ],
    };

    if (after) {
      where.createdAt = { gt: new Date(after) };
    }

    const [total, messages] = await Promise.all([
      prisma.message.count({ where }),
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          listing: { select: { id: true, title: true } },
          request: { select: { id: true, title: true } },
          transaction: { select: { id: true, title: true } },
        },
      }),
    ]);

    // Mark incoming messages as read asynchronously
    prisma.message
      .updateMany({
        where: {
          senderId: partnerId,
          recipientId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })
      .catch(() => {});

    const formattedMessages = messages.map((m) => {
      let context = undefined;
      if (m.listing) context = { type: 'listing' as const, id: m.listing.id, title: m.listing.title };
      else if (m.request) context = { type: 'request' as const, id: m.request.id, title: m.request.title };
      else if (m.transaction) context = { type: 'transaction' as const, id: m.transaction.id, title: m.transaction.title };

      return {
        messageId: m.id,
        senderId: m.senderId,
        recipientId: m.recipientId,
        content: m.content,
        context,
        isRead: m.isRead,
        readAt: m.readAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      };
    });

    return {
      user: {
        userId: partner.id,
        firstName: partner.firstName,
        lastName: partner.lastName,
        avatarUrl: partner.profile?.avatarUrl ?? null,
        verificationStatus: partner.verificationStatus,
        averageRating: partner.profile?.averageRating ?? 0,
        totalRatings: partner.profile?.totalRatings ?? 0,
        totalTransactions: partner.profile?.totalTransactions ?? 0,
      },
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + messages.length < total,
      },
    };
  }

  public static async getUnreadCount(userId: string) {
    const unreadCount = await prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return { unreadCount };
  }
}
