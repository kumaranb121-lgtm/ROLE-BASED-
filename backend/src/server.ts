import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Load routes
import authRoutes from './routes/authRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import substitutionRoutes from './routes/substitutionRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { initializeSockets } from './sockets/index.js';

dotenv.config();

const app = fastify({ logger: true });

// Middleware
app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
app.register(helmet);
app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Routes
app.register(authRoutes, { prefix: '/api/auth' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(timetableRoutes, { prefix: '/api/timetables' });
app.register(substitutionRoutes, { prefix: '/api/substitutions' });
app.register(leaveRoutes, { prefix: '/api/leave' });
app.register(notificationRoutes, { prefix: '/api/notifications' });
app.register(messageRoutes, { prefix: '/api/messages' });
app.register(pushRoutes, { prefix: '/api/push' });
app.register(attendanceRoutes, { prefix: '/api/attendance' });
app.register(reportRoutes, { prefix: '/api/reports' });

const start = async () => {
  try {
    await connectDB();
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    
    const io = new Server(app.server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
    });
    
    initializeSockets(io);
    
    app.log.info(`Server listening on ${app.server.address()}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
