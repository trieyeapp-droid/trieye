import Link from "next/link";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import CommentSection from "../../components/CommentSection";
import PostReactionButtons from "../../components/PostReactionButtons";
import GoalProgress from "../../components/GoalProgress";
import SavePostButton from "../../components/SavePostButton";

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
  { name: "Obiettivi", slug: "obiettivi", emoji: "🎯" },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayName(post: any) {
  if (post.display_mode === "anonymous") {
    return "— anonimo";
  }

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
    return `/u/${encodeURIComponent(post.profiles.username)}`;
  }

  return undefined;
}

export default async function HomeFeedPage() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <section className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-10">
          <p className="text-sm text-violet-400">
            Trieye Home
          </p>

          <h1 className="font-trieye mt-2 text-6xl italic tracking-tight text-white">
            La tua home
          </h1>

          <p className="mt-4 max-w-xl leading-relaxed text-zinc-500">
            Leggi pensieri reali, ritrovati nelle parole degli altri e condividi ciò che normalmente rimarrebbe nelle note.
          </p>

          <details className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur">
            <summary className="cursor-pointer text-sm text-zinc-400">
              Esplora categorie
            </summary>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-400 transition hover:border-violet-500/40 hover:text-white"
                >
                  <span
                    className={
                      category.slug === "popolari"
                        ? "animate-pulse"
                        : ""
                    }
                  >
                    {category.emoji}
                  </span>{" "}
                  {category.name}
                </Link>
              ))}
            </div>
          </details>
        </div>

        <div className="space-y-6">
          {posts?.map((post) => {
            const displayName = getDisplayName(post);

            const profileLink = getProfileLink(post);

            const isPublic =
              post.display_mode === "public";

            return (
              <article
                key={post.id}
                className="group relative rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 p-7 shadow-2xl backdrop-blur transition hover:border-violet-500/40 hover:bg-zinc-900/80"
              >
                <SavePostButton postId={post.id} />

                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href={profileLink || "/home"}
                      className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-lg ring-1 ring-violet-500/20 ${
                        isPublic
                          ? "transition hover:scale-105"
                          : "pointer-events-none"
                      }`}
                    >
                      {isPublic &&
                      post.profiles?.avatar_url ? (
                        <img
                          src={post.profiles.avatar_url}
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
                      post.profiles?.username ? (
                        <Link
                          href={profileLink || "/home"}
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
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex justify-center">
                  <Link
                    href={`/category/${post.mood}`}
                    className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-xs text-violet-300 transition hover:bg-violet-500/20"
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
                  initialBrokenHearts={
                    post.broken_heart_count
                  }
                />

                {post.mood === "obiettivi" && (
                  <GoalProgress
                    postId={post.id}
                    postOwnerId={post.user_id}
                  />
                )}

                <CommentSection postId={post.id} />
              </article>
            );
          })}
        </div>
      </section>

      <Navbar />
    </main>
  );
}