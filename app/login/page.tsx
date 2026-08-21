"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(`Login Failed: ${error.message}`);
      return;
    }

    alert("Login Successful!");
    console.log("Logged in User:", data.user);

  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.jpg')",
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/20 p-8 shadow-2xl backdrop-blur-lg">

        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-white p-3 shadow-lg">
            <Image
              src="/logo.png"
              alt="Uddan Foundation Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-white">

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
              />
              Remember Me
            </label>

            <button
              type="button"
              className="hover:underline"
            >
              Forgot Password?
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-800 py-3 text-lg font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>
      </div>
    </div>
  );
}