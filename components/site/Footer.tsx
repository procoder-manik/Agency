import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { waLink } from "@/lib/whatsapp";
import { LinkText, RichInline } from "./LinkText";
import { Logo } from "./Logo";
import { Clock, Magnetic } from "./fx";

const ICONS: Record<string, string> = {
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-1.96 1.33-1.96 2.7V21h-4z",
  x: "M17.7 3H21l-7.2 8.2L22.3 21h-6.6l-5.2-6.8L4.6 21H1.3l7.7-8.8L.9 3h6.8l4.7 6.2zm-1.2 16.2h1.8L6.9 4.7H5z",
  instagram: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2c-2.7 0-3.1 0-4.1.06C4.4 2.2 2.2 4.4 2.06 7.9 2 8.9 2 9.3 2 12s0 3.1.06 4.1c.15 3.5 2.3 5.7 5.84 5.84C8.9 22 9.3 22 12 22s3.1 0 4.1-.06c3.5-.15 5.7-2.3 5.84-5.84C22 15.1 22 14.7 22 12s0-3.1-.06-4.1C21.8 4.4 19.6 2.2 16.1 2.06 15.1 2 14.7 2 12 2z",
  facebook: "M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.3 2 10 3.5 10 6v2H8v3h2v11h4V11h2.7l.3-3z",
  youtube: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.75 15V9l5.2 3z",
  dribbble: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.6 4.6a8.5 8.5 0 0 1 1.9 5.3c-2.8-.6-5.3-.5-7.5.1l-.6-1.4c2.4-1 4.6-2.3 6.2-4zM12 3.5c2 0 3.9.7 5.4 1.9-1.4 1.6-3.4 2.8-5.6 3.7a49 49 0 0 0-3.4-5.2c1.1-.3 2.3-.4 3.6-.4zM6.9 4.3a47 47 0 0 1 3.4 5.2c-2.7.8-5.7 1.2-8.6 1.2A8.5 8.5 0 0 1 6.9 4.3zM3.5 12.2v-.1c3.2 0 6.4-.4 7.5-.8l.5 1.2c-3.3 1-6 3.3-7.7 6A8.5 8.5 0 0 1 3.5 12.2zm8.5 8.3a8.4 8.4 0 0 1-5.6-2.1c1.5-2.4 4-4.5 7.2-5.4a35 35 0 0 1 1.8 6.9c-1 .4-2.2.6-3.4.6zm4.8-1.5a37 37 0 0 0-1.7-6.4c2-.4 4.2-.3 6.2.2a8.5 8.5 0 0 1-4.5 6.2z",
  github: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z",
};
const NAMES: Record<string, string> = { linkedin: "LinkedIn", x: "X", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", dribbble: "Dribbble", github: "GitHub" };

export function Footer({ s, columns }: { s: Settings; columns: { title: string; links: { label: string; href: string }[] }[] }) {
  const id = s.identity; const ft = s.footer;
  const email = ft.email || id.email, phone = ft.phone || id.phone, whatsapp = ft.whatsapp || id.whatsapp, address = ft.address || id.address, hours = ft.hours || id.hours;
  const waUrl = waLink(id as any, whatsapp);
  const on = (k: string) => (ft as any)[k] !== false;
  const socials = Object.entries(id.socials || {}).filter(([, v]) => v);
  const year = new Date().getFullYear();
  const bigText = ft.bigText || id.name;
  return (
    <footer className="tex relative mt-16 overflow-hidden border-t border-line">
      <div className="container-x pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"><RichInline text={ft.heading || id.tagline} name={id.name} /></p>
            {on("showEmail") && email && <Magnetic strength={0.2}><a href={`mailto:${email}`} className="mt-8 inline-block border-b border-fg/30 pb-1 font-display text-2xl transition-colors hover:border-accent hover:text-accent sm:text-3xl" data-cursor="Email">{email}</a></Magnetic>}
            <div className="mt-8 space-y-1.5 text-[0.95rem] text-fg2">
              {on("showPhone") && phone && <p><a className="hover:text-accent" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></p>}
              {on("showWhatsapp") && waUrl && <p><a className="hover:text-accent" href={waUrl} rel="noopener noreferrer" target="_blank">WhatsApp</a></p>}
              {on("showAddress") && address && <p><RichInline text={address} name={id.name} /></p>}
              {on("showHours") && hours && <p className="text-muted"><RichInline text={hours} name={id.name} /></p>}
            </div>
            {on("showSocials") && socials.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {socials.map(([k, url]) => (
                  <Magnetic key={k} strength={0.4}><a href={url as string} target="_blank" rel="noopener" aria-label={NAMES[k] || k} className="grid h-11 w-11 place-items-center rounded-full border border-line text-fg2 transition-all hover:border-accent hover:bg-accent hover:text-onaccent">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={ICONS[k] || ""} /></svg>
                  </a></Magnetic>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-x-8 gap-y-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            {(on("showColumns") ? columns : []).map((c) => (
              <div key={c.title}>
                <p className="text-sm text-muted">{c.title}</p>
                <ul className="mt-4 space-y-3">
                  {c.links.map((l) => <li key={l.href + l.label}><Link href={l.href} prefetch className="group relative inline-block text-fg transition-colors hover:text-accent">{l.label}<span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" /></Link></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {ft.showBigName !== false && (
        <div className="container-x mt-20" aria-hidden>
        <p className="select-none whitespace-nowrap text-center font-display font-bold leading-[1.05] tracking-[-0.06em] text-outline" style={{ fontSize: `clamp(3rem, ${Math.min(22, 150 / Math.max(4, bigText.length))}vw, 18rem)` }}>{bigText}</p>
      </div>
      )}
      <div className="border-t border-line/70">
        <div className="container-x flex flex-col gap-3 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {on("showBottomLogo") && <Logo name={id.name} shortName={id.shortName} logo={id.logo} logoDark={(id as any).logoDark} alt={id.logoAlt} compact />}
            <span><RichInline text={(ft as any).copyrightText || `© {year} ${ft.copyright || id.legalName || id.name}`} name={id.name} /></span>
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            {id.registration && <span><LinkText text={id.registration} name={id.name} /></span>}
            {((ft as any).bottomLinks || []).filter((l: any) => l?.label && l?.href).map((l: any) => <LinkText key={l.href + l.label} text={`[${l.label}](${l.href})`} />)}
            {ft.showLocalTime !== false && <span>Local time <Clock /></span>}
            {ft.note && <span><RichInline text={ft.note} name={id.name} /></span>}
          </p>
        </div>
      </div>
    </footer>
  );
}
