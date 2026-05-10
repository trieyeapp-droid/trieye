import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";

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
  if (post.display_mode === "alias") return `— ${post.alias_name || "voce anonima"}`;

  return post.profiles?.username ? `@${post.profiles.username}` : "@anonimo";
}

function getProfileLink(post: any) {
  if (post.display_mode === "public" && post.profiles?.username) {
    return `/u/${encodeURIComponent(post.profiles.username)}`;
  }

  return undefined;
}

export default async function SimilarPostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: originalPost } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!originalPost) {
    return (
      <main className="min-h-screen bg-[#09090B] px-6 py-8 text-white">
        <div className="mx-auto max-w-2xl">
          <Link href="/home" className="text-sm text-zinc-500 hover:text-white">
            ← Torna alla home
          </Link>

          <p className="mt-8 text-zinc-500">Pensiero non trovato.</p>
        </div>

        <Navbar />
      </main>
    );
  }

  const { data: similarPosts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .eq("mood", originalPost.mood)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <Link href="/home" className="text-sm text-zinc-500 hover:text-white">
          ← Torna alla home
        </Link>

        <div className="mt-8 rounded-[2rem] border border-zinc-800/80 bg-zinc-950/70 p-8 backdrop-blur">
          <p className="text-sm text-violet-400">Pensieri simili</p>

          <h1 className="font-trieye mt-3 text-6xl italic tracking-tight">
            Non sei l’unico
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Altre persone hanno scritto qualcosa con una vibrazione simile.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {similarPosts?.length === 0 && (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 text-zinc-500">
              Non ci sono ancora pensieri simili.
            </div>
          )}

          {similarPosts?.map((post) => {
            const displayName = getDisplayName(post);
            const profileLink = getProfileLink(post);
            const isPublic = post.display_mode === "public";

            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 p-7 shadow-2xl transition hover:border-violet-500/40"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-lg ring-1 ring-violet-500/20">
                    {isPublic && post.profiles?.avatar_url ? (
                      <img
                        src={post.profiles.avatar_url}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : post.display_mode === "alias" ? (
                      <span>🌙</span>
                    ) : post.display_mode === "anonymous" ? (
                      <span>👤</span>
                    ) : (
                      <span>👁️</span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-zinc-300">{displayName}</p>
                    <p className="text-xs text-zinc-600">
                      {formatDate(post.created_at)}
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

      <Navbar />
    </main>
  );
}