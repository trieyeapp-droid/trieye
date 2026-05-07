"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/feed");
  }

  return (
    <main className="min-h-screen bg-[#09090B] px-6 py-8 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-sm text-violet-400">
          Trieye
        </p>

        <h1 className="font-trieye mt-3 text-6xl italic tracking-tight">
          Accedi
        </h1>

        <p className="mt-4 text-zinc-500">
          Torna ai pensieri che parlano anche di te.
        </p>

        <div className="mt-8 space-y-4">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 outline-none"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 outline-none"
          />

          <button
            onClick={login}
            className="w-full rounded-2xl bg-violet-600 px-6 py-4 text-white transition hover:bg-violet-500"
          >
            Accedi
          </button>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          Non hai un account?{" "}
          <Link
            href="/auth/signup"
            className="text-violet-400"
          >
            Registrati
          </Link>
        </p>
      </div>
    </main>
  );
}