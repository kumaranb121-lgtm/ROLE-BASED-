import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../models/User.js';

export const subscribe = async (request: FastifyRequest, reply: FastifyReply) => {
  const subscription = request.body;
  const user = (request as any).user;

  try {
    // Check if subscription already exists to avoid duplicates
    const dbUser = await User.findById(user.id);
    if (!dbUser) return reply.code(404).send({ error: 'User not found' });
    
    // Simplistic check: if exact endpoint is already there, ignore
    const exists = dbUser.pushSubscriptions.some((sub: any) => sub.endpoint === (subscription as any).endpoint);
    if (!exists) {
      dbUser.pushSubscriptions.push(subscription);
      await dbUser.save();
    }
    
    return reply.code(201).send({});
  } catch (err) {
    return reply.code(500).send({ error: 'Failed to subscribe' });
  }
};
