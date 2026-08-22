import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';

let io: SocketIOServer;

const userSockets = new Map<string, string>();

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    try {
      const decoded: any = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.userId;
    userSockets.set(userId, socket.id);
    
    socket.on('disconnect', () => {
      userSockets.delete(userId);
    });
  });

  return io;
};

export const emitToUser = (userId: string | any, eventName: string, data: any) => {
  if (!io) return;
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(eventName, data);
  }
};
