// Minisite colour themes. Keep values in sync with the .bio-page[data-theme]
// rules in app/globals.css and the profiles_theme_check DB constraint.
export const MINISITE_THEMES = [
  { value: "default", label: "Cream", swatch: "#e6eedf", ink: "#162a24", dot: "#b5431e" },
  { value: "midnight", label: "Midnight", swatch: "#0f1f1b", ink: "#eef3ef", dot: "#d8f36a" },
  { value: "lime", label: "Lime", swatch: "#d8f36a", ink: "#162a24", dot: "#7a3410" },
  { value: "coral", label: "Coral", swatch: "#ff7957", ink: "#2b0f07", dot: "#8f2e0e" },
  { value: "blossom", label: "Blossom", swatch: "linear-gradient(160deg,#fdeef4,#f7d9e6)", ink: "#4a2233", dot: "#db2777" },
  { value: "ocean", label: "Ocean", swatch: "linear-gradient(160deg,#6abce0,#274a63)", ink: "#0c2233", dot: "#0c2233" },
] as const;

export type MinisiteTheme = (typeof MINISITE_THEMES)[number]["value"];

export const MINISITE_THEME_VALUES = MINISITE_THEMES.map((t) => t.value) as [string, ...string[]];

export function isMinisiteTheme(value: unknown): value is MinisiteTheme {
  return typeof value === "string" && MINISITE_THEMES.some((t) => t.value === value);
}

export const BUTTON_STYLES = [
  { value: "fill", label: "Fill" },
  { value: "outline", label: "Outline" },
  { value: "shadow", label: "Hard shadow" },
] as const;
export const BUTTON_STYLE_VALUES = BUTTON_STYLES.map((b) => b.value) as [string, ...string[]];

export const BUTTON_SHAPES = [
  { value: "sharp", label: "Kotak" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
] as const;
export const BUTTON_SHAPE_VALUES = BUTTON_SHAPES.map((b) => b.value) as [string, ...string[]];

export const LAYOUTS = [
  { value: "classic", label: "Classic", hint: "Avatar bulat di tengah." },
  { value: "full", label: "Full", hint: "Foto besar penuh di bagian atas." },
] as const;
export const LAYOUT_VALUES = LAYOUTS.map((l) => l.value) as [string, ...string[]];

export const ACCENT_PRESETS = ["#b5431e", "#db2777", "#7c3aed", "#2563eb", "#0d9488", "#16a34a", "#162a24"];

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}
