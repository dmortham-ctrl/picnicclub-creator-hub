"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

/** u = position along its row, v = row — both centred on 0 (see lib/orbit-layout.ts). */
export type OrbitCreator = { avatar: string; href: string; u: number; v: number };

/** Where an avatar starts from, and when it launches. */
type Flight = { delay: number; x: number; y: number; s: number };

const ENTER_MS = 850; // matches .avatar-enter in globals.css
const HOLD_MS = 10000; // how long the landed avatars stay put before leaving again
const EXIT_MS = 450; // matches .avatar-exit in globals.css
const GAP_MS = 150; // empty beat between leaving and the next launch

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * One random launch per avatar: most shoot up from below, some slide in from
 * the sides, a few simply pop in from nowhere. Launch order is shuffled and
 * staggered so they arrive one after another.
 */
function randomFlights(count: number): Flight[] {
  const order = Array.from({ length: count }, (_, i) => i).sort(() => Math.random() - 0.5);
  const flights: Flight[] = new Array(count);
  order.forEach((avatarIndex, rank) => {
    const delay = 0.15 + rank * 0.085 + rand(0, 0.05);
    const roll = Math.random();
    if (roll < 0.6) {
      flights[avatarIndex] = { delay, x: rand(-140, 140), y: rand(380, 560), s: 0.55 };
    } else if (roll < 0.85) {
      const side = Math.random() < 0.5 ? -1 : 1;
      flights[avatarIndex] = { delay, x: side * rand(300, 440), y: rand(-60, 260), s: 0.6 };
    } else {
      flights[avatarIndex] = { delay, x: 0, y: rand(10, 30), s: 0 };
    }
  });
  return flights;
}

/** A random permutation of 0..count-1: which slot each avatar takes this round. */
function shuffledSlots(count: number): number[] {
  const slots = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}

export function OrbitAvatars({ creators }: { creators: OrbitCreator[] }) {
  // flights: null = not hydrated yet (avatars held back), [] = reduced motion (shown as-is)
  const [flights, setFlights] = useState<Flight[] | null>(null);
  // slotOf[i] = which slot (u, v) avatar i stands in; reshuffled on every launch so positions change each round.
  const [slotOf, setSlotOf] = useState<number[] | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [cycle, setCycle] = useState(0); // bumped each launch so the avatars remount and replay
  const hovering = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFlights([]);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;

    // Launch, wait for everyone to land + the hold, then leave and launch again.
    const launch = () => {
      const next = randomFlights(creators.length);
      hovering.current = 0;
      setFlights(next);
      setSlotOf(shuffledSlots(creators.length));
      setLeaving(false);
      setCycle((c) => c + 1);
      const lastLanding = Math.max(...next.map((f) => f.delay)) * 1000 + ENTER_MS;
      timer = setTimeout(leave, lastLanding + HOLD_MS);
    };
    const leave = () => {
      // Don't yank an avatar away from under someone's cursor.
      if (hovering.current > 0) {
        timer = setTimeout(leave, 600);
        return;
      }
      setLeaving(true);
      timer = setTimeout(launch, EXIT_MS + GAP_MS);
    };

    launch();
    return () => clearTimeout(timer);
  }, [creators.length]);

  return (
    <>
      {creators.map((creator, index) => {
        const fly = flights?.[index];
        const state = flights === null ? " avatar-wait" : !fly ? "" : leaving ? " avatar-exit" : " avatar-enter";
        const slot = creators[slotOf?.[index] ?? index];
        const style = {
          "--u": slot.u,
          "--v": slot.v,
          ...(fly && {
            "--delay": `${fly.delay}s`,
            "--from-x": `${fly.x}px`,
            "--from-y": `${fly.y}px`,
            "--from-s": fly.s,
          }),
        } as CSSProperties;
        return (
          <Link
            className={`avatar${state}`}
            style={style}
            href={creator.href}
            key={`${cycle}-${index}`}
            aria-label="View creator profile"
            onPointerEnter={() => { hovering.current += 1; }}
            onPointerLeave={() => { hovering.current = Math.max(0, hovering.current - 1); }}
          >
            <Image src={creator.avatar} alt="" width={58} height={58} loading="eager" />
          </Link>
        );
      })}
    </>
  );
}
