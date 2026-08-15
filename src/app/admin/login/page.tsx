"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        router.push("/admin");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-primary rounded-sm flex items-center justify-center text-white font-bold font-serif italic mx-auto mb-6 shadow-xl text-2xl">
            AL
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm tracking-wide">Enter your credentials to access the Command Center</p>
        </div>

        <div className="bg-white p-10 border border-[#E5E5E5] shadow-2xl rounded-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary text-brand-dark font-medium transition-colors"
                placeholder="admin@almalanka.com"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-[#E5E5E5] p-3 focus:outline-none focus:border-brand-primary text-brand-dark font-medium transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 text-xs font-bold uppercase tracking-widest border border-red-100 flex items-center gap-3">
                 <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                 {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-brand-primary text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mt-12">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            © 2026 Soheily Creations • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
