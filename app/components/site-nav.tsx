"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function SiteNav() {
  const [profileUrl, setProfileUrl] = useState("/admin?mode=login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const syncProfile = async (userId?: string) => {
      if (!userId) { setIsLoggedIn(false); setProfileUrl("/admin?mode=login"); return; }
      setIsLoggedIn(true);
      const { data } = await client.from("profiles").select("username").eq("owner_id", userId).maybeSingle();
      setProfileUrl(data?.username ? `/userpanel?username=${encodeURIComponent(data.username)}` : "/admin");
    };
    client.auth.getSession().then(({ data }) => syncProfile(data.session?.user.id));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => syncProfile(session?.user.id));
    return () => listener.subscription.unsubscribe();
  }, []);

  return <nav className="nav site-nav"><Link href="/" className="brand"><img className="site-logo" src="https://picnicclub.id/wp-content/uploads/2026/06/picnictrans-150x150.png" alt="Picnic Club" /></Link><div className="nav-links"><Link href="/#about">About us</Link><Link href="/members">Creators</Link><Link href="/#brands">For brands</Link></div><div className="nav-auth"><Link href={profileUrl} className="nav-login">{isLoggedIn ? "My profile" : "Login"}</Link><Link href="/admin?mode=signup" className="nav-cta">Sign up</Link></div></nav>;
}
