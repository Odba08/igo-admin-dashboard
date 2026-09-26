import { io } from 'socket.io-client';

const rawUrl = process.env.REACT_APP_API_URL || 'https://igoback.onrender.com';
const SOCKET_URL = rawUrl.replace(/\/api\/?$/, '');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('⚡ Conectado a WebSockets del Backend IgoBack:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado de WebSockets');
    });
  }
  return socket;
};

export default getSocket;
