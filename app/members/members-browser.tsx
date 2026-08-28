"use client";
import { useState } from "react";
import { Profile } from "@/lib/types";
import { CreatorCard } from "../components/creator-card";

export function MembersBrowser({ profiles }: { profiles: Profile[] }) { const [query, setQuery] = useState(""); const filtered = profiles.filter((p) => `${p.display_name} ${p.username} ${p.category}`.toLowerCase().includes(query.toLowerCase())); return <><div className="directory-controls"><span className="eyebrow" style={{ alignSelf: "center" }}>{filtered.length} creators found</span><input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search creator or niche..." aria-label="Search creator" /></div><div className="profile-grid">{filtered.map((profile) => <CreatorCard key={profile.id} profile={profile} />)}</div></>; }
