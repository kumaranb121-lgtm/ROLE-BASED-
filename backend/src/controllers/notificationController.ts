import { FastifyRequest, FastifyReply } from 'fastify';
import { Notification } from '../models/Notification.js';

export const getNotifications = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const notifications = await Notification.find({ user: user.id }).sort({ createdAt: -1 });
  return reply.send(notifications);
};

export const markAsRead = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const user = (request as any).user;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: user.id },
    { isRead: true },
    { new: true }
  );

  return reply.send(notification);
};
