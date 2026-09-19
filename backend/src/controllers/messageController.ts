import { FastifyRequest, FastifyReply } from 'fastify';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { globalIo } from '../sockets/index.js';
import { sendPushNotification } from '../utils/push.js';

export const getMessages = async (request: FastifyRequest, reply: FastifyReply) => {
  const { conversationId } = request.params as { conversationId: string };
  const user = (request as any).user;

  const messages = await Message.find({
    $or: [
      { sender: user.id, receiver: conversationId },
      { sender: conversationId, receiver: user.id }
    ]
  }).sort({ createdAt: 1 });

  return reply.send(messages);
};

export const sendMessage = async (request: FastifyRequest, reply: FastifyReply) => {
  const { receiver, content } = request.body as any;
  const user = (request as any).user;

  const message = new Message({
    sender: user.id,
    receiver,
    content
  });
  await message.save();

  // Create notification for receiver
  const notification = await Notification.create({
    user: receiver,
    type: 'new_message',
    content: 'You received a new message',
    relatedId: message._id
  });

  if (globalIo) {
    globalIo.to(`user:${receiver}`).emit('new_message', message);
    globalIo.to(`user:${receiver}`).emit('new_notification', notification);
  }

  // Send Web Push Notification
  const senderUser = await User.findById(user.id);
  await sendPushNotification(receiver, {
    title: `New Message from ${senderUser?.name || 'Someone'}`,
    body: content,
    url: '/messages'
  });

  return reply.code(201).send(message);
};
