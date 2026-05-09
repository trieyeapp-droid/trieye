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
  const [relateCount, setRelateCount] = useState(initialHearts || 0);
  const [disagreeCount, setDisagreeCount] = useState(initialBrokenHearts || 0);

  const [related, setRelated] = useState(false);
  const [disagreed, setDisagreed] = useState(false);

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
          ? "si è rivisto in un tuo pensiero"
          : "non la pensa come te su un tuo pensiero",
    });
  }

  async function toggleRelate() {
    const newValue = !related;
    const newCount = newValue ? relateCount + 1 : relateCount - 1;

    setRelated(newValue);
    setRelateCount(newCount);

    await supabase
      .from("posts")
      .update({ heart_count: newCount })
      .eq("id", postId);

    if (newValue) {
      createReactionNotification("heart");
    }
  }

  async function toggleDisagree() {
    const newValue = !disagreed;
    const newCount = newValue ? disagreeCount + 1 : disagreeCount - 1;

    setDisagreed(newValue);
    setDisagreeCount(newCount);

    await supabase
      .from("posts")
      .update({ broken_heart_count: newCount })
      .eq("id", postId);

    if (newValue) {
      createReactionNotification("broken_heart");
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        onClick={toggleRelate}
        className={`rounded-full border px-4 py-2 text-sm transition ${
          related
            ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-violet-500/30 hover:text-zinc-300"
        }`}
      >
        Mi ci rivedo · {relateCount}
      </button>

      <button
        onClick={toggleDisagree}
        className={`rounded-full border px-4 py-2 text-sm transition ${
          disagreed
            ? "border-zinc-500/40 bg-zinc-800/60 text-zinc-200"
            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
        }`}
      >
        Non la penso così · {disagreeCount}
      </button>
    </div>
  );
}