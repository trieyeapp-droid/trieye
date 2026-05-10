"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/home",
      label: "Home",
      icon: "⌂",
    },

    {
      href: "/write",
      label: "Scrivi",
      icon: "✦",
    },

    {
      href: "/notifications",
      label: "Notifiche",
      icon: "◉",
    },

    {
      href: "/profile",
      label: "Profilo",
      icon: "☻",
    },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2 rounded-[2rem] border border-zinc-800/80 bg-zinc-950/90 px-3 py-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center justify-center rounded-2xl px-4 py-3 transition ${
                active
                  ? "bg-violet-600/15 text-violet-300"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              }`}
            >
              <span className="text-lg">
                {link.icon}
              </span>

              <span className="mt-1 text-[11px]">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}