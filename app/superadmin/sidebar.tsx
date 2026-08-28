import Link from "next/link";

export function CmsSidebar() {
  return <aside className="cms-sidebar"><Link href="/" className="brand"><span className="brand-mark">P</span> Picnic CMS</Link><nav><span className="sidebar-label">Workspace</span><Link href="/superadmin">Dashboard</Link><Link href="/superadmin#analytics">Analytics</Link><Link href="/superadmin/homepage">Homepage</Link><Link href="/superadmin/creators">Creators</Link><Link href="/superadmin/levels">Creator levels</Link><Link href="/superadmin/brands">Brands</Link><Link href="/superadmin/faq">FAQ</Link><span className="sidebar-label">System</span><Link href="/superadmin/media">Media</Link><Link href="/superadmin/settings">Settings</Link><Link href="/">View website ↗</Link></nav></aside>;
}
