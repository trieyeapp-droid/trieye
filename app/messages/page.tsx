"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/auth/login");
      return;
    }

    setUserId(userData.user.id);

    const { data } = await supabase
      .from("conversations")
      .select(`
        *,
        user_one_profile:profiles!conversations_user_one_fkey(username, avatar_url),
        user_two_profile:profiles!conversations_user_two_fkey(username, avatar_url)
      `)
      .or(`user_one.eq.${userData.user.id},user_two.eq.${userData.user.id}`)
      .order("created_at", { ascending: false });

    setConversations(data || []);
  }

  function getOtherUser(conversation: any) {
    if (conversation.user_one === userId) {
      return conversation.user_two_profile;
    }

    return conversation.user_one_profile;
  }

  return (
    <main className="min-h-screen bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-violet-400">Trieye</p>

        <h1 className="font-trieye mt-2 text-6xl italic tracking-tight">
          Connessioni
        </h1>

        <p className="mt-4 text-zinc-500">
          Persone con cui hai continuato un pensiero.
        </p>

        <div className="mt-8 space-y-4">
          {conversations.length === 0 && (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 text-zinc-500">
              Nessuna connessione ancora.
            </div>
          )}

          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-4 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5 transition hover:border-violet-500/40"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-2xl">
                  {otherUser?.avatar_url ? (
                    <img
                      src={otherUser.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>👁️</span>
                  )}
                </div>

                <div>
                  <p className="text-zinc-200">
                    @{otherUser?.username || "utente"}
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    Apri connessione
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Navbar />
    </main>
  );
}