import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-white">
      <div className="absolute left-1/2 top-[-200px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-28">
        <Image
          src="/logo.jpeg"
          alt="Trieye Logo"
          width={90}
          height={90}
          className="mb-6 rounded-2xl opacity-90"
        />

        <h1 className="font-trieye text-8xl italic tracking-tight text-white">
          Trieye
        </h1>

        <p className="mt-6 max-w-xl text-center text-xl leading-relaxed text-zinc-400">
          Un posto per pensieri, riflessioni e parole che normalmente rimangono nelle note.
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

        <p className="mt-16 text-sm text-zinc-600">
          Some thoughts deserve more than silence.
        </p>
      </div>

      <Navbar />
    </main>
  );
}