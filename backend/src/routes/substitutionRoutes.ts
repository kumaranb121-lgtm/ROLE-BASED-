import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/auth.js';
import { getSubstitutions, createSubstitution, acceptSubstitution, declineSubstitution } from '../controllers/substitutionController.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyToken);
  fastify.get('/', getSubstitutions);
  fastify.post('/', createSubstitution);
  fastify.post('/:id/accept', acceptSubstitution);
  fastify.post('/:id/decline', declineSubstitution);
}
