import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>()((set, get) => ({
  socket: null,
  connect: (token: string) => {
    if (get().socket) return;
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const newSocket = io(API_URL, {
      auth: { token },
    });

    set({ socket: newSocket });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
