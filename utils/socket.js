import { io } from "socket.io-client";

// connect to your Render backend
export const socket = io("https://codex-build-backend.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});
