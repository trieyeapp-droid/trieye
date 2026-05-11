"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
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

  const links = [
    { href: "/home", label: "Home", icon: "⌂" },
    { href: "/write", label: "Scrivi", icon: "✦" },
    { href: "/messages", label: "Connessioni", icon: "∞" },
    { href: "/notifications", label: "Notifiche", icon: "◉" },
    { href: "/profile", label: "Profilo", icon: "☻" },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 w-[94%] max-w-2xl -translate-x-1/2 rounded-[2rem] border border-zinc-800/80 bg-zinc-950/90 px-3 py-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-1 flex-col items-center justify-center rounded-2xl px-2 py-3 transition ${
                active
                  ? "bg-violet-600/15 text-violet-300"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              }`}
            >
              <span className="text-lg">{link.icon}</span>

              <span className="mt-1 text-[10px] sm:text-[11px]">
                {link.label}
              </span>

              {link.href === "/notifications" && unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}