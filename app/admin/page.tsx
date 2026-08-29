"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { firstIssue, profileSchema } from "@/lib/validation";
import { BrandLogo } from "@/app/components/brand-logo";

export default function AdminPage() { const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [authMode, setAuthMode] = useState<"login" | "signup">("login"); const [message, setMessage] = useState(""); const [loggedIn, setLoggedIn] = useState(false); const [avatarFile, setAvatarFile] = useState<File | null>(null); const [uploading, setUploading] = useState(false); const [profile, setProfile] = useState({ username: "", display_name: "", bio: "", category: "Lifestyle", avatar_url: "", status: "draft" });
  useEffect(() => { if (!supabase) return; const client = supabase; const mode = new URLSearchParams(window.location.search).get("mode"); if (mode === "signup") setAuthMode("signup"); const loadSession = async () => { const { data } = await client.auth.getSession(); setLoggedIn(Boolean(data.session)); if (data.session) { const { data: existing } = await client.from("profiles").select("*").eq("owner_id", data.session.user.id).maybeSingle(); if (existing) setProfile(existing); } }; loadSession(); const { data: listener } = client.auth.onAuthStateChange((_event, session) => { setLoggedIn(Boolean(session)); if (session) client.from("profiles").select("*").eq("owner_id", session.user.id).maybeSingle().then(({ data }) => { if (data) setProfile(data); }); }); return () => listener.subscription.unsubscribe(); }, []);
  async function login(e: FormEvent) { e.preventDefault(); if (!supabase) return setMessage("Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY terlebih dahulu."); const { error } = await supabase.auth.signInWithOtp({ email }); setMessage(error?.message ?? "Magic link sudah dikirim ke email admin."); }
  async function passwordAuth(e: FormEvent) { e.preventDefault(); if (!supabase) return setMessage("Tambahkan environment variables Supabase terlebih dahulu."); if (authMode === "signup" && password !== confirmPassword) return setMessage("Password dan konfirmasi password tidak sama."); const result = authMode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } }); if (result.error) return setMessage(result.error.message); setMessage(authMode === "signup" ? "Signup berhasil. Cek email untuk verifikasi akun." : "Login berhasil."); if (authMode === "login") setLoggedIn(true); }
  async function loginWithGoogle() { if (!supabase) return setMessage("Tambahkan environment variables Supabase terlebih dahulu."); const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/admin` } }); if (error) setMessage(error.message); }
  async function logout() { await supabase?.auth.signOut(); setLoggedIn(false); setMessage(""); }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) return setMessage(firstIssue(parsed.error));
    setMessage("");
    setUploading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setMessage("Session login tidak ditemukan. Silakan login kembali."); setUploading(false); return; }

    let avatarUrl = parsed.data.avatar_url;
    if (avatarFile) {
      if (!avatarFile.type.startsWith("image/")) { setMessage("Avatar harus berupa file gambar."); setUploading(false); return; }
      if (avatarFile.size > 5 * 1024 * 1024) { setMessage("Ukuran avatar maksimal 5 MB."); setUploading(false); return; }
      const path = `${crypto.randomUUID()}-${avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("Avatar").upload(path, avatarFile, { contentType: avatarFile.type, upsert: false });
      if (uploadError) { setMessage(uploadError.message); setUploading(false); return; }
      avatarUrl = supabase.storage.from("Avatar").getPublicUrl(path).data.publicUrl;
    }

    // One profile per account. Update the existing row by id, otherwise insert
    // a new one after checking the username is free - never blind-upsert on
    // username, which could target another creator's row.
    const { data: existing } = await supabase.from("profiles").select("id").eq("owner_id", userData.user.id).maybeSingle();
    const payload = { ...parsed.data, avatar_url: avatarUrl, owner_id: userData.user.id };

    if (existing) {
      const { error } = await supabase.from("profiles").update(payload).eq("id", existing.id);
      if (error) { setMessage(error.message); setUploading(false); return; }
    } else {
      const { data: taken } = await supabase.from("profiles").select("id").eq("username", payload.username).maybeSingle();
      if (taken) { setMessage("Username ini sudah dipakai creator lain."); setUploading(false); return; }
      const { error } = await supabase.from("profiles").insert({ ...payload, status: "draft" });
      if (error) { setMessage(error.message); setUploading(false); return; }
    }

    setUploading(false);
    router.push(`/userpanel?username=${encodeURIComponent(payload.username)}`);
  }
  if (!loggedIn) return <main className="admin-wrap"><BrandLogo href={null} /><div className="admin-card"><div className="eyebrow">Private workspace</div><h2>{authMode === "login" ? "Welcome back." : "Join Picnic Club."}</h2><p className="hero-copy">{authMode === "login" ? "Login ke dashboard creator Anda." : "Buat akun creator baru di Picnic Club."}</p><div className="auth-tabs"><button type="button" className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setMessage(""); }}>Login</button><button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => { setAuthMode("signup"); setMessage(""); }}>Sign up</button></div><button className="button-google" type="button" onClick={loginWithGoogle}>Continue with Google</button><div className="login-divider"><span>atau email</span></div><form className="admin-form" onSubmit={passwordAuth}><label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" /></label>{authMode === "signup" && <label>Confirm password<input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" /></label>}<button className="button-dark" type="submit">{authMode === "login" ? "Login" : "Create account"}</button></form>{authMode === "login" && <button className="magic-link-button" type="button" onClick={login}>Send magic link instead</button>}{message && <p className="error">{message}</p>}</div></main>;
  return <main className="admin-wrap"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><BrandLogo href={null} /><button className="button-outline" type="button" onClick={logout}>Log out</button></div><div className="admin-card"><div className="eyebrow">Profiles / new</div><h2>Create creator.</h2><form className="admin-form" onSubmit={save}><div className="admin-row"><label>Username<input required value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase() })} placeholder="nama.creator" /></label><label>Display name<input required value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} /></label></div><label>Bio<textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></label><div className="admin-row"><label>Category<input value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })} /></label><label>Upload avatar<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} /><small style={{ color: "var(--muted)" }}>JPG, PNG, atau WebP. Maks. 5 MB.</small></label></div><label>Avatar URL (opsional)<input type="url" value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} placeholder="Gunakan URL jika tidak upload file" /></label><button className="button-dark" type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Save draft"}</button></form>{message && <p>{message}</p>}</div></main>; }
