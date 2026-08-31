"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CmsSidebar } from "../sidebar";
import { BrandLogo } from "@/app/components/brand-logo";
import Link from "next/link";

type JoinRequest = {
  id: string;
  program: "tiktok" | "shopee";
  name: string;
  whatsapp: string;
  email: string;
  social_username: string;
  experience: string;
  note: string;
  status: "new" | "contacted" | "approved" | "rejected";
  created_at: string;
};

const STATUS: JoinRequest["status"][] = ["new", "contacted", "approved", "rejected"];
const STATUS_LABEL: Record<JoinRequest["status"], string> = {
  new: "Baru",
  contacted: "Dihubungi",
  approved: "Diterima",
  rejected: "Ditolak",
};

export default function JoinRequestsPage() {
  const [rows, setRows] = useState<JoinRequest[]>([]);
  const [program, setProgram] = useState<"all" | "tiktok" | "shopee">("all");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    let q = supabase.from("join_requests").select("*").order("created_at", { ascending: false }).limit(200);
    if (program !== "all") q = q.eq("program", program);
    const { data, error } = await q;
    if (error) return setMessage(error.message);
    setRows((data as JoinRequest[]) ?? []);
  }, [program]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: JoinRequest["status"]) {
    if (!supabase) return;
    const { error } = await supabase.from("join_requests").update({ status }).eq("id", id);
    if (error) return setMessage(error.message);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  return (
    <main className="admin-wrap cms-shell">
      <CmsSidebar />
      <div className="cms-main">
        <div className="cms-header admin-topbar">
          <BrandLogo href="/" />
          <Link href="/" className="button-outline">View website ↗</Link>
        </div>
        {message && <p className="cms-message">{message}</p>}

        <section className="admin-card">
          <div className="eyebrow">Pendaftaran agency</div>
          <h2>Join requests ({rows.length})</h2>
          <div className="cms-filter">
            {(["all", "tiktok", "shopee"] as const).map((p) => (
              <button key={p} type="button" className={program === p ? "active" : ""} onClick={() => setProgram(p)}>
                {p === "all" ? "Semua" : p === "tiktok" ? "TikTok" : "Shopee"}
              </button>
            ))}
          </div>

          <div className="join-table">
            {rows.length === 0 && <p className="hero-copy">Belum ada pendaftaran.</p>}
            {rows.map((r) => (
              <div className="join-row" key={r.id}>
                <div className="join-row-main">
                  <strong>
                    {r.name}
                    <span className="join-tag">{r.program === "tiktok" ? "TikTok" : "Shopee"}</span>
                    <span className={`join-status join-status--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                  </strong>
                  <small>
                    <a href={`https://wa.me/${r.whatsapp}`} target="_blank" rel="noreferrer">wa.me/{r.whatsapp}</a>
                    {r.email && <> · {r.email}</>}
                    {r.social_username && <> · {r.social_username}</>}
                    {r.experience && <> · {r.experience}</>}
                    {" · "}{new Date(r.created_at).toLocaleString("id-ID")}
                  </small>
                  {r.note && <p className="join-note">{r.note}</p>}
                </div>
                <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value as JoinRequest["status"])}>
                  {STATUS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
