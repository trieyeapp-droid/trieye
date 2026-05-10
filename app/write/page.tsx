"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";

const moods = [
  { name: "overthinking", emoji: "🧠" },
  { name: "nostalgia", emoji: "🌙" },
  { name: "amore", emoji: "❤️" },
  { name: "solitudine", emoji: "🌫️" },
  { name: "poesia", emoji: "✍️" },
  { name: "guarigione", emoji: "🕊️" },
  { name: "notte", emoji: "🌌" },
  { name: "rabbia", emoji: "⚡" },
  { name: "speranza", emoji: "✨" },
  { name: "confessione", emoji: "🤐" },
  { name: "da-note", emoji: "📝" },
  { name: "obiettivi", emoji: "🎯" },
];

export default function WritePage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState("overthinking");
  const [displayMode, setDisplayMode] = useState("public");
  const [aliasName, setAliasName] = useState("");
  const [loading, setLoading] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [similarCount, setSimilarCount] = useState(0);
  const [publishedPostId, setPublishedPostId] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/auth/login");
    }
  }

  async function publishPost() {
    if (!content.trim()) return;

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/auth/login");
      return;
    }

    const { data: insertedPost, error } = await supabase
      .from("posts")
      .insert({
        content,
        mood,
        user_id: userData.user.id,
        heart_count: 0,
        broken_heart_count: 0,
        display_mode: displayMode,
        alias_name: displayMode === "alias" ? aliasName || "voce anonima" : null,
        anonymous: displayMode === "anonymous",
      })
      .select()
      .single();

    setLoading(false);

    if (error || !insertedPost) {
      alert("Errore durante la pubblicazione.");
      return;
    }

    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("mood", mood)
      .neq("id", insertedPost.id);

    setSimilarCount(count || 0);
    setPublishedPostId(insertedPost.id);

    setContent("");
    setAliasName("");
    setShowToast(true);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="absolute left-1/2 top-[-200px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />

      {showToast && (
        <div className="fixed right-6 top-6 z-50 w-[330px] rounded-2xl border border-violet-500/30 bg-zinc-950 px-5 py-4 text-sm text-zinc-200 shadow-2xl shadow-violet-950/40 backdrop-blur">
          <p className="font-medium">✨ Pensiero pubblicato con successo</p>

          {similarCount > 0 && publishedPostId && (
            <Link
              href={`/similar/${publishedPostId}`}
              className="mt-3 block rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-violet-200 transition hover:bg-violet-500/20"
            >
              {similarCount} persone hanno scritto pensieri simili.
              <span className="mt-1 block text-xs text-violet-300/70">
                Tocca per leggerli.
              </span>
            </Link>
          )}
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="text-sm text-violet-400">Trieye</p>

        <h1 className="font-trieye mt-2 text-6xl italic tracking-tight">
          Scrivi ciò che senti
        </h1>

        <p className="mt-4 max-w-lg text-zinc-500">
          Alcuni pensieri meritano di esistere fuori dalle note del telefono.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {moods.map((item) => (
            <button
              key={item.name}
              onClick={() => setMood(item.name)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                mood === item.name
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                  : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              {item.emoji} {item.name}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-4">
          <p className="mb-3 text-sm text-zinc-500">Come vuoi pubblicare?</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => setDisplayMode("public")}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                displayMode === "public"
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                  : "border-zinc-800 text-zinc-500"
              }`}
            >
              Pubblico
            </button>

            <button
              onClick={() => setDisplayMode("alias")}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                displayMode === "alias"
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                  : "border-zinc-800 text-zinc-500"
              }`}
            >
              Alias
            </button>

            <button
              onClick={() => setDisplayMode("anonymous")}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                displayMode === "anonymous"
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                  : "border-zinc-800 text-zinc-500"
              }`}
            >
              Anonimo
            </button>
          </div>

          {displayMode === "alias" && (
            <input
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              placeholder="Scegli un alias, es. luna.stanca"
              className="mt-4 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 py-3 text-sm outline-none placeholder:text-zinc-600"
            />
          )}
        </div>

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrivi il tuo pensiero..."
            className="h-[260px] w-full resize-none bg-transparent font-trieye text-3xl leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-700"
          />

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-zinc-600">
              {content.length} caratteri
            </span>

            <button
              onClick={publishPost}
              disabled={!content.trim() || loading}
              className={`rounded-2xl px-6 py-3 text-sm transition ${
                content.trim()
                  ? "bg-violet-600 text-white hover:bg-violet-500"
                  : "cursor-not-allowed bg-zinc-800 text-zinc-500"
              }`}
            >
              {loading ? "Pubblicazione..." : "Pubblica"}
            </button>
          </div>
        </div>
      </div>

      <Navbar />
    </main>
  );
}