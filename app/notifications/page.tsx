"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/auth/login");
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("*, profiles!notifications_actor_id_fkey(username, avatar_url)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userData.user.id);
  }

  function getNotificationLink(notification: any) {
    if (notification.type === "message" && notification.conversation_id) {
      return `/messages/${notification.conversation_id}`;
    }

    if (notification.post_id) {
      return `/post/${notification.post_id}`;
    }

    if (notification.profiles?.username) {
      return `/u/${encodeURIComponent(notification.profiles.username)}`;
    }

    return "/notifications";
  }

  function getProfileLink(notification: any) {
    if (notification.profiles?.username) {
      return `/u/${encodeURIComponent(notification.profiles.username)}`;
    }

    return "/notifications";
  }

  return (
    <main className="min-h-screen bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-violet-400">Trieye</p>

        <h1 className="font-trieye mt-2 text-6xl italic tracking-tight">
          Notifiche
        </h1>

        <p className="mt-4 text-zinc-500">
          Qui trovi chi ha interagito con i tuoi pensieri.
        </p>

        <div className="mt-8 space-y-4">
          {notifications.length === 0 && (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 text-zinc-500">
              Nessuna notifica per ora.
            </div>
          )}

          {notifications.map((notification) => {
            const notificationLink = getNotificationLink(notification);
            const profileLink = getProfileLink(notification);

            return (
              <div
                key={notification.id}
                onClick={() => router.push(notificationLink)}
                className={`cursor-pointer rounded-[2rem] border p-5 transition hover:border-violet-500/40 ${
                  notification.read
                    ? "border-zinc-800 bg-zinc-950/70"
                    : "border-violet-500/30 bg-violet-500/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={profileLink}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 transition hover:scale-105"
                  >
                    {notification.profiles?.avatar_url ? (
                      <img
                        src={notification.profiles.avatar_url}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>👁️</span>
                    )}
                  </Link>

                  <div>
                    <p className="text-zinc-200">
                      {notification.profiles?.username ? (
                        <>
                          <Link
                            href={profileLink}
                            onClick={(e) => e.stopPropagation()}
                            className="transition hover:text-violet-300"
                          >
                            @{notification.profiles.username}
                          </Link>{" "}
                          {notification.message}
                        </>
                      ) : (
                        notification.message
                      )}
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      Apri
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Navbar />
    </main>
  );
}