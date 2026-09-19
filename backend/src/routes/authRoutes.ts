import { FastifyInstance } from 'fastify';
import { login, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

export default async function (fastify: FastifyInstance) {
  fastify.post('/login', login);
  fastify.get('/me', { preHandler: verifyToken }, getMe);
}
