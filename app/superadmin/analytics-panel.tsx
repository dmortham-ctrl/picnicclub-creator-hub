"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Summary = {
  window_days: number;
  totals: Record<string, number>;
  daily: { day: string; page_views: number; profile_views: number; link_clicks: number; cta_clicks: number }[];
  top_links: { label: string; url: string; username: string; clicks: number }[];
  top_profiles: { username: string; display_name: string; views: number }[];
  top_ctas: Record<string, number>;
};

const RANGES = [7, 30, 90];

export function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.rpc("analytics_summary", { days }).then(({ data, error }) => {
      if (error) return setError(error.message);
      setError("");
      setData(data as Summary);
    });
  }, [days]);

  const totals = data?.totals ?? {};
  const profileViews = data?.daily.reduce((sum, d) => sum + d.profile_views, 0) ?? 0;
  const linkClicks = totals.link_click ?? 0;
  const ctr = profileViews ? Math.round((linkClicks / profileViews) * 100) : 0;

  return (
    <section id="analytics" className="admin-card">
      <div className="cms-section-head">
        <div>
          <div className="eyebrow">Analytics / 005</div>
          <h2>What&apos;s working.</h2>
        </div>
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button key={r} type="button" className={days === r ? "active" : ""} onClick={() => setDays(r)}>
              {r}d
            </button>
          ))}
        </div>
      </div>
      {error && <p className="cms-message">{error}</p>}
      {!data ? (
        <p className="hero-copy">Memuat data...</p>
      ) : (
        <>
          <div className="stat-row">
            <div><strong>{totals.page_view ?? 0}</strong><small>Page views</small></div>
            <div><strong>{totals.profile_view ?? 0}</strong><small>Profile views</small></div>
            <div><strong>{linkClicks}</strong><small>Link clicks</small></div>
            <div><strong>{totals.cta_click ?? 0}</strong><small>CTA clicks</small></div>
            <div><strong>{ctr}%</strong><small>Click-through</small></div>
          </div>

          <div className="analytics-cols">
            <div>
              <h3>Top links</h3>
              {data.top_links.length === 0 && <p className="hero-copy">Belum ada klik.</p>}
              {data.top_links.map((link, i) => (
                <div className="analytics-line" key={i}>
                  <span><strong>{link.label}</strong><small>@{link.username}</small></span>
                  <span className="analytics-count">{link.clicks}</span>
                </div>
              ))}
            </div>
            <div>
              <h3>Top profiles</h3>
              {data.top_profiles.length === 0 && <p className="hero-copy">Belum ada kunjungan.</p>}
              {data.top_profiles.map((profile, i) => (
                <div className="analytics-line" key={i}>
                  <span><strong>{profile.display_name}</strong><small>@{profile.username}</small></span>
                  <span className="analytics-count">{profile.views}</span>
                </div>
              ))}
            </div>
            <div>
              <h3>CTA clicks</h3>
              {Object.keys(data.top_ctas).length === 0 && <p className="hero-copy">Belum ada klik CTA.</p>}
              {Object.entries(data.top_ctas).map(([key, count]) => (
                <div className="analytics-line" key={key}>
                  <span><strong>{key}</strong></span>
                  <span className="analytics-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="analytics-note">
            Agregat {days} hari terakhir. Tanpa data pribadi, IP, atau query string affiliate mentah.
          </p>
        </>
      )}
    </section>
  );
}
