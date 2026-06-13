// The vocabulary of the library: the kinds of tomes and where a reader stands with each.

export type FormatKey = "novel" | "manga" | "comic" | "other";
export type StatusKey = "want" | "reading" | "read" | "paused" | "dropped";

export type FormatMeta = {
  key: FormatKey;
  label: string;
  plural: string;
  glyph: string;
  accent: string; // css color
  blurb: string;
};

export const FORMATS: FormatMeta[] = [
  { key: "novel", label: "Novel", plural: "Novels", glyph: "📖", accent: "#9fae64", blurb: "Bound tales of word and wonder" },
  { key: "manga", label: "Manga", plural: "Manga", glyph: "🌸", accent: "#e79ab0", blurb: "Ink-blossom stories from the east" },
  { key: "comic", label: "Comic", plural: "Comics", glyph: "🦊", accent: "#ffb24d", blurb: "Panels of colour and clamour" },
  { key: "other", label: "Other", plural: "Curios", glyph: "🍃", accent: "#8fe0c8", blurb: "Pressed leaves and odd marginalia" },
];

export type StatusMeta = {
  key: StatusKey;
  label: string;
  glyph: string;
  accent: string;
  short: string;
};

export const STATUSES: StatusMeta[] = [
  { key: "want", label: "Want to Read", short: "Wished", glyph: "🕯️", accent: "#f5c451" },
  { key: "reading", label: "Reading", short: "Reading", glyph: "🌿", accent: "#9fae64" },
  { key: "read", label: "Read", short: "Read", glyph: "🍄", accent: "#cf4327" },
  { key: "paused", label: "Paused", short: "Resting", glyph: "🌙", accent: "#9b7bb0" },
  { key: "dropped", label: "Dropped", short: "Let go", glyph: "🥀", accent: "#8a6b47" },
];

export const FORMAT_KEYS = FORMATS.map((f) => f.key) as FormatKey[];
export const STATUS_KEYS = STATUSES.map((s) => s.key) as StatusKey[];

const formatMap = new Map(FORMATS.map((f) => [f.key, f]));
const statusMap = new Map(STATUSES.map((s) => [s.key, s]));

export function formatMeta(key: string): FormatMeta {
  return formatMap.get(key as FormatKey) ?? FORMATS[FORMATS.length - 1];
}
export function statusMeta(key: string): StatusMeta {
  return statusMap.get(key as StatusKey) ?? STATUSES[0];
}

export function isFormat(v: unknown): v is FormatKey {
  return typeof v === "string" && FORMAT_KEYS.includes(v as FormatKey);
}
export function isStatus(v: unknown): v is StatusKey {
  return typeof v === "string" && STATUS_KEYS.includes(v as StatusKey);
}
