"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

export type OrbitCreator = { avatar: string; href: string; angle: number; outer: boolean };

/** Where an avatar starts from, and when it launches. */
type Flight = { delay: number; x: number; y: number; s: number };

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

export function OrbitAvatars({ creators }: { creators: OrbitCreator[] }) {
  // null = not hydrated yet (avatars held back), [] = reduced motion (shown as-is)
  const [flights, setFlights] = useState<Flight[] | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFlights(reduce ? [] : randomFlights(creators.length));
  }, [creators.length]);

  return (
    <>
      {creators.map((creator, index) => {
        const fly = flights?.[index];
        const state = flights === null ? " avatar-wait" : fly ? " avatar-enter" : "";
        const style = {
          "--angle": `${creator.angle}deg`,
          ...(fly && {
            "--delay": `${fly.delay}s`,
            "--from-x": `${fly.x}px`,
            "--from-y": `${fly.y}px`,
            "--from-s": fly.s,
          }),
        } as CSSProperties;
        return (
          <Link
            className={`avatar ${creator.outer ? "avatar-outer" : "avatar-inner"}${state}`}
            style={style}
            href={creator.href}
            key={index}
            aria-label="View creator profile"
          >
            <Image src={creator.avatar} alt="" width={58} height={58} loading="eager" />
          </Link>
        );
      })}
    </>
  );
}
