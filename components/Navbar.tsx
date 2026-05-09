"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  async function loadUnreadCount() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.user.id)
      .eq("read", false);

    setUnreadCount(count || 0);
  }

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-md -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 text-white backdrop-blur">
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/home"
          className="text-zinc-400 transition hover:text-white"
        >
          Home
        </Link>

        <Link
          href="/write"
          className="rounded-xl bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-500"
        >
          Scrivi
        </Link>

        <Link
          href="/notifications"
          className="relative text-zinc-400 transition hover:text-white"
        >
          🔔

          {unreadCount > 0 && (
            <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          className="text-zinc-400 transition hover:text-white"
        >
          Profilo
        </Link>
      </div>
    </nav>
  );
}