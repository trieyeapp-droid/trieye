import Link from "next/link";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import CommentSection from "../../components/CommentSection";
import PostReactionButtons from "../../components/PostReactionButtons";

const categories = [
  { name: "Popolari", slug: "popolari", emoji: "🔥" },
  { name: "Overthinking", slug: "overthinking", emoji: "🧠" },
  { name: "Nostalgia", slug: "nostalgia", emoji: "🌙" },
  { name: "Amore", slug: "amore", emoji: "❤️" },
  { name: "Solitudine", slug: "solitudine", emoji: "🌫️" },
  { name: "Poesia", slug: "poesia", emoji: "✍️" },
  { name: "Guarigione", slug: "guarigione", emoji: "🕊️" },
  { name: "Notte", slug: "notte", emoji: "🌌" },
  { name: "Rabbia", slug: "rabbia", emoji: "⚡" },
  { name: "Speranza", slug: "speranza", emoji: "✨" },
  { name: "Confessione", slug: "confessione", emoji: "🤐" },
  { name: "Da note", slug: "da-note", emoji: "📝" },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FeedPage() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) console.log(error);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="absolute bottom-[200px] right-[-200px] h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur">
          <p className="mb-4 text-sm text-zinc-500">
            Categorie
          </p>

          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                <span
                  className={
                    category.slug === "popolari"
                      ? "inline-block animate-pulse"
                      : ""
                  }
                >
                  {category.emoji}
                </span>

                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </aside>

        <section className="mx-auto w-full max-w-2xl">
          <div className="mb-10">
            <p className="text-sm text-violet-400">
              Trieye Feed
            </p>

            <h1 className="font-trieye mt-2 text-6xl italic tracking-tight text-white">
              Pensieri condivisi
            </h1>

            <p className="mt-4 max-w-xl leading-relaxed text-zinc-500">
              Frammenti, riflessioni, poesie e parole che prima restavano
              nelle note del telefono.
            </p>
          </div>

          <div className="space-y-6">
            {posts?.map((post) => (
              <article
                key={post.id}
                className="group rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 p-7 shadow-2xl backdrop-blur transition hover:border-violet-500/40 hover:bg-zinc-900/80"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href={
                        post.profiles?.username
                          ? `/u/${post.profiles.username}`
                          : "#"
                      }
                      className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-lg ring-1 ring-violet-500/20 transition hover:scale-105"
                    >
                      {post.profiles?.avatar_url ? (
                        <img
                          src={post.profiles.avatar_url}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>👁️</span>
                      )}
                    </Link>

                    <div>
                      {post.profiles?.username ? (
                        <Link
                          href={`/u/${post.profiles.username}`}
                          className="text-sm text-zinc-300 transition hover:text-violet-300"
                        >
                          @{post.profiles.username}
                        </Link>
                      ) : (
                        <p className="text-sm text-zinc-300">
                          @anonimo
                        </p>
                      )}

                      <p className="text-xs text-zinc-600">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/category/${post.mood}`}
                    className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 transition hover:bg-violet-500/20"
                  >
                    {post.mood || "thought"}
                  </Link>
                </div>

                <p className="font-trieye text-3xl leading-relaxed text-zinc-100">
                  {post.content}
                </p>

                <PostReactionButtons
                  postId={post.id}
                  initialHearts={post.heart_count}
                  initialBrokenHearts={post.broken_heart_count}
                />

                <CommentSection postId={post.id} />
              </article>
            ))}
          </div>
        </section>
      </div>

      <Navbar />
    </main>
  );
}