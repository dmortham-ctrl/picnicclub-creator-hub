import { getPublishedProfiles } from "@/lib/data";
import { MembersBrowser } from "./members-browser";
import { SiteNav } from "../components/site-nav";

export default async function MembersPage() { return <main className="directory"><SiteNav /><header className="directory-head"><div className="eyebrow">The directory / 004</div><h1>Find your<br />next follow.</h1><p className="hero-copy">Discover Picnic Club creators by their niche, point of view, and favorite finds.</p></header><MembersBrowser profiles={await getPublishedProfiles()} /></main>; }
