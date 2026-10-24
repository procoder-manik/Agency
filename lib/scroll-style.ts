/** Scrollbar styles the site owner can choose in Admin > Themes > Experience settings. */
export const SCROLL_STYLES = [
  { value: "ruler", label: "Ruler (measuring scale with a draggable centimetre marker)" },
  { value: "capsule", label: "Capsule (glossy gradient)" },
  { value: "comet", label: "Comet (thin tail, round head)" },
  { value: "slim", label: "Slim line (flat gradient)" },
  { value: "neon", label: "Neon glow" },
  { value: "default", label: "Browser default (normal)" },
] as const;
export type ScrollStyle = (typeof SCROLL_STYLES)[number]["value"];
/** Older sites only had an on/off switch for the ruler, so that is honoured when no style was chosen yet. */
export function scrollStyleOf(ap: any): ScrollStyle {
  const v = ap?.scrollStyle; if (SCROLL_STYLES.some((x) => x.value === v)) return v;
  return ap?.rulerScroll === false ? "capsule" : "ruler";
}
