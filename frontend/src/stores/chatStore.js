import { create } from "zustand";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const socket = io(import.meta.env.VITE_SOCKET_URL);

export const useChatStore = create((set, get) => ({
  socket,
  roomId: null,
  username: "",
  users: [],
  messages: [],

  joinRoom: (roomId, username) => {
    socket.emit("joinRoom", { roomId, username });
    set({ roomId, username });
  },

  leaveRoom: () => {
    const { roomId } = get();
    socket.emit("leaveRoom", roomId);
    set({ roomId: null, messages: [] });
  },

  sendMessage: (message) => {
    const { roomId } = get();
    socket.emit("sendMessage", { roomId, message });
  },

  setMessages: (messages) => set({ messages }),

  setUsers: (users) => set({ users }),

  setError: (error) => set({ error }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
}));

// Setup socket listeners globally
socket.on("receiveMessage", (msg) => {
  useChatStore.getState().addMessage(msg);
});

socket.on("previousMessages", (msgs) => {
  useChatStore.getState().setMessages(msgs);
});

socket.on("users", (users) => {
  useChatStore.getState().setUsers(users);
});

socket.on("error", (error) => {
  toast.error(error);
});
