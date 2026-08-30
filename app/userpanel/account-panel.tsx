"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AccountPanel({ onNotice, onError }: { onNotice: (m: string) => void; onError: (m: string) => void }) {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setCurrentEmail(data.user?.email ?? ""));
  }, []);

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return onError("Masukkan alamat email yang valid.");
    if (email === currentEmail) return onError("Email baru sama dengan email saat ini.");
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email });
    setSavingEmail(false);
    if (error) return onError(error.message);
    onError("");
    setNewEmail("");
    onNotice("Cek kotak masuk email lama dan baru untuk mengonfirmasi perubahan.");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (pw1.length < 8) return onError("Password minimal 8 karakter.");
    if (pw1 !== pw2) return onError("Konfirmasi password tidak cocok.");
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setSavingPw(false);
    if (error) return onError(error.message);
    onError("");
    setPw1("");
    setPw2("");
    onNotice("Password berhasil diperbarui.");
  }

  async function signOutEverywhere() {
    await supabase?.auth.signOut({ scope: "global" });
    window.location.href = "/";
  }

  return (
    <div className="admin-card account-panel">
      <div className="appear-head">
        <h3>Akun</h3>
        <p>Ubah email login atau password kamu.</p>
      </div>

      <form className="admin-form account-form" onSubmit={changeEmail}>
        <label>
          Email login
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={currentEmail || "email@kamu.com"} />
        </label>
        <div className="form-actions">
          <button className="button-dark" type="submit" disabled={savingEmail || !newEmail.trim()}>
            {savingEmail ? "Mengirim..." : "Ubah email"}
          </button>
        </div>
      </form>

      <form className="admin-form account-form" onSubmit={changePassword}>
        <div className="admin-row">
          <label>Password baru<input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} autoComplete="new-password" /></label>
          <label>Ulangi password baru<input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></label>
        </div>
        <div className="form-actions">
          <button className="button-dark" type="submit" disabled={savingPw || !pw1 || !pw2}>
            {savingPw ? "Menyimpan..." : "Ubah password"}
          </button>
        </div>
      </form>

      <div className="account-danger">
        <button type="button" className="button-outline" onClick={signOutEverywhere}>Keluar dari semua perangkat</button>
      </div>
    </div>
  );
}
