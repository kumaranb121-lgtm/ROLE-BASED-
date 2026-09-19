import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export let globalIo: Server | null = null;

export const initializeSockets = (io: Server) => {
  globalIo = io;
  // Middleware for auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    
    // Join private room
    socket.join(`user:${user.id}`);
    
    // Join role room
    socket.join(`role:${user.role.toLowerCase()}`);

    socket.on('join_class', (classId) => {
      socket.join(`class:${classId}`);
    });

    socket.on('leave_class', (classId) => {
      socket.leave(`class:${classId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });

  return io;
};
