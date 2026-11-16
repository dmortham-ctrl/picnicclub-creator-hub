"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 42; // one letter every 42 ms
const START_MS = 380; // pause before a phrase starts typing
const HOLD_MS = 2600; // how long a finished phrase stays on screen
const FADE_MS = 550; // matches .ht-phrase.out in globals.css

/**
 * The hero headline: a loop of phrases, each typed out letter by letter, held, then faded out.
 * Every phrase is laid out in the same grid cell from the start (letters just switch from
 * hidden to visible), so the tallest phrase sets the height and nothing below it ever jumps.
 * The h1 keeps the CMS headline as screen-reader text; the animated copy is decorative.
 */
export function HeroTitle({ phrases, label }: { phrases: string[]; label: string }) {
  const [phrase, setPhrase] = useState(0);
  const [typed, setTyped] = useState(0);
  const [fading, setFading] = useState(false);
  const [still, setStill] = useState(false); // reduced motion: show the last phrase, no loop

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setPhrase(phrases.length - 1);
    }
  }, [phrases.length]);

  const length = Array.from(phrases[phrase] ?? "").filter((char) => char !== " ").length;

  useEffect(() => {
    if (still) return;
    let wait: number;
    let next: () => void;
    if (fading) {
      wait = FADE_MS;
      next = () => { setPhrase((p) => (p + 1) % phrases.length); setTyped(0); setFading(false); };
    } else if (typed < length) {
      wait = typed === 0 ? START_MS : TYPE_MS;
      next = () => setTyped((t) => t + 1);
    } else {
      wait = HOLD_MS;
      next = () => setFading(true);
    }
    const timer = setTimeout(next, wait);
    return () => clearTimeout(timer);
  }, [still, fading, typed, length, phrases.length]);

  return (
    <h1 className="hero-title">
      <span className="ht-sr">{label}</span>
      <span className="ht-stack" aria-hidden="true">
        {phrases.map((text, index) => {
          const active = index === phrase;
          const shown = active ? (still ? Infinity : typed) : 0;
          const words = text.trim().split(/\s+/);
          let letter = 0;
          return (
            <span key={index} className={`ht-phrase${active ? " on" : ""}${active && fading ? " out" : ""}`}>
              {words.map((word, wordIndex) => {
                const last = wordIndex === words.length - 1;
                return (
                  <span key={wordIndex}>
                    <span className={`ht-word${last ? " is-last" : ""}${last && shown >= length ? " done" : ""}`}>
                      {Array.from(word).map((char, charIndex) => {
                        const position = letter++;
                        const visible = position < shown;
                        return <span key={charIndex} className={`ht-ch${visible ? " vis" : ""}${active && !still && position === shown - 1 ? " cur" : ""}`}>{char}</span>;
                      })}
                    </span>{" "}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
