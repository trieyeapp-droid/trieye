"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  async function signup() {
    if (!email || !password || !username) return;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        bio: "Scrivo pensieri che prima restavano nelle note.",
      });
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
          Registrati
        </h1>

        <p className="mt-4 text-zinc-500">
          Crea il tuo spazio per condividere pensieri e riflessioni.
        </p>

        <div className="mt-8 space-y-4">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 outline-none"
          />

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
            onClick={signup}
            className="w-full rounded-2xl bg-violet-600 px-6 py-4 text-white transition hover:bg-violet-500"
          >
            Crea account
          </button>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          Hai già un account?{" "}
          <Link
            href="/auth/login"
            className="text-violet-400"
          >
            Accedi
          </Link>
        </p>
      </div>
    </main>
  );
}