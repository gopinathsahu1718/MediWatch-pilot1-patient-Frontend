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


export function getSelectionLabel(value: number, min: number, max: number) {
  const ratio = max === min ? 0 : (value - min) / (max - min);

  if (ratio <= 0.34)
    return {
      label: "Stable",
      color: "#16a34a",
      bg: "#dcfce7",
      tc: "#15803d",
      emoji: "😊",
    };

  if (ratio <= 0.67)
    return {
      label: "Moderate",
      color: "#ca8a04",
      bg: "#fef9c3",
      tc: "#854d0e",
      emoji: "😐",
    };

  return {
    label: "Critical",
    color: "#dc2626",
    bg: "#fee2e2",
    tc: "#991b1b",
    emoji: "😣",
  };
}