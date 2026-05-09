import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";
import CommentSection from "../../../components/CommentSection";
import PostReactionButtons from "../../../components/PostReactionButtons";
import GoalProgress from "../../../components/GoalProgress";
import SavePostButton from "../../../components/SavePostButton";

const categories: Record<
  string,
  { title: string; phrase: string }
> = {
  popolari: {
    title: "🔥 Popolari",
    phrase:
      "I pensieri che hanno toccato più persone. Lascia anche tu qualcosa che resti.",
  },

  overthinking: {
    title: "🧠 Overthinking",
    phrase:
      "Per quei pensieri che girano in testa quando tutto il resto si spegne.",
  },

  nostalgia: {
    title: "🌙 Nostalgia",
    phrase:
      "Scrivi ciò che ti manca, anche se non sai più bene perché.",
  },

  amore: {
    title: "❤️ Amore",
    phrase:
      "Per parole dolci, ferite aperte e sentimenti che non trovano voce.",
  },

  solitudine: {
    title: "🌫️ Solitudine",
    phrase:
      "A volte basta leggere qualcuno per sentirsi meno soli.",
  },

  poesia: {
    title: "✍️ Poesia",
    phrase:
      "Trasforma un pensiero in ritmo, immagine, silenzio.",
  },

  guarigione: {
    title: "🕊️ Guarigione",
    phrase:
      "Scrivi per lasciare andare, capire, ricominciare.",
  },

  notte: {
    title: "🌌 Notte",
    phrase:
      "I pensieri più veri arrivano quando il mondo dorme.",
  },

  rabbia: {
    title: "⚡ Rabbia",
    phrase:
      "Dai forma a ciò che brucia, senza lasciarlo esplodere dentro.",
  },

  speranza: {
    title: "✨ Speranza",
    phrase:
      "Per le parole che tengono accesa una piccola luce.",
  },

  confessione: {
    title: "🤐 Confessione",
    phrase:
      "Scrivi quello che non hai mai avuto il coraggio di dire.",
  },

  "da-note": {
    title: "📝 Da note",
    phrase:
      "Per quei pensieri rimasti salvati nel telefono troppo a lungo.",
  },

  obiettivi: {
    title: "🎯 Obiettivi",
    phrase:
      "Scrivi ciò che vuoi raggiungere e aggiorna il tuo percorso passo dopo passo.",
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "it-IT",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = categories[slug] || {
    title: slug,
    phrase:
      "Pensieri e scritti appartenenti a questa categoria.",
  };

  const query =
    slug === "popolari"
      ? supabase
          .from("posts")
          .select(
            "*, profiles(username, avatar_url)"
          )
          .order("heart_count", {
            ascending: false,
          })
      : supabase
          .from("posts")
          .select(
            "*, profiles(username, avatar_url)"
          )
          .eq("mood", slug)
          .order("created_at", {
            ascending: false,
          });

  const { data: posts, error } = await query;

  if (error) {
    console.log(error);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <Link
          href="/home"
          className="text-sm text-zinc-500 hover:text-white"
        >
          ← Torna alla home
        </Link>

        <div className="mb-10 mt-8 rounded-[2rem] border border-zinc-800/80 bg-zinc-950/70 p-8 backdrop-blur">
          <p className="text-sm text-violet-400">
            Categoria
          </p>

          <h1 className="font-trieye mt-3 text-6xl italic tracking-tight text-white">
            {category.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            {category.phrase}
          </p>

          <Link
            href="/write"
            className="mt-7 inline-block rounded-2xl bg-violet-600 px-6 py-3 text-white transition hover:bg-violet-500"
          >
            Scrivi in questa categoria
          </Link>
        </div>

        <div className="space-y-6">
          {posts?.map((post) => {
            const displayName =
              getDisplayName(post);

            const profileLink =
              getProfileLink(post);

            const isPublic =
              post.display_mode === "public";

            return (
              <article
                key={post.id}
                className="relative rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 p-7 shadow-2xl backdrop-blur transition hover:border-violet-500/40"
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
                  initialHearts={
                    post.heart_count
                  }
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
      </div>

      <Navbar />
    </main>
  );
}