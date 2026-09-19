import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getReports } from '../controllers/reportController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getReports);
}
