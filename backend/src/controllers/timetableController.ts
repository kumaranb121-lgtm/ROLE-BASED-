import { FastifyRequest, FastifyReply } from 'fastify';
import { Timetable } from '../models/Timetable.js';
import '../models/Subject.js';
import '../models/Class.js';

export const getTimetables = async (request: FastifyRequest, reply: FastifyReply) => {
  const { classId, staffId } = request.query as any;
  const filter: any = {};
  if (classId) filter.classId = classId;
  if (staffId) filter.staff = staffId;
  
  const timetables = await Timetable.find(filter)
    .populate('subject')
    .populate('staff', 'name')
    .populate({ path: 'classId', populate: { path: 'advisor', select: 'name' } });
    
  return reply.send(timetables);
};

export const updateTimetable = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const updates = request.body as any;

  const timetable = await Timetable.findByIdAndUpdate(id, updates, { new: true })
    .populate('subject')
    .populate('staff', 'name');

  if (!timetable) {
    return reply.code(404).send({ message: 'Timetable entry not found' });
  }

  // Socket.IO event can be emitted here using a global or injected instance if needed

  return reply.send(timetable);
};
