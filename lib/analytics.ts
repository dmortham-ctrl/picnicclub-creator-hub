// Client-side event beacon. Fire-and-forget: analytics must never block or
// break the UI, so every failure is swallowed.

export type TrackEvent =
  | { event_name: "page_view"; path: string }
  | { event_name: "profile_view"; path: string; profile_id: string }
  | { event_name: "cta_click"; path: string; cta_key: string }
  | { event_name: "link_click"; link_id: string; profile_id?: string };

function referrerHost(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const host = new URL(document.referrer).host;
    return host === window.location.host ? undefined : host;
  } catch {
    return undefined;
  }
}

export function track(event: TrackEvent) {
  try {
    const body = JSON.stringify({ ...event, referrer_host: referrerHost() });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    // ignore
  }
}
