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

export const createNotification = async (request: FastifyRequest, reply: FastifyReply) => {
  const { title, message, type, audience } = request.body as any;
  const { User } = await import('../models/User.js');
  
  let targetUsers = [];
  if (audience === 'ALL') {
    targetUsers = await User.find();
  } else if (audience === 'STUDENTS') {
    targetUsers = await User.find({ role: 'STUDENT' });
  } else {
    targetUsers = await User.find(); // Default to all
  }

  const notifications = targetUsers.map(u => ({
    user: u._id,
    content: `**${title}**\n${message}`,
    type: type || 'EVENT',
    isRead: false
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return reply.send({ success: true, sentTo: notifications.length });
};
