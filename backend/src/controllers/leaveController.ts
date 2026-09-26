import { FastifyRequest, FastifyReply } from 'fastify';
import { Leave } from '../models/Leave.js';
import { Notification } from '../models/Notification.js';
import { globalIo } from '../sockets/index.js';
import { sendPushNotification } from '../utils/push.js';
import { User } from '../models/User.js';

export const getLeaves = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  let filter = {};

  if (user.role === 'STAFF') {
    filter = { staff: user.id };
  } // HOD sees all

  const leaves = await Leave.find(filter).populate('staff', 'name').sort({ createdAt: -1 });
  return reply.send(leaves);
};

export const createLeave = async (request: FastifyRequest, reply: FastifyReply) => {
  const { date, reason, proofImage } = request.body as any;
  const user = (request as any).user;

  const leave = new Leave({ staff: user.id, date, reason, proofImage });
  await leave.save();

  const hods = await User.find({ role: 'HOD' });
  for (const hod of hods) {
    const notification = await Notification.create({
      user: hod._id,
      type: 'leave_request',
      content: `New leave request from Staff`,
      relatedId: leave._id
    });
    
    if (globalIo) {
      globalIo.to(`role:hod`).emit('new_notification', notification);
    }
    
    const sender = await User.findById(user.id);
    await sendPushNotification(hod.id, {
      title: 'New Leave Request',
      body: `${sender?.name} has requested a leave`,
      url: '/leaves'
    });
  }

  return reply.code(201).send(leave);
};

export const updateLeave = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as any;
  const user = (request as any).user;

  if (user.role !== 'HOD') return reply.code(403).send({ message: 'Forbidden' });

  const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });
  
  if (leave) {
    const notification = await Notification.create({
      user: leave.staff,
      type: 'leave_updated',
      content: `Your leave request has been ${status}`,
      relatedId: leave._id
    });

    if (globalIo) {
      globalIo.to(`user:${leave.staff}`).emit('new_notification', notification);
    }

    const hodUser = await User.findById(user.id);
    await sendPushNotification(leave.staff.toString(), {
      title: 'Leave Status Updated',
      body: `${hodUser?.name} has ${status.toLowerCase()} your leave request`,
      url: '/leaves'
    });
  }

  return reply.send(leave);
};
