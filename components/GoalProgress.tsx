"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type GoalUpdate = {
  id: string;
  content: string;
  created_at: string;
};

export default function GoalProgress({
  postId,
  postOwnerId,
}: {
  postId: string;
  postOwnerId: string;
}) {
  const [updates, setUpdates] = useState<GoalUpdate[]>([]);
  const [content, setContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    loadUpdates();
    loadUser();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setCurrentUserId(data.user.id);
    }
  }

  async function loadUpdates() {
    const { data } = await supabase
      .from("goal_updates")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    setUpdates(data || []);
  }

  async function addUpdate() {
    if (!content.trim()) return;

    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    const { error } = await supabase.from("goal_updates").insert({
      post_id: postId,
      user_id: data.user.id,
      content,
    });

    if (error) return;

    setContent("");
    loadUpdates();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const isOwner = currentUserId === postOwnerId;

  return (
    <div className="mt-7 rounded-[1.5rem] border border-violet-500/20 bg-violet-500/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-violet-300">🎯 Progresso obiettivo</p>

        <p className="text-xs text-zinc-600">
          {updates.length} aggiornamenti
        </p>
      </div>

      {updates.length === 0 && (
        <p className="text-sm text-zinc-600">
          Nessun aggiornamento ancora.
        </p>
      )}

      <div className="space-y-3">
        {updates.map((update) => (
          <div
            key={update.id}
            className="rounded-2xl border border-zinc-800 bg-black/40 p-4"
          >
            <p className="text-sm leading-relaxed text-zinc-300">
              {update.content}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              {formatDate(update.created_at)}
            </p>
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="mt-4 flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Aggiorna il tuo progresso..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-black/60 px-4 py-3 text-sm text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-violet-500/40"
          />

          <button
            onClick={addUpdate}
            disabled={!content.trim()}
            className={`rounded-2xl px-5 text-sm transition ${
              content.trim()
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }`}
          >
            Aggiorna
          </button>
        </div>
      )}
    </div>
  );
}