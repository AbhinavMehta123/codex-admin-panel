"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { socket } from "@/utils/socket";

export default function AdminDashboard() {
  const [status, setStatus] = useState({ isActive: false, startTime: null });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Connected to socket:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
      setIsConnected(false);
    });

    socket.on("hackathon_started", (data) => {
      console.log("🚀 Hackathon started:", data);
      setStatus({ isActive: true, startTime: new Date().toISOString() });
    });

    socket.on("hackathon_stopped", () => {
      console.log("🛑 Hackathon stopped");
      setStatus({ isActive: false, startTime: null });
      setTimeLeft(0);
    });

    socket.on("timer_update", (remaining) => {
      setTimeLeft(remaining);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("hackathon_started");
      socket.off("hackathon_stopped");
      socket.off("timer_update");
    };
  }, []);

  useEffect(() => {
    axios
      .get("https://codex-build-backend.onrender.com/api/hackathon/status")
      .then((res) => setStatus(res.data))
      .catch((err) => console.error("Status fetch error:", err));
  }, []);

  const startTimer = async () => {
    try {
      await axios.post("https://codex-build-backend.onrender.com/api/hackathon/start");
      socket.emit("start_hackathon", 110 * 60);
    } catch (err) {
      console.error("Start timer failed:", err);
    }
  };

  const stopTimer = async () => {
    try {
      await axios.post("https://codex-build-backend.onrender.com/api/hackathon/stop");
      socket.emit("stop_hackathon");
    } catch (err) {
      console.error("Stop timer failed:", err);
    }
  };

  // ✅ New: Stop Responses Button Logic
  const stopResponses = async () => {
    try {
      await axios.post("https://codex-build-backend.onrender.com/api/hackathon/stop-responses");
      socket.emit("stop_responses");
      alert("🛑 Participant responses have been stopped.");
    } catch (err) {
      console.error("Failed to stop responses:", err);
      alert("Error: Could not stop responses.");
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-[#ffcc8f] mb-8"
      >
        CODEX Admin Control Panel
      </motion.h1>

      <div className="bg-white/5 p-10 rounded-2xl border border-[#e99b63]/30 text-center w-full max-w-md backdrop-blur-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Status:{" "}
          <span
            className={`${
              status.isActive ? "text-green-400" : "text-red-400"
            }`}
          >
            {status.isActive ? "Running" : "Stopped"}
          </span>
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          {isConnected
            ? "🟢 Connected to server"
            : "🔴 Disconnected — check backend"}
        </p>

        <div className="text-6xl font-mono text-[#ffcc8f] mb-6 tabular-nums">
          {status.isActive ? formatTime(timeLeft) : "--:--:--"}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-6">
            <button
              onClick={startTimer}
              disabled={status.isActive}
              className={`${
                status.isActive
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#e99b63] to-[#ffcc8f]"
              } text-black font-bold py-2 px-6 rounded-lg`}
            >
              ▶ Start 110-min Timer
            </button>

            <button
              onClick={stopTimer}
              disabled={!status.isActive}
              className={`${
                !status.isActive
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#e99b63]"
              } text-black font-bold py-2 px-6 rounded-lg`}
            >
              ⏹ Stop
            </button>
          </div>

          {/* ✅ New Stop Responses Button */}
          <button
            onClick={stopResponses}
            className="w-full bg-red-500/80 hover:bg-red-400 text-black font-bold py-3 rounded-lg tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            🛑 Stop Responses
          </button>
        </div>
      </div>
    </section>
  );
}