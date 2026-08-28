"use client";

import { FormEvent, useEffect, useState } from "react";
import { CmsSection } from "../cms-section";
import { supabase } from "@/lib/supabase";

type Faq = { id: string; question: string; answer: string; sort_order: number; is_active: boolean };
const empty = { question: "", answer: "", sort_order: 0, is_active: true };

export default function FaqCmsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    if (!supabase) return;
    const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
    if (error) setMessage(error.message);
    setFaqs((data as Faq[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    if (!form.question.trim() || !form.answer.trim()) return setMessage("Pertanyaan dan jawaban wajib diisi.");
    const result = editing
      ? await supabase.from("faqs").update(form).eq("id", editing)
      : await supabase.from("faqs").insert(form);
    if (result.error) return setMessage(result.error.message);
    setMessage(editing ? "FAQ diperbarui." : "FAQ ditambahkan.");
    setForm(empty);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return setMessage(error.message);
    setFaqs(faqs.filter((faq) => faq.id !== id));
    setMessage("FAQ dihapus.");
  }

  async function toggle(faq: Faq) {
    if (!supabase) return;
    const { error } = await supabase.from("faqs").update({ is_active: !faq.is_active }).eq("id", faq.id);
    if (error) return setMessage(error.message);
    setFaqs(faqs.map((f) => (f.id === faq.id ? { ...f, is_active: !f.is_active } : f)));
  }

  return (
    <CmsSection eyebrow="FAQ / 006" title={<>Answer with<br />clarity.</>} description="Kelola pertanyaan dan jawaban yang tampil di homepage.">
      <section className="admin-card">
        <div className="eyebrow">{editing ? "Edit FAQ" : "Tambah FAQ"}</div>
        <form className="admin-form" onSubmit={save}>
          <label>Pertanyaan<input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></label>
          <label>Jawaban<textarea required rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></label>
          <div className="admin-row">
            <label>Urutan<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></label>
            <label className="checkbox-label"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Tampilkan di homepage</label>
          </div>
          <div className="form-actions">
            <button className="button-dark" type="submit">{editing ? "Simpan" : "Tambah"}</button>
            {editing && <button className="button-outline" type="button" onClick={() => { setEditing(null); setForm(empty); }}>Batal</button>}
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="admin-list">
          {faqs.map((faq) => (
            <div className="admin-item" key={faq.id}>
              <div>
                <strong>{faq.question}{!faq.is_active && <em className="link-off"> · disembunyikan</em>}</strong>
                <small>{faq.answer}</small>
              </div>
              <div className="link-row-actions">
                <button className="button-outline" type="button" onClick={() => toggle(faq)}>{faq.is_active ? "Sembunyikan" : "Tampilkan"}</button>
                <button className="button-outline" type="button" onClick={() => { setEditing(faq.id); setForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order, is_active: faq.is_active }); }}>Edit</button>
                <button className="button-outline" type="button" onClick={() => remove(faq.id)}>Hapus</button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && <p className="hero-copy">Belum ada FAQ.</p>}
        </div>
        {message && <p className="cms-message">{message}</p>}
      </section>
    </CmsSection>
  );
}
