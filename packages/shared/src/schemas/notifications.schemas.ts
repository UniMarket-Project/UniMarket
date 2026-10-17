import { z } from 'zod';
import { NotificationType } from '../enums';

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1),
  message: z.string().optional(),
  data: z.record(z.unknown()).default({}),
  isRead: z.boolean().default(false),
  readAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const notificationCreationSchema = z.object({
  userId: z.string(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1),
  message: z.string().optional(),
});