"use client";
import { useMemo, useState } from "react";
import { Profile } from "@/lib/types";
import { CreatorCard } from "../components/creator-card";

export function MembersBrowser({ profiles }: { profiles: Profile[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(profiles.map((p) => p.category).filter(Boolean))).sort(),
    [profiles],
  );

  const filtered = profiles.filter((p) => {
    const matchesQuery = `${p.display_name} ${p.username} ${p.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <div className="directory-controls">
        <span className="eyebrow" style={{ alignSelf: "center" }}>{filtered.length} creators found</span>
        <div className="directory-inputs">
          <select
            className="search"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter kategori"
          >
            <option value="all">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creator or niche..."
            aria-label="Search creator"
          />
        </div>
      </div>
      {filtered.length > 0 ? (
        <div className="profile-grid">
          {filtered.map((profile) => (
            <CreatorCard key={profile.id} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="directory-empty">
          <p>Tidak ada creator yang cocok.</p>
          <button
            className="button-outline"
            type="button"
            onClick={() => { setQuery(""); setCategory("all"); }}
          >
            Reset pencarian
          </button>
        </div>
      )}
    </>
  );
}
