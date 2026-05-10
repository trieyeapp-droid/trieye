"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import CommentHeartButton from "./CommentHeartButton";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  heart_count: number;
  user_id: string;
  display_mode: string;
  alias_name: string | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
};

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [displayMode, setDisplayMode] = useState("public");
  const [aliasName, setAliasName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", postId)
      .order("heart_count", { ascending: false })
      .order("created_at", { ascending: false });

    setComments(data || []);
  }

  useEffect(() => {
    fetchComments();
  }, []);

  function getVisibleName(comment: Comment) {
    if (comment.display_mode === "anonymous") return "anonimo";
    if (comment.display_mode === "alias") return comment.alias_name || "voce anonima";
    return comment.profiles?.username || "utente";
  }

  function getShownName(comment: Comment) {
    if (comment.display_mode === "anonymous") return "— anonimo";
    if (comment.display_mode === "alias") return `— ${comment.alias_name || "voce anonima"}`;
    return comment.profiles?.username ? `@${comment.profiles.username}` : "@utente";
  }

  function getCommentProfileLink(comment: Comment) {
    if (comment.display_mode === "public" && comment.profiles?.username) {
      return `/u/${encodeURIComponent(comment.profiles.username)}`;
    }

    return undefined;
  }

  function replyToComment(comment: Comment) {
    const name = getVisibleName(comment);

    setContent(`@${name} `);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  async function addComment() {
    if (!content.trim()) return;

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Devi accedere per commentare.");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      content,
      heart_count: 0,
      user_id: userData.user.id,
      display_mode: displayMode,
      alias_name: displayMode === "alias" ? aliasName || "voce anonima" : null,
    });

    if (error) return;

    const { data: postData } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (postData?.user_id && postData.user_id !== userData.user.id) {
      await supabase.from("notifications").insert({
        user_id: postData.user_id,
        actor_id: userData.user.id,
        post_id: postId,
        type: "comment",
        message: "ha risposto a un tuo pensiero 💬",
      });
    }

    setContent("");
    setAliasName("");
    fetchComments();
  }

  return (
    <div className="mt-7 border-t border-zinc-800/80 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">Risposte</p>

        <p className="text-xs text-zinc-600">
          {comments.length} commenti
        </p>
      </div>

      {comments.length === 0 && (
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4 text-sm text-zinc-600">
          Nessuna risposta ancora. Lascia tu il primo pensiero.
        </div>
      )}

      <div className="space-y-3">
        {comments.map((comment) => {
          const shownName = getShownName(comment);
          const profileLink = getCommentProfileLink(comment);
          const isPublic = comment.display_mode === "public";

          return (
            <div
              key={comment.id}
              className="rounded-2xl border border-zinc-800/70 bg-zinc-950/70 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={profileLink || "#"}
                    className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-sm ring-1 ring-violet-500/20 ${
                      isPublic
                        ? "transition hover:scale-105"
                        : "pointer-events-none"
                    }`}
                  >
                    {isPublic && comment.profiles?.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : comment.display_mode === "alias" ? (
                      <span>🌙</span>
                    ) : comment.display_mode === "anonymous" ? (
                      <span>👤</span>
                    ) : (
                      <span>👁️</span>
                    )}
                  </Link>

                  <div>
                    {isPublic && profileLink ? (
                      <Link
                        href={profileLink}
                        className="text-xs text-zinc-300 transition hover:text-violet-300"
                      >
                        {shownName}
                      </Link>
                    ) : (
                      <p className="text-xs text-zinc-300">{shownName}</p>
                    )}

                    <button
                      onClick={() => replyToComment(comment)}
                      className="mt-1 text-[11px] text-violet-400 transition hover:text-violet-300"
                    >
                      Rispondi
                    </button>
                  </div>
                </div>

                <CommentHeartButton
                  commentId={comment.id}
                  initialHearts={comment.heart_count}
                />
              </div>

              <p className="text-sm leading-relaxed text-zinc-300">
                {comment.content}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/30 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setDisplayMode("public")}
            className={`rounded-full border px-3 py-1 text-xs ${
              displayMode === "public"
                ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                : "border-zinc-800 text-zinc-500"
            }`}
          >
            Pubblico
          </button>

          <button
            onClick={() => setDisplayMode("alias")}
            className={`rounded-full border px-3 py-1 text-xs ${
              displayMode === "alias"
                ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                : "border-zinc-800 text-zinc-500"
            }`}
          >
            Alias
          </button>

          <button
            onClick={() => setDisplayMode("anonymous")}
            className={`rounded-full border px-3 py-1 text-xs ${
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
            placeholder="Alias per questa risposta..."
            className="mb-3 w-full rounded-2xl border border-zinc-800 bg-black/60 px-4 py-3 text-sm text-zinc-300 outline-none placeholder:text-zinc-600"
          />
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Rispondi con un pensiero..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-black/60 px-4 py-3 text-sm text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-violet-500/40"
          />

          <button
            onClick={addComment}
            disabled={!content.trim()}
            className={`rounded-2xl px-5 text-sm transition ${
              content.trim()
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }`}
          >
            Invia
          </button>
        </div>
      </div>
    </div>
  );
}