import { mediaUrl } from "@/lib/media";

/** Uploaded logo (separate versions for light and dark mode), or a generated initials mark in the theme accent. */
export function Logo({ name, shortName, logo, logoDark, alt, className = "", compact = false }: { name: string; shortName: string; logo?: any; logoDark?: any; alt?: string; className?: string; compact?: boolean }) {
  const light = mediaUrl(logo); const dark = mediaUrl(logoDark);
  const a = alt || name;
  if (light || dark) {
    const l = light || dark, d = dark || light;
    if (l === d) { // eslint-disable-next-line @next/next/no-img-element
      return <img src={l} alt={a} className={`h-9 w-auto ${className}`} />; }
    return (
      <span className={`inline-flex ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l} alt={a} className="logo-light h-9 w-auto" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d} alt={a} className="logo-dark h-9 w-auto" />
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center font-display text-[0.95rem] font-bold text-onaccent" style={{ borderRadius: "var(--r-md)", background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>
        {(shortName || name.slice(0, 2)).slice(0, 3)}
      </span>
      {!compact && <span className="font-display text-lg font-bold tracking-tight">{name}</span>}
    </span>
  );
}
