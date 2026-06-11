import { TrendInfo } from "./types";

export const SEG_COLORS: string[] = [
  /* GREEN */
  "#16a34a",
  "#16a34a",
  "#16a34a",
  "#16a34a",
  /* YELLOW */
  "#ca8a04",
  "#ca8a04",
  "#ca8a04",
  /* RED */
  "#dc2626",
  "#dc2626",
  "#dc2626",
];

export const LABEL_COLORS: string[] = ["#16a34a", "#ca8a04", "#dc2626"];

export const TREND_MAP: Record<string, TrendInfo> = {
  green: { icon: "✅", bg: "#dcfce7", tc: "#15803d", label: "GREEN" },
  yellow: { icon: "⚠️", bg: "#fef9c3", tc: "#a16207", label: "YELLOW" },
  red: { icon: "🚨", bg: "#fee2e2", tc: "#b91c1c", label: "RED" },
};