import { io } from "socket.io-client";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://codex-build-backend.onrender.com";

export const socket = io(BACKEND, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
});
