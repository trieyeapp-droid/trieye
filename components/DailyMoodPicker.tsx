"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

const dailyMoodOptions = [
  { mood: "nostalgia", emoji: "🌙", label: "nostalgico" },
  { mood: "overthinking", emoji: "🧠", label: "overthinking" },
  { mood: "solitudine", emoji: "🌫️", label: "vuoto" },
  { mood: "speranza", emoji: "✨", label: "speranzoso" },
  { mood: "rabbia", emoji: "⚡", label: "agitato" },
];

export default function DailyMoodPicker() {
  const [selectedMood, setSelectedMood] = useState("");

  async function chooseMood(mood: string) {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    await supabase.from("daily_moods").insert({
      user_id: data.user.id,
      mood,
    });

    setSelectedMood(mood);
  }

  return (
    <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur">
      <p className="text-sm text-zinc-500">
        Come ti senti oggi?
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {dailyMoodOptions.map((item) => (
          <button
            key={item.mood}
            onClick={() => chooseMood(item.mood)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              selectedMood === item.mood
                ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-violet-500/30 hover:text-violet-300"
            }`}
          >
            {item.emoji} {item.label}
          </button>
        ))}
      </div>

      {selectedMood && (
        <p className="mt-4 text-sm text-violet-300">
          ✨ La tua home si adatterà a questo mood.
        </p>
      )}
    </div>
  );
}