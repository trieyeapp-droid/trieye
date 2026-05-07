"use client";

import { useState } from "react";

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button
      onClick={() => setLiked(!liked)}
      className="transition"
    >
      <span
        className={`text-3xl transition ${
          liked
            ? "text-red-500"
            : "text-zinc-600 hover:text-zinc-400"
        }`}
      >
        ♥
      </span>
    </button>
  );
}