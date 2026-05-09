import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";
import CommentSection from "../../../components/CommentSection";
import PostReactionButtons from "../../../components/PostReactionButtons";
import GoalProgress from "../../../components/GoalProgress";
import SavePostButton from "../../../components/SavePostButton";

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

  return post.profiles?.username ? `@${post.profiles.username}` : "@anonimo";
}

function getProfileLink(post: any) {
  if (post.display_mode === "public" && post.profiles?.username) {
    return `/u/${encodeURIComponent(post.profiles.username)}`;
  }

  return undefined;
}

export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#09090B] px-6 py-8 pb-28 text-white">
        <div className="mx-auto max-w-2xl">
          <Link href="/home" className="text-sm text-zinc-500 hover:text-white">
            ← Torna alla home
          </Link>

          <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-8 text-zinc-500">
            Questo pensiero non esiste più.
          </div>
        </div>

        <Navbar />
      </main>
    );
  }

  const displayName = getDisplayName(post);
  const profileLink = getProfileLink(post);
  const isPublic = post.display_mode === "public";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <Link href="/home" className="text-sm text-zinc-500 hover:text-white">
          ← Torna alla home
        </Link>

        <article className="relative mt-8 rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 p-7 shadow-2xl backdrop-blur">
          <SavePostButton postId={post.id} />

          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={profileLink || "/home"}
                className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-lg ring-1 ring-violet-500/20 ${
                  isPublic ? "transition hover:scale-105" : "pointer-events-none"
                }`}
              >
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
              </Link>

              <div>
                {isPublic && post.profiles?.username ? (
                  <Link
                    href={profileLink || "/home"}
                    className="text-sm text-zinc-300 transition hover:text-violet-300"
                  >
                    {displayName}
                  </Link>
                ) : (
                  <p className="text-sm text-zinc-300">{displayName}</p>
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
            initialBrokenHearts={post.broken_heart_count}
          />

          {post.mood === "obiettivi" && (
            <GoalProgress postId={post.id} postOwnerId={post.user_id} />
          )}

          <CommentSection postId={post.id} />
        </article>
      </div>

      <Navbar />
    </main>
  );
}