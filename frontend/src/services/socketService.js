import { io } from 'socket.io-client';
import { authService } from './authService';

let socket;

export const socketService = {
    connect: () => {
        if (socket && socket.connected) return socket;

        const token = authService.getToken();
        if (!token) return null;

        const socketUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;
        socket = io(socketUrl, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        return socket;
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    getSocket: () => {
        if (!socket) {
            return socketService.connect();
        }
        return socket;
    },

    on: (eventName, callback) => {
        if (!socket) socketService.connect();
        if (socket) socket.on(eventName, callback);
    },

    emit: (eventName, data) => {
        if (!socket) socketService.connect();
        if (socket) socket.emit(eventName, data);
    },

    off: (eventName) => {
        if (socket) socket.off(eventName);
    }
};
