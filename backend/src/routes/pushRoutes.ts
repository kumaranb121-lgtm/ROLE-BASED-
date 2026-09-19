import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { subscribe } from '../controllers/pushController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.post('/subscribe', subscribe);
}
