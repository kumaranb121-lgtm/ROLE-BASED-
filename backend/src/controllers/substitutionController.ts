import { FastifyRequest, FastifyReply } from 'fastify';
import { Substitution } from '../models/Substitution.js';
import { Notification } from '../models/Notification.js';
import { globalIo } from '../sockets/index.js';
import { sendPushNotification } from '../utils/push.js';
import { User } from '../models/User.js';

export const getSubstitutions = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  let filter = {};

  if (user.role === 'STAFF') {
    filter = { $or: [{ fromStaff: user.id }, { toStaff: user.id }] };
  } // HOD sees all

  const substitutions = await Substitution.find(filter)
    .populate('fromStaff', 'name')
    .populate('toStaff', 'name')
    .populate({
      path: 'timetableSlot',
      populate: [
        { path: 'subject' },
        { path: 'classId' }
      ]
    })
    .sort({ createdAt: -1 });

  return reply.send(substitutions);
};

export const createSubstitution = async (request: FastifyRequest, reply: FastifyReply) => {
  const { toStaff, timetableSlot, date, message } = request.body as any;
  const user = (request as any).user;

  const substitution = new Substitution({
    fromStaff: user.id,
    toStaff,
    timetableSlot,
    date,
    message
  });

  await substitution.save();
  
  // Create notification for toStaff
  const notification = await Notification.create({
    user: toStaff,
    type: 'substitution_request',
    content: 'You have a new substitution request',
    relatedId: substitution._id
  });

  if (globalIo) {
    globalIo.to(`user:${toStaff}`).emit('new_notification', notification);
  }

  const senderUser = await User.findById(user.id);
  await sendPushNotification(toStaff, {
    title: 'New Substitution Request',
    body: `${senderUser?.name} has requested a substitution`,
    url: '/substitutions'
  });

  return reply.code(201).send(substitution);
};

export const acceptSubstitution = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const user = (request as any).user;

  const substitution = await Substitution.findById(id);
  if (!substitution) return reply.code(404).send({ message: 'Not found' });
  
  if (substitution.toStaff.toString() !== user.id) {
    return reply.code(403).send({ message: 'Forbidden' });
  }

  substitution.status = 'Accepted';
  await substitution.save();

  const notification = await Notification.create({
    user: substitution.fromStaff,
    type: 'substitution_accepted',
    content: 'Your substitution request was accepted',
    relatedId: substitution._id
  });

  if (globalIo) {
    globalIo.to(`user:${substitution.fromStaff}`).emit('new_notification', notification);
  }

  const toStaffUser = await User.findById(user.id);
  await sendPushNotification(substitution.fromStaff.toString(), {
    title: 'Substitution Accepted',
    body: `${toStaffUser?.name} has accepted your substitution request`,
    url: '/substitutions'
  });

  return reply.send(substitution);
};

export const declineSubstitution = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const user = (request as any).user;

  const substitution = await Substitution.findById(id);
  if (!substitution) return reply.code(404).send({ message: 'Not found' });
  
  if (substitution.toStaff.toString() !== user.id) {
    return reply.code(403).send({ message: 'Forbidden' });
  }

  substitution.status = 'Declined';
  await substitution.save();

  const notification = await Notification.create({
    user: substitution.fromStaff,
    type: 'substitution_declined',
    content: 'Your substitution request was declined',
    relatedId: substitution._id
  });

  if (globalIo) {
    globalIo.to(`user:${substitution.fromStaff}`).emit('new_notification', notification);
  }

  const toStaffUser = await User.findById(user.id);
  await sendPushNotification(substitution.fromStaff.toString(), {
    title: 'Substitution Declined',
    body: `${toStaffUser?.name} has declined your substitution request`,
    url: '/substitutions'
  });

  return reply.send(substitution);
};
