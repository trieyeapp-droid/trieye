"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      router.push("/home");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-white">
      <div className="absolute left-1/2 top-[-240px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute bottom-[-220px] right-[-120px] h-[480px] w-[480px] rounded-full bg-indigo-600/10 blur-3xl" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.jpeg"
          alt="Trieye Logo"
          width={92}
          height={92}
          className="mb-6 rounded-2xl opacity-90"
        />

        <p className="mb-4 text-sm text-violet-400">
          Per i pensieri che restano nelle note
        </p>

        <h1 className="font-trieye text-8xl italic tracking-tight text-white">
          Trieye
        </h1>

        <div className="mt-8 rounded-[2rem] border border-zinc-800/80 bg-zinc-950/70 p-7 shadow-2xl backdrop-blur">
          <p className="font-trieye text-3xl leading-relaxed text-zinc-100">
            “Alcuni pensieri non cercano attenzione. Cercano solo un posto dove esistere.”
          </p>
        </div>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-500">
          Leggi pensieri reali, ritrovati nelle parole degli altri e condividi
          ciò che normalmente rimarrebbe nascosto.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/signup"
            className="rounded-2xl bg-violet-600 px-6 py-3 text-white transition hover:bg-violet-500"
          >
            Iscriviti
          </Link>

          <Link
            href="/auth/login"
            className="rounded-2xl border border-zinc-700 bg-zinc-900/40 px-6 py-3 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Accedi
          </Link>

          <Link
            href="/feed"
            className="rounded-2xl border border-zinc-800 px-6 py-3 text-zinc-500 transition hover:text-zinc-300"
          >
            Esplora
          </Link>
        </div>

        <p className="mt-16 text-sm text-zinc-700">
          Apri. Leggi. Ti riconosci. Scrivi.
        </p>
      </section>
    </main>
  );
}
