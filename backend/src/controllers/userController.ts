import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models/User.js';
import { Timetable } from '../models/Timetable.js';

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await User.find().select('-password');
  return reply.send(users);
};

export const getStaff = async (request: FastifyRequest, reply: FastifyReply) => {
  const staff = await User.find({ role: 'STAFF' }).select('-password');
  return reply.send(staff);
};

export const getFreeStaff = async (request: FastifyRequest, reply: FastifyReply) => {
  const { day, period } = request.query as { day?: string, period?: string };
  
  if (!day || !period) {
    return reply.code(400).send({ error: 'day and period query params are required' });
  }

  // Find busy staff IDs for that slot
  const busyTimetables = await Timetable.find({ day, period: Number(period) } as any).select('staff');
  const busyStaffIds = busyTimetables.map((t: any) => t.staff).filter(Boolean);

  // Find staff who are NOT in busyStaffIds
  const freeStaff = await User.find({
    role: 'STAFF',
    _id: { $nin: busyStaffIds }
  }).select('-password');

  return reply.send(freeStaff);
};
