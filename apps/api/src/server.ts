import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  // Load environment variables before anything else
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

  const { connectDatabase } = await import('./config/database.js');
  const { default: http } = await import('node:http');
  const { Server } = await import('socket.io');
  const { app } = await import('./app.js');
  const { verifyToken } = await import('./utils/auth.js');

  const PORT = Number(process.env.PORT ?? 4000);
  const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

  await connectDatabase();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token;
    const cookieHeader = socket.handshake.headers.cookie ?? '';
    const cookieToken = cookieHeader
      .split('; ')
      .find((c: string) => c.startsWith('token='))
      ?.split('=')[1];
    const token = authToken ?? cookieToken;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Invalid token'));
    }

    socket.data.user = payload;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id} (user: ${socket.data.user?.userId})`);

    socket.on('join-event', (eventId: string) => {
      // Verify user has access to this event
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
