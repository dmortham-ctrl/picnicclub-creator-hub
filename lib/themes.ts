// Minisite colour themes. Keep values in sync with the .bio-page[data-theme]
// rules in app/globals.css and the profiles_theme_check DB constraint.
export const MINISITE_THEMES = [
  { value: "default", label: "Cream", swatch: "#e6eedf", ink: "#162a24" },
  { value: "midnight", label: "Midnight", swatch: "#0f1f1b", ink: "#eef3ef" },
  { value: "lime", label: "Lime", swatch: "#d8f36a", ink: "#162a24" },
  { value: "coral", label: "Coral", swatch: "#ff7957", ink: "#2b0f07" },
] as const;

export type MinisiteTheme = (typeof MINISITE_THEMES)[number]["value"];

export const MINISITE_THEME_VALUES = MINISITE_THEMES.map((t) => t.value) as [string, ...string[]];

export function isMinisiteTheme(value: unknown): value is MinisiteTheme {
  return typeof value === "string" && MINISITE_THEMES.some((t) => t.value === value);
}
