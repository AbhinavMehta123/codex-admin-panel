"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { socket } from "@/utils/socket";

// Update this to your actual production URL
const API_BASE = "https://codex-build-backend.onrender.com/api";

export default function AdminDashboard() {
  const [status, setStatus] = useState({ isActive: false, startTime: null });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Initial Data Fetch
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/hackathon/status`);
        setStatus(res.data);
      } catch (err) {
        console.error("Status fetch error:", err);
      }
    };
    fetchStatus();

    // 2. Socket Listeners
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    socket.on("hackathon_started", (data) => {
      setStatus({ isActive: true, startTime: data.startTime });
    });

    socket.on("hackathon_stopped", () => {
      setStatus({ isActive: false, startTime: null });
      setTimeLeft(0);
    });

    socket.on("timer_update", (remaining) => setTimeLeft(remaining));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("hackathon_started");
      socket.off("hackathon_stopped");
      socket.off("timer_update");
    };
  }, []);

  // API Control Functions
  const handleAction = async (endpoint, socketEvent, successMsg, duration = null) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/hackathon/${endpoint}`);
      if (res.status === 200) {
        socket.emit(socketEvent, duration);
        alert(successMsg);
      }
    } catch (err) {
      console.error(`Error during ${endpoint}:`, err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || "Action failed. Check console."}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-[#ffcc8f] mb-8 text-center"
      >
        CODEX Admin Control Panel
      </motion.h1>

      <div className="bg-white/5 p-8 rounded-2xl border border-[#e99b63]/30 text-center w-full max-w-md backdrop-blur-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Status: <span className={status.isActive ? "text-green-400" : "text-red-400"}>
            {status.isActive ? "Running" : "Stopped"}
          </span>
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          {isConnected ? "🟢 Socket Connected" : "🔴 Socket Disconnected"}
        </p>

        <div className="text-6xl font-mono text-[#ffcc8f] mb-6 tabular-nums">
          {status.isActive ? formatTime(timeLeft) : "--:--:--"}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleAction("start", "start_hackathon", "🚀 Timer Started!", 110 * 60)}
              disabled={status.isActive || loading}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-black transition-all ${
                status.isActive ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-[#e99b63] to-[#ffcc8f] active:scale-95"
              }`}
            >
              ▶ Start
            </button>

            <button
              onClick={() => handleAction("stop", "stop_hackathon", "🛑 Timer Stopped!")}
              disabled={!status.isActive || loading}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-black transition-all ${
                !status.isActive ? "bg-gray-600 cursor-not-allowed" : "bg-[#e99b63] active:scale-95"
              }`}
            >
              Stop
            </button>
          </div>

          <hr className="border-white/10 my-2" />

          {/* Response Controls */}
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleAction("allow-responses", "allow_responses", "✅ Submissions Opened!")}
              disabled={loading}
              className="bg-green-500/80 hover:bg-green-400 text-black font-bold py-3 rounded-lg tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              ✅ Allow Submissions
            </button>

            <button
              onClick={() => handleAction("stop-responses", "stop_responses", "🔒 Submissions Locked!")}
              disabled={loading}
              className="bg-red-500/80 hover:bg-red-400 text-black font-bold py-3 rounded-lg tracking-widest transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              🛑 Stop Submissions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}