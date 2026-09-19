import { FastifyRequest, FastifyReply } from 'fastify';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, email, password } = request.body as any;

  if (!password || (!username && !email)) {
    console.log('Login failed: missing fields', { username, email, password });
    return reply.code(400).send({ message: 'Username/Email and password are required' });
  }

  const queryConditions: any[] = [];
  if (username) queryConditions.push({ username: username.trim().toLowerCase() });
  if (email) queryConditions.push({ email: email.trim().toLowerCase() });

  const user = await User.findOne({ $or: queryConditions });

  console.log('Login attempt:', { username, email, foundUser: !!user });

  if (!user) {
    return reply.code(401).send({ message: 'Invalid credentials' });
  }

  const isValid = await argon2.verify(user.password, password);
  
  if (!isValid) {
    return reply.code(401).send({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  return reply.send({
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role
    }
  });
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const reqUser = (request as any).user;
  const user = await User.findById(reqUser.id).select('-password');
  
  if (!user) {
    return reply.code(404).send({ message: 'User not found' });
  }
  
  return reply.send({ 
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role
    } 
  });
};
