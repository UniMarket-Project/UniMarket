import { prisma } from "../../platform/database/prisma.client.js";
import { NotFoundError } from "../../platform/errors/http-errors.js";
import type { NotificationsQueryInput } from "@unimarket/shared";

export class NotificationsService {
  public static async getNotifications(
    userId: string,
    query: NotificationsQueryInput,
  ) {
    const { page, limit, unreadOnly } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [total, notifications, unreadCount] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    const items = notifications.map((n) => ({
      notificationId: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: (n.data as Record<string, unknown>) ?? {},
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));

    return {
      notifications: items,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }

  public static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) throw new NotFoundError("Notification not found");

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return {
      notificationId: updated.id,
      isRead: updated.isRead,
    };
  }

  public static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { updated: result.count };
  }
}
