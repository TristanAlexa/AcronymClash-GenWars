import { io, Socket } from 'socket.io-client';

let socket: Socket;

// An empty string tells socket.io to connect to the host that served the page.
// This makes the connection seamless for both local development and deployment
// without needing to manage environment variables on the client-side.
const SERVER_URL = '';

export const connect = () => {
    if (socket && socket.connected) {
        return;
    }
    socket = io(SERVER_URL);

    socket.on('connect', () => {
        console.log('Connected to server with id:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
};

export const disconnect = () => {
    if (socket) {
        socket.disconnect();
    }
};

export const emit = (event: string, data: any) => {
    if (socket) {
        socket.emit(event, data);
    }
};

export const on = (event: string, fn: (...args: any[]) => void) => {
    if (socket) {
        // Remove existing listener before adding new one to prevent duplicates
        socket.off(event, fn);
        socket.on(event, fn);
    }
};

export const getSocketId = (): string | undefined => {
    return socket?.id;
};