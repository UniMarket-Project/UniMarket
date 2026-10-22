import { eventBus } from "../../platform/events/event-bus.js";
import { prisma } from "../../platform/database/prisma.client.js";

export function registerNotificationSubscribers(): void {
  eventBus.on("verification.decided", async ({ userId, status, reason }) => {
    const isApproved = status === "verified";
    await prisma.notification.create({
      data: {
        userId,
        type: "verification_result",
        title: isApproved ? "Verification Approved! 🎉" : "Verification Update",
        message: isApproved
          ? "Your campus ID verification has been approved. You can now create listings, requests, and complete deals!"
          : `Your verification request was rejected. Reason: ${reason || "Details could not be verified"}.`,
        data: { status, reason },
      },
    });
  });

  eventBus.on(
    "message.sent",
    async ({ messageId, senderId, recipientId, listingId, requestId }) => {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { firstName: true, lastName: true },
      });

      const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`.trim()
        : "Someone";

      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "new_message",
          title: "New message",
          message: `${senderName} sent you a message.`,
          data: { messageId, senderId, listingId, requestId },
        },
      });
    },
  );

  eventBus.on("deal.created", async ({ transactionId, buyerId, sellerId }) => {
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: { firstName: true, lastName: true },
    });

    await prisma.notification.create({
      data: {
        userId: sellerId,
        type: "deal_update",
        title: "New deal request! 🤝",
        message: `${buyer?.firstName ?? "A buyer"} initiated a deal with you. Tap to review and accept.`,
        data: { transactionId },
      },
    });
  });

  eventBus.on("deal.accepted", async ({ transactionId, buyerId }) => {
    await prisma.notification.create({
      data: {
        userId: buyerId,
        type: "deal_update",
        title: "Deal accepted! 🎉",
        message:
          "Your deal has been accepted by the seller. Meet safely in public campus areas.",
        data: { transactionId },
      },
    });
  });

  eventBus.on(
    "deal.completed",
    async ({ transactionId, buyerId, sellerId }) => {
      const title = "Deal completed! Rate your experience ⭐";
      const message =
        "Your deal is complete. Please leave a review to build campus trust.";

      await prisma.notification.createMany({
        data: [
          {
            userId: buyerId,
            type: "deal_update",
            title,
            message,
            data: { transactionId },
          },
          {
            userId: sellerId,
            type: "deal_update",
            title,
            message,
            data: { transactionId },
          },
        ],
      });
    },
  );

  eventBus.on(
    "deal.cancelled",
    async ({ transactionId, cancelledById, reason }) => {
      const txn = await prisma.transaction.findUnique({
        where: { id: transactionId },
        select: { buyerId: true, sellerId: true },
      });

      if (txn) {
        const recipientId =
          cancelledById === txn.buyerId ? txn.sellerId : txn.buyerId;
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "deal_update",
            title: "Deal cancelled",
            message: `The deal was cancelled. Reason: ${reason}`,
            data: { transactionId },
          },
        });
      }
    },
  );

  eventBus.on("review.created", async ({ revieweeId, rating }) => {
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        type: "rating_received",
        title: "New review received! ⭐",
        message: `You received a ${rating}-star review for a completed deal.`,
        data: { rating },
      },
    });
  });

  eventBus.on("user.suspended", async ({ userId, reason, suspensionUntil }) => {
    await prisma.notification.create({
      data: {
        userId,
        type: "account_suspended",
        title: "Account status update",
        message: `Your account was suspended. Reason: ${reason}. ${
          suspensionUntil
            ? `Until: ${suspensionUntil.toLocaleDateString()}`
            : "Permanent."
        }`,
        data: { reason, suspensionUntil },
      },
    });
  });
}
