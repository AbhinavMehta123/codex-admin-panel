"use client";

import { useEffect, useState } from "react";
import { socket } from "@/utils/socket"; // adjust path if needed
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const router = useRouter();
  const [status, setStatus] = useState({ isActive: false, startTime: null });
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  // Fetch current hackathon status
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathon/status`);
        const data = await res.json();
        setStatus(data || { isActive: false });
      } catch (err) {
        console.error("Failed to load hackathon status:", err);
      }
    }

    loadStatus();

    // socket connect debug
    socket.on("connect", () => console.log("🟢 Admin socket connected:", socket.id));
    socket.on("disconnect", () => console.log("🔴 Admin socket disconnected"));

    // optional: react to remote changes
    socket.on("hackathon_started", (startTime) => {
      console.log("Received hackathon_started via socket", startTime);
      setStatus({ isActive: true, startTime });
    });
    socket.on("hackathon_stopped", () => {
      console.log("Received hackathon_stopped via socket");
      setStatus({ isActive: false, startTime: null });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("hackathon_started");
      socket.off("hackathon_stopped");
    };
  }, []);

  // Start hackathon: POST to backend AND emit socket event
  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathon/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to start");
      const startTime = data.startTime || new Date().toISOString();

      // emit to all connected clients
      socket.emit("start_hackathon", startTime);

      setStatus({ isActive: true, startTime });
    } catch (err) {
      console.error("Start error:", err);
      alert("Failed to start hackathon. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Stop hackathon: POST to backend AND emit socket event
  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathon/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to stop");

      // emit stop event
      socket.emit("stop_hackathon");

      setStatus({ isActive: false, startTime: null });
    } catch (err) {
      console.error("Stop error:", err);
      alert("Failed to stop hackathon. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6">
      <div className="max-w-3xl w-full bg-[#071018]/60 border border-[#e99b63]/20 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-4">Codex — Admin Panel</h1>

        <div className="mb-6">
          <p className="text-sm text-slate-300">Current status:</p>
          <div className="mt-2 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${status.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
            <div>
              <div className="font-semibold">{status.isActive ? "Active" : "Stopped"}</div>
              {status.isActive && status.startTime && <div className="text-xs text-slate-400">Started at: {new Date(status.startTime).toLocaleString()}</div>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleStart}
            disabled={loading || status.isActive}
            className="px-6 py-3 bg-emerald-400 text-black font-bold rounded disabled:opacity-50"
          >
            🚀 Start 110-min Timer
          </button>
          <button
            onClick={handleStop}
            disabled={loading || !status.isActive}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded disabled:opacity-50"
          >
            🛑 Stop Timer
          </button>
          <button onClick={handleLogout} className="px-4 py-3 ml-auto border border-slate-600 rounded text-sm">Logout</button>
        </div>

        <div className="bg-[#02040a]/50 border border-[#e99b63]/10 p-4 rounded">
          <h2 className="text-sm text-slate-200 font-semibold mb-2">Connected clients (debug)</h2>
          <p className="text-xs text-slate-400">Open participant pages to see sockets connect. Check Render logs for server connection traces.</p>
        </div>
      </div>
    </main>
  );
}
