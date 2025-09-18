// WebSocket authentication
import jwt from 'jsonwebtoken';
import { Socket } from "socket.io";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function socketAuth(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const token =
      socket.handshake.auth.token ??
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) throw new Error("No token supplied");

    // Decode JWT token directly (same as existing auth middleware)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    socket.data.user = { userId: decoded.userId };     // matches existing auth pattern
    
    next();
  } catch {
    next(new Error("Authentication failed"));
  }
}
