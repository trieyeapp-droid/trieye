"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  postId: string;
  initialHearts: number;
  initialBrokenHearts: number;
};

export default function PostReactionButtons({
  postId,
  initialHearts,
  initialBrokenHearts,
}: Props) {
  const [hearts, setHearts] = useState(initialHearts || 0);
  const [brokenHearts, setBrokenHearts] = useState(initialBrokenHearts || 0);
  const [liked, setLiked] = useState(false);
  const [broken, setBroken] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [breakAnim, setBreakAnim] = useState(false);

  async function createReactionNotification(type: "heart" | "broken_heart") {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    const { data: postData } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!postData?.user_id) return;

    if (postData.user_id === userData.user.id) return;

    await supabase.from("notifications").insert({
      user_id: postData.user_id,
      actor_id: userData.user.id,
      post_id: postId,
      type,
      message:
        type === "heart"
          ? "ha messo ❤️ a un tuo pensiero"
          : "ha messo 💔 a un tuo pensiero",
    });
  }

  async function toggleHeart() {
    const newLiked = !liked;
    const newCount = newLiked ? hearts + 1 : hearts - 1;

    setLiked(newLiked);
    setHearts(newCount);
    setHeartAnim(true);

    setTimeout(() => setHeartAnim(false), 600);

    await supabase
      .from("posts")
      .update({ heart_count: newCount })
      .eq("id", postId);

    if (newLiked) {
      createReactionNotification("heart");
    }
  }

  async function toggleBrokenHeart() {
    const newBroken = !broken;
    const newCount = newBroken ? brokenHearts + 1 : brokenHearts - 1;

    setBroken(newBroken);
    setBrokenHearts(newCount);
    setBreakAnim(true);

    setTimeout(() => setBreakAnim(false), 600);

    await supabase
      .from("posts")
      .update({ broken_heart_count: newCount })
      .eq("id", postId);

    if (newBroken) {
      createReactionNotification("broken_heart");
    }
  }

  return (
    <div className="mt-5 flex items-center gap-3">
      <button
        onClick={toggleHeart}
        className={`relative flex items-center gap-2 rounded-full border px-4 py-2 transition ${
          liked
            ? "border-red-500/40 bg-red-500/10 text-red-400"
            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-red-400"
        }`}
      >
        <span className={`text-2xl ${heartAnim ? "animate-bounce" : ""}`}>
          ❤️
        </span>

        <span className="text-sm">{hearts}</span>
      </button>

      <button
        onClick={toggleBrokenHeart}
        className={`relative flex items-center gap-2 rounded-full border px-4 py-2 transition ${
          broken
            ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-violet-300"
        }`}
      >
        <span className={`text-2xl ${breakAnim ? "animate-bounce" : ""}`}>
          💔
        </span>

        <span className="text-sm">{brokenHearts}</span>
      </button>
    </div>
  );
}