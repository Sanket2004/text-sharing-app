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
  usernameTaken: false,
  loading: false,

  checkUsername: (roomId, username) => {
    return new Promise((resolve) => {
      set({ loading: true });
      socket.emit("usernameTaken", { roomId, username }, (isTaken) => {
        set({ usernameTaken: isTaken, loading: false });
        resolve(isTaken); // now it can be awaited
      });
    });
  },

  joinRoom: (roomId, username) => {
    if (!roomId || !username) {
      toast.error("Please enter a room ID and username.");
      return;
    }
    if (roomId.length < 3) {
      toast.error("Room ID must be at least 3 characters long.");
      return;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    set({ loading: true });
    socket.emit("joinRoom", { roomId, username });
    set({ roomId, username });
  },

  leaveRoom: () => {
    const { roomId } = get();
    socket.emit("leaveRoom", roomId);
    set({ roomId: null, messages: [], loading: false });
  },

  sendMessage: (message) => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    const { roomId } = get();
    set({ loading: true });
    socket.emit("sendMessage", { roomId, message });
    set({ loading: false });
  },

  setMessages: (messages) => set({ messages, loading: false }),

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
  useChatStore.getState().setError(error);
  useChatStore.getState().set({ loading: false });
});

