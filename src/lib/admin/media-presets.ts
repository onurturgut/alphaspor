export const mediaPresets = {
  landscape: { width: 1600, height: 900, label: "16:9 · 1600 × 900 px" },
  portrait: { width: 900, height: 1200, label: "3:4 · 900 × 1200 px" },
  mobile: { width: 900, height: 1600, label: "9:16 · 900 × 1600 px" },
  gallery: { width: 1200, height: 800, label: "3:2 · 1200 × 800 px" },
};
export type MediaPreset = keyof typeof mediaPresets;
