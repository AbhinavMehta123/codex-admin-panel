"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

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
      // ✅ Points to your Render backend
      const res = await axios.post("https://codex-build-backend.onrender.com/api/admin/login", {
        username,
        password,
      });

      if (res.data.success) {
        // ✅ Store the JWT for future authorized requests
        localStorage.setItem("admin_token", res.data.token);
        
        // ✅ Redirect specifically to /admin as requested
        router.push("/admin"); 
      }
    } catch (err) {
      console.error(err);
      // Friendly error handling for failed credentials or server downtime
      setError(err.response?.data?.message || "Access Denied: Terminal connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-cyan-400 font-mono flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black/40 border border-cyan-500/20 p-10 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.2)] w-full max-w-md"
      >
        <h1 className="text-center text-3xl font-black text-[#ffcc8f] mb-8 tracking-[0.25em] uppercase">
          CODEX AUTH
        </h1>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-3 text-cyan-500/50 font-bold italic">
              01. Admin Identity
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="USERNAME"
              required
              className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-3 text-cyan-500/50 font-bold italic">
              02. Security Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-cyan-500/5 border-b border-cyan-500/30 p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-red-500 text-center text-xs tracking-widest uppercase"
            >
              ⚠ {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0_0_20px_rgba(255,204,143,0.6)" }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-[#ffcc8f] text-black font-black uppercase tracking-[0.3em] text-sm py-5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Decrypting..." : "Initialize Session"}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}