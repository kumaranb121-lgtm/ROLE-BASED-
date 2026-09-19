import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getNotifications);
  fastify.patch('/:id/read', markAsRead);
}
