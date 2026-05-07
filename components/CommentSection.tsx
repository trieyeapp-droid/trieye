"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CommentHeartButton from "./CommentHeartButton";

type Comment = {
  id: string;
  content: string;
 created_at: string;
  heart_count: number;
};

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState("");

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("heart_count", { ascending: false })
      .order("created_at", { ascending: false });

    setComments(data || []);
  }

  useEffect(() => {
    fetchComments();
  }, []);

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
    });

    if (error) {
      return;
    }

    const { data: postData } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (
      postData?.user_id &&
      postData.user_id !== userData.user.id
    ) {
      await supabase.from("notifications").insert({
        user_id: postData.user_id,
        actor_id: userData.user.id,
        post_id: postId,
        type: "comment",
        message: "ha risposto a un tuo pensiero 💬",
      });
    }

    setContent("");

    fetchComments();
  }

  return (
    <div className="mt-7 border-t border-zinc-800/80 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Risposte
        </p>

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
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/70 p-4 text-sm text-zinc-300"
          >
            <p className="leading-relaxed">
              {comment.content}
            </p>

            <CommentHeartButton
              commentId={comment.id}
              initialHearts={comment.heart_count}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
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
  );
}