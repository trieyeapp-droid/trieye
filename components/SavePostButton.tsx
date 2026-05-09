"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function SavePostButton({ postId }: { postId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    checkSaved();
  }, []);

  async function checkSaved() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("post_id", postId)
      .maybeSingle();

    setSaved(!!data);
  }

  async function toggleSave() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Devi accedere per salvare un post.");
      return;
    }

    if (saved) {
      await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", userData.user.id)
        .eq("post_id", postId);

      setSaved(false);
      return;
    }

    await supabase.from("saved_posts").insert({
      user_id: userData.user.id,
      post_id: postId,
      visibility: "private",
    });

    setSaved(true);
  }

  return (
    <button
      onClick={toggleSave}
      className={`absolute right-5 top-5 z-10 rounded-full border px-3 py-2 text-sm transition ${
        saved
          ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
          : "border-zinc-800 bg-zinc-950/80 text-zinc-500 hover:text-violet-300"
      }`}
      title={saved ? "Rimuovi dai salvati" : "Salva post"}
    >
      {saved ? "🔖" : "♡"}
    </button>
  );
}