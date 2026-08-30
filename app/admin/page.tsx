"use client";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { firstIssue, profileSchema } from "@/lib/validation";
import { BrandLogo } from "@/app/components/brand-logo";

export default function AdminPage() { const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [authMode, setAuthMode] = useState<"login" | "signup">("login"); const [message, setMessage] = useState(""); const [loggedIn, setLoggedIn] = useState(false); const [avatarFile, setAvatarFile] = useState<File | null>(null); const [uploading, setUploading] = useState(false); const [profile, setProfile] = useState({ username: "", display_name: "", bio: "", category: "Lifestyle", avatar_url: "", status: "draft" });
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "signup") setAuthMode("signup");
    let redirecting = false;
    const toDashboard = (username: string) => {
      if (redirecting) return;
      redirecting = true;
      window.location.href = `/userpanel?username=${encodeURIComponent(username)}`;
    };
    async function afterAuth(userId: string) {
      // Already a creator? Skip this page and go straight to the dashboard.
      const { data: existing } = await client.from("profiles").select("username").eq("owner_id", userId).maybeSingle();
      if (existing?.username) { toDashboard(existing.username); return; }
      // Was a placeholder profile reserved for this email? Take it over.
      const { data: claimed } = await client.rpc("claim_profile");
      if (claimed?.username) toDashboard(claimed.username);
    }
    (async () => {
      const { data } = await client.auth.getSession();
      setLoggedIn(Boolean(data.session));
      if (data.session) afterAuth(data.session.user.id);
    })();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
      if (session) afterAuth(session.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  async function login(e: FormEvent) { e.preventDefault(); if (!supabase) return setMessage("Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY terlebih dahulu."); const { error } = await supabase.auth.signInWithOtp({ email }); setMessage(error?.message ?? "Magic link sudah dikirim ke email admin."); }
  async function passwordAuth(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return setMessage("Tambahkan environment variables Supabase terlebih dahulu.");
    setMessage("");
    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return setMessage(
          /email not confirmed/i.test(error.message)
            ? "Email kamu belum diverifikasi. Cek inbox (dan folder spam) untuk link verifikasi."
            : error.message,
        );
      }
      setLoggedIn(true);
      return;
    }
    // signup
    if (password !== confirmPassword) return setMessage("Password dan konfirmasi password tidak sama.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      return setMessage(
        /rate limit/i.test(error.message)
          ? "Terlalu banyak email dikirim dalam waktu singkat. Tunggu beberapa menit, lalu coba lagi."
          : error.message,
      );
    }
    // Supabase returns a user with an empty identities array when the email is already registered.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return setMessage("Email ini sudah terdaftar. Silakan login.");
    }
    if (data.session) {
      setLoggedIn(true);
      return;
    }
    setMessage(`Kami sudah mengirim link verifikasi ke ${email}. Buka email itu dan klik linknya untuk mengaktifkan akun, lalu login di sini.`);
  }
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
      const { data: taken } = await supabase.from("profiles").select("id, owner_id").eq("username", payload.username).maybeSingle();
      if (taken?.owner_id) { setMessage("Username ini sudah dipakai creator lain."); setUploading(false); return; }
      if (taken) {
        // Placeholder profile with this username — claim it if it's open or reserved for us.
        const { data: claimed, error: claimError } = await supabase.rpc("claim_profile", { target_username: payload.username });
        if (claimError) { setMessage(claimError.message); setUploading(false); return; }
        if (!claimed) { setMessage("Username ini sudah disiapkan untuk creator lain. Hubungi admin Picnic Club."); setUploading(false); return; }
        window.location.href = `/userpanel?username=${encodeURIComponent(payload.username)}`;
        return;
      }
      const { error } = await supabase.from("profiles").insert({ ...payload, status: "draft" });
      if (error) { setMessage(error.message); setUploading(false); return; }
    }

    window.location.href = `/userpanel?username=${encodeURIComponent(payload.username)}`;
  }
  if (!loggedIn) return <main className="admin-wrap"><div className="admin-topbar"><BrandLogo href={null} /></div><div className="admin-card"><div className="eyebrow">Private workspace</div><h2>{authMode === "login" ? "Welcome back." : "Join Picnic Club."}</h2><p className="hero-copy">{authMode === "login" ? "Login ke dashboard creator Anda." : "Buat akun creator baru di Picnic Club."}</p><div className="auth-tabs"><button type="button" className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setMessage(""); }}>Login</button><button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => { setAuthMode("signup"); setMessage(""); }}>Sign up</button></div><button className="button-google" type="button" onClick={loginWithGoogle}>Continue with Google</button><div className="login-divider"><span>atau email</span></div><form className="admin-form" onSubmit={passwordAuth}><label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" /></label>{authMode === "signup" && <label>Confirm password<input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" /></label>}<button className="button-dark" type="submit">{authMode === "login" ? "Login" : "Create account"}</button></form>{authMode === "login" && <button className="magic-link-button" type="button" onClick={login}>Send magic link instead</button>}{message && <p className={/verifikasi ke |magic link/i.test(message) ? "form-notice" : "error"}>{message}</p>}</div></main>;
  return <main className="admin-wrap"><div className="admin-topbar"><BrandLogo href={null} /><button className="button-outline" type="button" onClick={logout}>Log out</button></div><div className="admin-card"><div className="eyebrow">Profiles / new</div><h2>Create creator.</h2><form className="admin-form" onSubmit={save}><div className="admin-row"><label>Username<input required value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "") })} placeholder="nama.creator" /></label><label>Display name<input required value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} /></label></div><label>Bio<textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></label><div className="admin-row"><label>Category<input value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })} /></label><label>Upload avatar<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} /><small style={{ color: "var(--muted)" }}>JPG, PNG, atau WebP. Maks. 5 MB.</small></label></div><button className="button-dark" type="submit" disabled={uploading}>{uploading ? "Menyimpan..." : "Save draft"}</button></form>{message && <p className="error">{message}</p>}</div></main>; }
