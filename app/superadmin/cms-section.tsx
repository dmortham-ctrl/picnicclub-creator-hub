import Link from "next/link";
import { CmsSidebar } from "./sidebar";

export function CmsSection({ eyebrow, title, description, children }: { eyebrow: string; title: React.ReactNode; description: string; children?: React.ReactNode }) {
  return <main className="admin-wrap cms-shell"><CmsSidebar /><div className="cms-main"><div className="cms-header"><Link href="/superadmin" className="brand"><span className="brand-mark">P</span> picnic club CMS</Link><Link href="/" className="button-outline">View website ↗</Link></div><div className="panel-hero"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="hero-copy">{description}</p></div>{children ?? <section className="admin-card cms-empty"><div className="eyebrow">Coming next</div><h2>This workspace is ready.</h2><p className="hero-copy">Modul ini sudah memiliki halaman khusus dan siap diisi dengan editor CMS.</p></section>}</div></main>;
}
