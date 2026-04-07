import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tactical_secret_key_2024';

export class SocketService {
  private static io: Server;

  static initialize(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST'],
      },
    });

    // Authentication Middleware for Socket.IO
    this.io.use(async (socket: Socket, next) => {
      try {
        const auth = socket.handshake.auth.token || socket.handshake.headers.authorization;
        if (!auth) {
          return next(new Error('Authentication error: No token provided'));
        }

        const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
        
        // Verify JWT
        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
          if (err) {
            return next(new Error('Authentication error: Invalid token'));
          }
          (socket as any).user = decoded;
          next();
        });
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket] User connected: ${socket.id}`);

      // Room Subscriptions
      socket.on('subscribe:device', (deviceId: string) => {
        socket.join(`device:${deviceId}`);
        console.log(`[Socket] Client subscribed to device:${deviceId}`);
      });

      socket.on('subscribe:alerts', () => {
        socket.join('alerts:feed');
        console.log(`[Socket] Client subscribed to alerts:feed`);
      });

      // Client Action Listeners
      socket.on('alert:acknowledge', (alertId: string) => {
        console.log(`[Socket] Alert Acknowledged: ${alertId}`);
        // Simple broadcast for now, actual DB update happens via REST
        this.emitToRoom('alerts:feed', 'alert:updated', { alertId, status: 'ACKNOWLEDGED' });
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${socket.id}`);
      });
    });
  }

  static emitToRoom(room: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  static broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  static emitToDevice(deviceId: string, event: string, data: any) {
    this.emitToRoom(`device:${deviceId}`, event, data);
  }
}
