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

const dailyMoodOptions = [
  { mood: "nostalgia", emoji: "🌙", label: "nostalgico" },
  { mood: "overthinking", emoji: "🧠", label: "overthinking" },
  { mood: "solitudine", emoji: "🌫️", label: "vuoto" },
  { mood: "speranza", emoji: "✨", label: "speranzoso" },
  { mood: "rabbia", emoji: "⚡", label: "agitato" },
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
    return `/u/${encodeURIComponent(post.profiles.username)}`;
  }

  return undefined;
}

function sortPostsByPreferredMoods(
  posts: any[],
  preferredMoods: string[]
) {
  return [...posts].sort((a, b) => {
    const aScore = preferredMoods.includes(a.mood)
      ? 1
      : 0;

    const bScore = preferredMoods.includes(b.mood)
      ? 1
      : 0;

    if (aScore !== bScore)
      return bScore - aScore;

    return (
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
    );
  });
}

export default async function HomeFeedPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let preferredMoods: string[] = [];

  if (user) {
    const { data: myPosts } = await supabase
      .from("posts")
      .select("mood")
      .eq("user_id", user.id);

    const { data: myComments } = await supabase
      .from("comments")
      .select("posts(mood)")
      .eq("user_id", user.id);

    const { data: mySaved } = await supabase
      .from("saved_posts")
      .select("posts(mood)")
      .eq("user_id", user.id);

    const { data: todayMood } = await supabase
      .from("daily_moods")
      .select("mood")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    const moodScores: Record<string, number> = {};

    myPosts?.forEach((item: any) => {
      if (item.mood)
        moodScores[item.mood] =
          (moodScores[item.mood] || 0) + 3;
    });

    myComments?.forEach((item: any) => {
      const mood = item.posts?.mood;

      if (mood)
        moodScores[mood] =
          (moodScores[mood] || 0) + 2;
    });

    mySaved?.forEach((item: any) => {
      const mood = item.posts?.mood;

      if (mood)
        moodScores[mood] =
          (moodScores[mood] || 0) + 3;
    });

    if (todayMood?.mood) {
      moodScores[todayMood.mood] =
        (moodScores[todayMood.mood] || 0) + 5;
    }

    preferredMoods = Object.entries(moodScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mood]) => mood);
  }

  const { data: rawPosts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(80);

  const posts =
    preferredMoods.length > 0 && rawPosts
      ? sortPostsByPreferredMoods(
          rawPosts,
          preferredMoods
        )
      : rawPosts || [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <Link
        href="/search"
        className="fixed right-5 top-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/90 text-xl text-zinc-400 shadow-2xl backdrop-blur transition hover:border-violet-500/40 hover:text-violet-300"
      >
        🔍
      </Link>

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
            Pensieri scelti anche in base a ciò che scrivi, salvi e a cui rispondi.
          </p>

          <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur">
            <p className="text-sm text-zinc-500">
              Come ti senti oggi?
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {dailyMoodOptions.map((item) => (
                <form
                  key={item.mood}
                  action={async () => {
                    "use server";

                    const {
                      data: { user },
                    } = await supabase.auth.getUser();

                    if (!user) return;

                    await supabase
                      .from("daily_moods")
                      .insert({
                        user_id: user.id,
                        mood: item.mood,
                      });
                  }}
                >
                  <button
                    className="rounded-full border border-zinc-800 bg-black/40 px-4 py-2 text-sm text-zinc-400 transition hover:border-violet-500/30 hover:text-violet-300"
                  >
                    {item.emoji} {item.label}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {preferredMoods.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-sm text-zinc-600">
                La tua home sta seguendo:
              </span>

              {preferredMoods.map((mood) => (
                <Link
                  key={mood}
                  href={`/category/${mood}`}
                  className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300"
                >
                  {mood}
                </Link>
              ))}
            </div>
          )}

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
          {posts.map((post) => {
            const displayName =
              getDisplayName(post);

            const profileLink =
              getProfileLink(post);

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
                        {formatDate(
                          post.created_at
                        )}
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

                <CommentSection
                  postId={post.id}
                />
              </article>
            );
          })}
        </div>
      </section>

      <Navbar />
    </main>
  );
}