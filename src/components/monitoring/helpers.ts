import { LabelInfo } from "./types";

export function getLabel(v: number): LabelInfo {
  // GREEN 1–4
  if (v <= 4)
    return {
      label: "Stable",
      color: "#16a34a",
      emoji: "😊",
      bg: "#dcfce7",
      tc: "#15803d",
    };

  // YELLOW 5–7
  if (v <= 7)
    return {
      label: "Moderate",
      color: "#ca8a04",
      emoji: "😐",
      bg: "#fef9c3",
      tc: "#854d0e",
    };

  // RED 8–10
  return {
    label: "Critical",
    color: "#dc2626",
    emoji: "😣",
    bg: "#fee2e2",
    tc: "#991b1b",
  };
}
