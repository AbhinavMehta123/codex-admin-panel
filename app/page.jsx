"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("https://codex-build-backend.onrender.com/api/admin/login", {
        username,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("admin_token", res.data.token);
        router.push("/AdminDashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Backend not reachable or invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-cyan-400 font-mono flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-black/40 border border-cyan-500/20 p-10 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.4)] w-full max-w-md"
      >
        <h1 className="text-center text-3xl font-black text-[#ffcc8f] mb-8 tracking-[0.25em] uppercase">
          CODEX Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-3 text-cyan-500/50 font-bold italic">
              01. Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ENTER_USERNAME"
              required
              className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 rounded-t-md text-lg"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-3 text-cyan-500/50 font-bold italic">
              02. Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER_PASSWORD"
              required
              className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 rounded-t-md text-lg"
            />
          </div>

          {error && (
            <p className="text-red-500 text-center text-sm tracking-wide">
              {error}
            </p>
          )}
          <Link href="/admin" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02, letterSpacing: "0.3em" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e99b63] to-[#ffcc8f] text-black font-black uppercase tracking-[0.3em] text-sm py-5 rounded-lg shadow-[0_0_25px_rgba(255,204,143,0.4)] hover:bg-white transition-all duration-500 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Authorize Access"}
            </motion.button>
          </Link>
        </form>
      </motion.div>
    </main>
  );
}