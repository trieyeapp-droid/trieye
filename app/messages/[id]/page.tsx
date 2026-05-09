"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";
import { useParams, useRouter } from "next/navigation";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();

  const conversationId = params.id as string;

  const [userId, setUserId] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversation() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/auth/login");
      return;
    }

    setUserId(userData.user.id);

    const { data: conversation } = await supabase
      .from("conversations")
      .select(`
        *,
        user_one_profile:profiles!conversations_user_one_fkey(username, avatar_url),
        user_two_profile:profiles!conversations_user_two_fkey(username, avatar_url)
      `)
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      router.push("/messages");
      return;
    }

    const otherId =
      conversation.user_one === userData.user.id
        ? conversation.user_two
        : conversation.user_one;

    const other =
      conversation.user_one === userData.user.id
        ? conversation.user_two_profile
        : conversation.user_one_profile;

    setOtherUserId(otherId);
    setOtherUser(other);

    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(messagesData || []);
  }

  async function sendMessage() {
    if (!content.trim()) return;

    const text = content;

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userData.user.id,
      content: text,
    });

    if (error) {
      alert("Errore nell'invio del messaggio");
      return;
    }

    if (otherUserId && otherUserId !== userData.user.id) {
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        actor_id: userData.user.id,
        type: "message",
        message: "ti ha scritto una connessione ✦",
      });
    }

    setContent("");
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-[#09090B] px-6 py-8 pb-40 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.push("/messages")}
          className="text-sm text-zinc-500 hover:text-white"
        >
          ← Torna alle connessioni
        </button>

        <div className="mt-6 flex items-center gap-4 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-2xl">
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
            <h1 className="font-trieye text-4xl italic">
              @{otherUser?.username || "utente"}
            </h1>

            <p className="mt-1 text-zinc-500">Continua il pensiero.</p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {messages.map((message) => {
            const mine = message.sender_id === userId;

            return (
              <div
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-[2rem] px-6 py-5 ${
                    mine
                      ? "bg-violet-600/20 text-zinc-100"
                      : "border border-zinc-800 bg-zinc-950/80 text-zinc-200"
                  }`}
                >
                  <p className="font-trieye text-2xl leading-relaxed">
                    {message.content}
                  </p>

                  <p className="mt-3 text-right text-xs text-zinc-500">
                    {formatDate(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-6">
        <div className="mx-auto flex max-w-2xl gap-3 rounded-[2rem] border border-zinc-800 bg-zinc-950/90 p-4 backdrop-blur">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrivi..."
            className="max-h-40 min-h-[60px] flex-1 resize-none bg-transparent px-2 py-3 text-zinc-100 outline-none placeholder:text-zinc-600"
          />

          <button
            onClick={sendMessage}
            disabled={!content.trim()}
            className={`rounded-2xl px-6 transition ${
              content.trim()
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }`}
          >
            Invia
          </button>
        </div>
      </div>

      <Navbar />
    </main>
  );
}