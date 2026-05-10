"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PublicUserPage() {
  const params = useParams();
  const router = useRouter();
  const username = decodeURIComponent(params.username as string);

  const [currentUserId, setCurrentUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [publicSavedPosts, setPublicSavedPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    loadPublicProfile();
  }, []);

  async function loadPublicProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) setCurrentUserId(userData.user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (!profileData) {
      router.push("/home");
      return;
    }

    setProfile(profileData);

    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", profileData.id)
      .order("created_at", { ascending: false });

    setPosts(postsData || []);

    const { data: savedData } = await supabase
      .from("saved_posts")
      .select("id, posts(*)")
      .eq("user_id", profileData.id)
      .eq("visibility", "public")
      .order("created_at", { ascending: false });

    setPublicSavedPosts(savedData || []);

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileData.id);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profileData.id);

    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    if (userData.user) {
      const { data: followData } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", userData.user.id)
        .eq("following_id", profileData.id)
        .maybeSingle();

      setIsFollowing(!!followData);
    }
  }

  async function toggleFollow() {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    if (!profile || currentUserId === profile.id) return;

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", profile.id);

      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: profile.id,
      });

      await supabase.from("notifications").insert({
        user_id: profile.id,
        actor_id: currentUserId,
        type: "follow",
        message: "ha iniziato a seguirti 👁️",
      });

      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }
  }

  async function startConversation() {
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    if (!profile || currentUserId === profile.id) return;

    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(user_one.eq.${currentUserId},user_two.eq.${profile.id}),and(user_one.eq.${profile.id},user_two.eq.${currentUserId})`
      )
      .maybeSingle();

    if (existingConversation) {
      router.push(`/messages/${existingConversation.id}`);
      return;
    }

    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        user_one: currentUserId,
        user_two: profile.id,
      })
      .select()
      .single();

    if (error || !newConversation) {
      alert("Errore nella creazione della connessione.");
      return;
    }

    router.push(`/messages/${newConversation.id}`);
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#09090B] px-6 py-8 text-white">
        Caricamento...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090B] px-6 py-8 pb-28 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-3xl">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>👁️</span>
              )}
            </div>

            <div>
              <h1 className="font-trieye text-5xl italic">
                @{profile.username}
              </h1>

              <p className="mt-2 text-zinc-500">
                {profile.bio || "Nessuna bio."}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-zinc-800 px-4 py-3">
              <p className="text-xl text-white">{posts.length}</p>
              <p className="text-zinc-500">pensieri</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 px-4 py-3">
              <p className="text-xl text-white">{followersCount}</p>
              <p className="text-zinc-500">seguaci</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 px-4 py-3">
              <p className="text-xl text-white">{followingCount}</p>
              <p className="text-zinc-500">seguiti</p>
            </div>
          </div>

          {currentUserId !== profile.id && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={toggleFollow}
                className={`rounded-2xl px-6 py-4 transition ${
                  isFollowing
                    ? "border border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-violet-600 text-white hover:bg-violet-500"
                }`}
              >
                {isFollowing ? "Segui già" : "Segui"}
              </button>

              <button
                onClick={startConversation}
                className="rounded-2xl border border-zinc-700 px-6 py-4 text-zinc-300 transition hover:border-violet-500/40 hover:text-white"
              >
                Scrivi
              </button>
            </div>
          )}
        </div>

        <h2 className="font-trieye mt-10 text-4xl italic">
          Pensieri di @{profile.username}
        </h2>

        <div className="mt-6 space-y-5">
          {posts.map((post) => (
            <article
              key={post.id}
              className="relative rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7"
            >
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                {post.mood}
              </span>

              <p className="font-trieye mt-5 text-3xl leading-relaxed">
                {post.content}
              </p>
            </article>
          ))}
        </div>

        <h2 className="font-trieye mt-12 text-4xl italic">
          Pensieri salvati pubblici
        </h2>

        <div className="mt-6 space-y-5">
          {publicSavedPosts.length === 0 && (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 text-zinc-500">
              Nessun pensiero salvato pubblico.
            </div>
          )}

          {publicSavedPosts.map((saved) => {
            const post = saved.posts;
            if (!post) return null;

            return (
              <Link
                key={saved.id}
                href={`/post/${post.id}`}
                className="block rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 transition hover:border-violet-500/40"
              >
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  {post.mood}
                </span>

                <p className="font-trieye mt-5 text-3xl leading-relaxed text-zinc-100">
                  {post.content}
                </p>

                <p className="mt-4 text-sm text-zinc-600">
                  Salvato da @{profile.username}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <Navbar />
    </main>
  );
}