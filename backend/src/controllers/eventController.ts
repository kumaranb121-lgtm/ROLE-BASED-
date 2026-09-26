import { FastifyRequest, FastifyReply } from 'fastify';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { globalIo } from '../sockets/index.js';

export const getEvents = async (request: FastifyRequest, reply: FastifyReply) => {
  const events = await Event.find().sort({ createdAt: -1 });
  // Could filter out expired events here using date logic, but sending all for now.
  return reply.send(events);
};

export const getEventById = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const event = await Event.findById(id);
  if (!event) return reply.code(404).send({ error: 'Event not found' });
  return reply.send(event);
};

export const createEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const { title, date, time, location, audience, poster } = request.body as any;
  const user = (request as any).user;

  const event = new Event({ title, date, time, location, audience, poster, createdBy: user.id });
  await event.save();

  let targetUsers = [];
  if (audience === 'ALL') {
    targetUsers = await User.find({ _id: { $ne: user.id } });
  } else if (audience === 'STUDENTS') {
    targetUsers = await User.find({ role: 'STUDENT', _id: { $ne: user.id } });
  } else if (audience === 'STAFF') {
    targetUsers = await User.find({ role: 'STAFF', _id: { $ne: user.id } });
  } else {
    targetUsers = await User.find({ _id: { $ne: user.id } }); // Default to all
  }

  const notifications = targetUsers.map(u => ({
    user: u._id,
    content: `New Event: ${title} on ${date} at ${time}`,
    type: 'EVENT',
    relatedId: event._id,
    isRead: false
  }));

  if (notifications.length > 0) {
    const inserted = await Notification.insertMany(notifications);
    if (globalIo) {
      if (audience === 'ALL') {
        globalIo.emit('new_notification', inserted[0]);
      } else if (audience === 'STAFF') {
        globalIo.to('role:STAFF').emit('new_notification', inserted[0]);
      } else if (audience === 'STUDENTS') {
        globalIo.to('role:STUDENT').emit('new_notification', inserted[0]);
      }
    }
  }

  return reply.send(event);
};
