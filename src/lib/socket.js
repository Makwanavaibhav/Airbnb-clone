import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Socket instance with autoConnect=false so we can attach the JWT token
 * before connecting. Call connectSocket(token) once the user is authenticated.
 */
export const socket = io(URL, {
  autoConnect: false,
  auth: {
    token: null,  // will be set by connectSocket()
  },
});

/**
 * (Re-)connect the socket with the current JWT so the server middleware
 * can authenticate the connection and set socket.userId.
 */
export function connectSocket(token) {
  if (!token) return;
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}
