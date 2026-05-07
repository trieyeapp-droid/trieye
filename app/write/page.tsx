"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";

const categories = [
  "overthinking",
  "nostalgia",
  "amore",
  "solitudine",
  "poesia",
  "guarigione",
  "notte",
  "rabbia",
  "speranza",
  "confessione",
  "da-note",
];

export default function WritePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "overthinking";

  const [content, setContent] = useState("");
  const [mood, setMood] = useState(initialCategory);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function publishPost() {
    if (!content.trim()) return;

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setErrorMessage("Devi accedere per pubblicare un pensiero.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const { error } = await supabase.from("posts").insert({
      content,
      mood,
      anonymous: false,
      heart_count: 0,
      broken_heart_count: 0,
      user_id: userData.user.id,
    });

    if (error) {
      setErrorMessage("Qualcosa è andato storto. Riprova.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setContent("");
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }

  return (
    <main className="relative min-h-screen bg-[#09090B] px-6 py-8 pb-28 text-white">
      {success && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-violet-500/30 bg-zinc-950 px-5 py-4 text-sm text-zinc-200 shadow-2xl shadow-violet-950/40">
          <p className="font-medium">✨ Post pubblicato con successo</p>

          <p className="mt-1 text-zinc-500">
            Il tuo pensiero ora vive su Trieye.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-red-500/30 bg-zinc-950 px-5 py-4 text-sm text-zinc-200 shadow-2xl shadow-red-950/40">
          <p className="font-medium">⚠️ {errorMessage}</p>
        </div>
      )}

      <div className="mx-auto max-w-xl">
        <p className="text-sm text-violet-400">Trieye</p>

        <h1 className="font-trieye mt-2 text-6xl italic tracking-tight text-white">
          Cosa hai in mente?
        </h1>

        <p className="mt-4 leading-relaxed text-zinc-500">
          Scrivi un pensiero, una riflessione, una poesia o qualcosa che era rimasto nelle note.
        </p>

        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="mt-8 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-zinc-300 outline-none"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <div className="mt-4 flex items-center justify-between px-2">
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            {mood}
          </span>

          <span className="text-sm text-zinc-600">
            {content.length} caratteri
          </span>
        </div>

        <textarea
          className="font-trieye mt-3 h-80 w-full resize-none rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-3xl leading-relaxed outline-none placeholder:text-zinc-600"
          placeholder="Scrivi qualcosa che non hai mai pubblicato..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          onClick={publishPost}
          disabled={!content.trim()}
          className={`mt-5 w-full rounded-2xl px-6 py-4 font-medium text-white transition ${
            content.trim()
              ? "bg-violet-600 hover:bg-violet-500"
              : "cursor-not-allowed bg-zinc-800 text-zinc-500"
          }`}
        >
          Pubblica pensiero
        </button>

        {content.trim() && (
          <div className="mt-10">
            <p className="mb-4 text-sm text-zinc-500">
              Anteprima del post
            </p>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  {mood}
                </span>

                <span className="text-xs text-zinc-600">adesso</span>
              </div>

              <p className="font-trieye text-3xl leading-relaxed text-zinc-100">
                {content}
              </p>
            </div>
          </div>
        )}
      </div>

      <Navbar />
    </main>
  );
}