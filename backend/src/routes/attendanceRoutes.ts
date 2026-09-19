import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getAttendance, markAttendance } from '../controllers/attendanceController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getAttendance);
  fastify.post('/', markAttendance);
}
