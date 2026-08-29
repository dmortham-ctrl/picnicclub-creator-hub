import Link from "next/link";
import { CmsSidebar } from "./sidebar";
import { BrandLogo } from "@/app/components/brand-logo";

export function CmsSection({ children }: { eyebrow?: string; title?: React.ReactNode; description?: string; children?: React.ReactNode }) {
  return <main className="admin-wrap cms-shell"><CmsSidebar /><div className="cms-main"><div className="cms-header admin-topbar"><BrandLogo href="/superadmin" /><Link href="/" className="button-outline">View website ↗</Link></div>{children ?? <section className="admin-card cms-empty"><div className="eyebrow">Coming next</div><h2>This workspace is ready.</h2><p className="hero-copy">Modul ini sudah memiliki halaman khusus dan siap diisi dengan editor CMS.</p></section>}</div></main>;
}
