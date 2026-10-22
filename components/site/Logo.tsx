import { mediaUrl } from "@/lib/media";

/** Uploaded logo, or a generated initials mark in the theme accent. */
export function Logo({ name, shortName, logo, alt, className = "" }: { name: string; shortName: string; logo?: any; alt?: string; className?: string }) {
  const url = mediaUrl(logo);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt || name} className={`h-9 w-auto ${className}`} />;
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="grid h-9 w-9 place-items-center font-display text-[0.95rem] font-bold text-onaccent" style={{ borderRadius: "var(--r-md)", background: "linear-gradient(135deg, rgb(var(--c-accent)), rgb(var(--c-accent2)))" }}>
        {(shortName || name.slice(0, 2)).slice(0, 3)}
      </span>
      <span className="font-display text-lg font-bold tracking-tight">{name}</span>
    </span>
  );
}
