import Link from "next/link";
export default function NotFound() { return <main className="bio-page"><div className="bio-card"><div className="bio-brand">picnic club</div><h1 style={{ marginTop: 100 }}>Page not found.</h1><p className="bio-copy">Profile ini belum tersedia atau sudah tidak aktif.</p><Link className="button-dark" href="/members">Back to creators</Link></div></main>; }
