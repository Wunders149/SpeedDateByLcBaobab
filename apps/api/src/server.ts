import http from 'node:http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

async function start() {
  await connectDatabase();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    socket.on('join-event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`[SOCKET] ${socket.id} joined event:${eventId}`);
    });

    socket.on('leave-event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`[SERVER] API listening on http://localhost:${PORT}`);
    console.log(`[SERVER] CORS origin: ${CLIENT_URL}`);
  });
}

start().catch((error) => {
  console.error('[SERVER] Failed to start:', error);
  process.exit(1);
});
