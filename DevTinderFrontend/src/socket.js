import { io } from "socket.io-client";
import { VITE_BASE_URL } from "./config";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(VITE_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
