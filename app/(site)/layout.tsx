import { getAllSettings } from "@/lib/settings";
import { getPublished } from "@/lib/content";
import { visibleNav } from "@/lib/site";
import { HeaderShell } from "@/components/site/HeaderNav";
import { Footer } from "@/components/site/Footer";
import { Logo } from "@/components/site/Logo";
import { FloatingWidgets, Announcements, Analytics, ThirdPartyChat } from "@/components/site/Widgets";
import { Cursor, Intro, SmoothScroll } from "@/components/site/fx";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getAllSettings();
  const nav = await visibleNav();
  const popups = s.features.announcement ? await getPublished("popups") : [];
  const id = s.identity, i = s.integrations, ap = s.appearance as any;
  const chatOn = s.features.chat && i.chatMode !== "off";
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-onaccent">Skip to content</a>
      {ap.intro && <Intro name={id.name} />}
      <SmoothScroll enabled={!!ap.smoothScroll} />
      {ap.cursor && <Cursor />}
      <div className="grain" aria-hidden />
      {popups.length > 0 && <Announcements items={popups.map((p) => ({ id: p.id, kind: p.data.kind || "bar", content: p.data.content || "", linkLabel: p.data.linkLabel, linkHref: p.data.linkHref, trigger: p.data.trigger, delay: p.data.delay, paths: p.data.paths }))} />}
      <HeaderShell logo={<Logo name={id.name} shortName={id.shortName} logo={id.logo} alt={id.logoAlt} />} links={nav.header} cta={id.ctaLabel ? { label: id.ctaLabel, href: id.ctaHref || "/contact" } : undefined} modeToggle={!!ap.modeToggle} />
      <main id="main" className="page-enter pt-[84px]">{children}</main>
      <Footer s={s} columns={nav.footer} />
      <FloatingWidgets
        chat={chatOn ? { side: i.chatPosition === "left" ? "left" : "right", greeting: i.chatGreeting, mode: i.chatMode, name: id.name } : null}
        backToTop={s.features.backToTop ? { side: i.backToTopPosition === "left" ? "left" : "right" } : null}
      />
      {chatOn && i.chatMode === "thirdparty" && i.chatScript && <ThirdPartyChat html={i.chatScript} />}
      {i.gaId && <Analytics id={i.gaId} />}
    </>
  );
}
