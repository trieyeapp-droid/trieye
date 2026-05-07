"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function CommentHeartButton({
  commentId,
  initialHearts,
}: {
  commentId: string;
  initialHearts: number;
}) {
  const [liked, setLiked] = useState(false);
  const [hearts, setHearts] = useState(initialHearts || 0);

  async function toggleLike() {
    const newLiked = !liked;
    const newCount = newLiked ? hearts + 1 : hearts - 1;

    setLiked(newLiked);
    setHearts(newCount);

    await supabase
      .from("comments")
      .update({ heart_count: newCount })
      .eq("id", commentId);
  }

  return (
    <button
      onClick={toggleLike}
      className={`ml-3 flex items-center gap-1 text-sm transition ${
        liked ? "text-red-400" : "text-zinc-500 hover:text-red-400"
      }`}
    >
      <span className="text-lg">♥</span>
      <span>{hearts}</span>
    </button>
  );
}