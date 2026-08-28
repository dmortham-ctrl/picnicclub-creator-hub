import { getPublishedProfiles } from "@/lib/data";
import { MembersBrowser } from "./members-browser";
import { SiteNav } from "../components/site-nav";
import { TrackView } from "../components/analytics";

export const revalidate = 600;

export const metadata = {
  title: "Creators | Picnic Club",
  description: "Temukan creator dan affiliator Picnic Club berdasarkan niche dan rekomendasi mereka.",
  alternates: { canonical: "/members" },
};

export default async function MembersPage() { return <main className="directory"><TrackView /><SiteNav /><header className="directory-head"><div className="eyebrow">The directory / 004</div><h1>Find your<br />next follow.</h1><p className="hero-copy">Discover Picnic Club creators by their niche, point of view, and favorite finds.</p></header><MembersBrowser profiles={await getPublishedProfiles()} /></main>; }
