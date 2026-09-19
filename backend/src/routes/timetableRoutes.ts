import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getTimetables, updateTimetable } from '../controllers/timetableController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getTimetables);
  fastify.patch('/:id', updateTimetable);
}
