import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getLeaves, createLeave, updateLeave } from '../controllers/leaveController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getLeaves);
  fastify.post('/', createLeave);
  fastify.patch('/:id', updateLeave);
}
