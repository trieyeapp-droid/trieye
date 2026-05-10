"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayName(post: any) {
  if (post.display_mode === "anonymous") return "— anonimo";

  if (post.display_mode === "alias") {
    return `— ${post.alias_name || "voce anonima"}`;
  }

  return post.profiles?.username
    ? `@${post.profiles.username}`
    : "@anonimo";
}

function getProfileLink(post: any) {
  if (
    post.display_mode === "public" &&
    post.profiles?.username
  ) {
    return `/u/${encodeURIComponent(
      post.profiles.username
    )}`;
  }

  return undefined;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchPosts(value: string) {
    setQuery(value);

    if (!value.trim()) {
      setPosts([]);
      return;
    }

    setLoading(true);

    const { data } = await supabase
      .from("posts")
      .select("*, profiles(username, avatar_url)")
      .ilike("content", `%${value}%`)
      .order("created_at", { ascending: false })
      .limit(40);

    setPosts(data || []);
    setLoading(false);
  }

  const emotionalSuggestions = [
    "mi manca",
    "vuoto",
    "non riesco a dormire",
    "solitudine",
    "vorrei sparire",
    "mi sento perso",
    "nostalgia",
    "ansia",
    "non so cosa provo",
    "ho bisogno di qualcuno",
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="text-sm text-violet-400">
          Ricerca emozionale
        </p>

        <h1 className="font-trieye mt-2 text-6xl italic tracking-tight">
          Cerca un sentimento
        </h1>

        <p className="mt-4 max-w-lg text-zinc-500">
          Cerca parole, pensieri o sensazioni e trova persone che hanno scritto qualcosa di simile.
        </p>

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur">
          <input
            value={query}
            onChange={(e) =>
              searchPosts(e.target.value)
            }
            placeholder="Es. mi sento vuoto..."
            className="w-full bg-transparent font-trieye text-3xl text-zinc-100 outline-none placeholder:text-zinc-700"
          />

          <div className="mt-5 flex flex-wrap gap-2">
            {emotionalSuggestions.map((item) => (
              <button
                key={item}
                onClick={() => searchPosts(item)}
                className="rounded-full border border-zinc-800 bg-black/40 px-3 py-1 text-xs text-zinc-500 transition hover:border-violet-500/30 hover:text-violet-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {loading && (
            <p className="text-zinc-500">
              Sto cercando pensieri simili...
            </p>
          )}

          {!loading &&
            query &&
            posts.length === 0 && (
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 text-zinc-500">
                Nessun pensiero trovato.
              </div>
            )}

          <div className="space-y-6">
            {posts.map((post) => {
              const displayName =
                getDisplayName(post);

              const profileLink =
                getProfileLink(post);

              const isPublic =
                post.display_mode === "public";

              return (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 p-7 shadow-2xl transition hover:border-violet-500/40"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <Link
                      href={profileLink || "#"}
                      className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-lg ring-1 ring-violet-500/20 ${
                        isPublic
                          ? "transition hover:scale-105"
                          : "pointer-events-none"
                      }`}
                    >
                      {isPublic &&
                      post.profiles?.avatar_url ? (
                        <img
                          src={
                            post.profiles.avatar_url
                          }
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : post.display_mode ===
                        "alias" ? (
                        <span>🌙</span>
                      ) : post.display_mode ===
                        "anonymous" ? (
                        <span>👤</span>
                      ) : (
                        <span>👁️</span>
                      )}
                    </Link>

                    <div>
                      {isPublic &&
                      profileLink ? (
                        <Link
                          href={profileLink}
                          className="text-sm text-zinc-300 transition hover:text-violet-300"
                        >
                          {displayName}
                        </Link>
                      ) : (
                        <p className="text-sm text-zinc-300">
                          {displayName}
                        </p>
                      )}

                      <p className="text-xs text-zinc-600">
                        {formatDate(
                          post.created_at
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 flex justify-center">
                    <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-xs text-violet-300">
                      {post.mood}
                    </span>
                  </div>

                  <p className="font-trieye text-3xl leading-relaxed text-zinc-100">
                    {post.content}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Navbar />
    </main>
  );
}