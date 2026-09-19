import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getUsers, getStaff, getFreeStaff } from '../controllers/userController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getUsers);
  fastify.get('/staff', getStaff);
  fastify.get('/free-staff', getFreeStaff);
}
