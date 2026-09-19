import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/:conversationId', getMessages);
  fastify.post('/', sendMessage);
}
