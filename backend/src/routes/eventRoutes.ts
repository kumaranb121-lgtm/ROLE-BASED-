import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getEvents, getEventById, createEvent } from '../controllers/eventController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getEvents);
  fastify.get('/:id', getEventById);
  fastify.post('/', createEvent);
}
