"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [message, setMessage] = useState("");
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/auth/login");
      return;
    }

    setUserId(userData.user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setProfile(profileData);
    setUsername(profileData?.username || "");
    setBio(profileData?.bio || "");
    setAvatarUrl(profileData?.avatar_url || "");

    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    setPosts(postsData || []);

    const { data: savedData } = await supabase
      .from("saved_posts")
      .select("id, visibility, posts(*)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    setSavedPosts(savedData || []);

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userData.user.id);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userData.user.id);

    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);
  }

  async function changeSavedVisibility(
    savedId: string,
    visibility: "private" | "public"
  ) {
    await supabase
      .from("saved_posts")
      .update({ visibility })
      .eq("id", savedId);

    setSavedPosts((prev) =>
      prev.map((item) =>
        item.id === savedId ? { ...item, visibility } : item
      )
    );
  }

  async function removeSavedPost(savedId: string) {
    await supabase.from("saved_posts").delete().eq("id", savedId);

    setSavedPosts((prev) => prev.filter((item) => item.id !== savedId));
  }

  async function uploadAvatar(file: File) {
    if (!userId) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (error) {
      setMessage("Errore nel caricamento immagine.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
  }

  async function saveProfile() {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        bio,
        avatar_url: avatarUrl,
      })
      .eq("id", userId);

    if (error) {
      setMessage("Errore nel salvataggio del profilo.");
      return;
    }

    setMessage("✨ Profilo aggiornato con successo");
    setTimeout(() => setMessage(""), 3000);

    loadProfile();
  }

  async function deletePost() {
    if (!postToDelete) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postToDelete)
      .eq("user_id", userId);

    if (error) {
      setMessage("Errore durante la cancellazione del post.");
      setPostToDelete(null);
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postToDelete));
    setPostToDelete(null);

    setMessage("🗑️ Post cancellato con successo");
    setTimeout(() => setMessage(""), 3000);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main className="relative min-h-screen bg-[#09090B] px-6 py-8 pb-28 text-white">
      {message && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-violet-500/30 bg-zinc-950 px-5 py-4 text-sm text-zinc-200 shadow-2xl shadow-violet-950/40">
          {message}
        </div>
      )}

      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur">
          <div className="max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-7 text-center shadow-2xl">
            <h2 className="font-trieye text-4xl italic">
              Cancellare questo post?
            </h2>

            <p className="mt-4 text-zinc-500">
              Questa azione non può essere annullata.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                className="flex-1 rounded-2xl border border-zinc-700 px-5 py-3 text-zinc-300"
              >
                Annulla
              </button>

              <button
                onClick={deletePost}
                className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-white"
              >
                Cancella
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-violet-600/20 text-3xl">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>👁️</span>
              )}
            </div>

            <div>
              <h1 className="font-trieye text-5xl italic">
                @{profile?.username || "utente"}
              </h1>

              <p className="mt-2 text-zinc-500">
                {profile?.bio || "Nessuna bio."}
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

          <div className="mt-8 grid gap-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="rounded-2xl border border-zinc-800 bg-black/60 px-5 py-4 outline-none"
            />

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Scrivi una bio..."
              className="h-28 resize-none rounded-2xl border border-zinc-800 bg-black/60 px-5 py-4 outline-none"
            />

            <label className="cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-black/40 px-5 py-4 text-sm text-zinc-400">
              Carica immagine profilo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                }}
              />
            </label>

            <button
              onClick={saveProfile}
              className="rounded-2xl bg-violet-600 px-6 py-4 text-white"
            >
              Salva profilo
            </button>

            <button
              onClick={logout}
              className="rounded-2xl border border-zinc-800 px-4 py-3 text-zinc-400"
            >
              Esci
            </button>
          </div>
        </div>

        <h2 className="font-trieye mt-10 text-4xl italic">I tuoi pensieri</h2>

        <div className="mt-6 space-y-5">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  {post.mood}
                </span>

                <button
                  onClick={() => setPostToDelete(post.id)}
                  className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-400"
                >
                  Elimina
                </button>
              </div>

              <p className="font-trieye mt-5 text-3xl leading-relaxed">
                {post.content}
              </p>
            </article>
          ))}
        </div>

        <h2 className="font-trieye mt-12 text-4xl italic">
          Pensieri salvati
        </h2>

        <div className="mt-6 space-y-5">
          {savedPosts.length === 0 && (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7 text-zinc-500">
              Non hai ancora salvato nessun pensiero.
            </div>
          )}

          {savedPosts.map((saved) => {
            const post = saved.posts;

            if (!post) return null;

            return (
              <article
                key={saved.id}
                className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                    {post.mood}
                  </span>

                  <div className="flex gap-2">
                    <select
                      value={saved.visibility}
                      onChange={(e) =>
                        changeSavedVisibility(
                          saved.id,
                          e.target.value as "private" | "public"
                        )
                      }
                      className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400 outline-none"
                    >
                      <option value="private">Privato</option>
                      <option value="public">Pubblico</option>
                    </select>

                    <button
                      onClick={() => removeSavedPost(saved.id)}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-400"
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>

                <p className="font-trieye mt-5 text-3xl leading-relaxed">
                  {post.content}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <Navbar />
    </main>
  );
}