"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/** Fires page_view on mount, plus profile_view when a profileId is given. */
export function TrackView({ profileId }: { profileId?: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const path = window.location.pathname;
    track({ event_name: "page_view", path });
    if (profileId) track({ event_name: "profile_view", path, profile_id: profileId });
  }, [profileId]);
  return null;
}

/** A Link that records a cta_click before navigating. */
export function TrackedLink({
  ctaKey,
  href,
  className,
  children,
}: {
  ctaKey: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track({ event_name: "cta_click", path: window.location.pathname, cta_key: ctaKey })}
    >
      {children}
    </Link>
  );
}
