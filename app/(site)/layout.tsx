import { getAllSettings } from "@/lib/settings";
import { getPublished } from "@/lib/content";
import { visibleNav } from "@/lib/site";
import { HeaderShell } from "@/components/site/HeaderNav";
import { Footer } from "@/components/site/Footer";
import { Logo } from "@/components/site/Logo";
import { FloatingWidgets, Announcements, Analytics, ThirdPartyChat } from "@/components/site/Widgets";
import { Ambient, Cursor, Intro, SmoothScroll } from "@/components/site/fx";
import { getActiveTheme } from "@/lib/theme-server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getAllSettings();
  const nav = await visibleNav();
  const theme = await getActiveTheme();
  const popups = s.features.announcement ? await getPublished("popups") : [];
  const id = s.identity, i = s.integrations, ap = s.appearance as any;
  const firstBar = popups.find((p) => (p.data.kind || "bar") !== "popup");
  const chatOn = s.features.chat && i.chatMode !== "off";
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-onaccent">Skip to content</a>
      {ap.intro && <Intro name={id.name} />}
      <SmoothScroll enabled={!!ap.smoothScroll} />
      {ap.cursor && <Cursor />}
      {ap.ambient && <Ambient />}
      <div className="grain" aria-hidden />
      {firstBar && !firstBar.data.paths && <><style>{":root{--bar-h:44px}"}</style><script dangerouslySetInnerHTML={{ __html: `try{var d=JSON.parse(localStorage.getItem("dismissed")||"[]");if(d.indexOf(${firstBar.id})>-1){var r=document.documentElement;r.setAttribute("data-bar-closed","");r.style.setProperty("--bar-h","0px")}}catch(e){}` }} /></>}
      {popups.length > 0 && <Announcements items={popups.map((p) => ({ id: p.id, kind: p.data.kind || "bar", content: p.data.content || "", linkLabel: p.data.linkLabel, linkHref: p.data.linkHref, trigger: p.data.trigger, delay: p.data.delay, paths: p.data.paths }))} />}
      <HeaderShell logo={<Logo name={id.name} shortName={id.shortName} logo={id.logo} alt={id.logoAlt} />} links={nav.header} cta={id.ctaLabel ? { label: id.ctaLabel, href: id.ctaHref || "/contact" } : undefined} themeUi={{ showMode: !!ap.modeToggle, showAccent: !!ap.accentPicker, themeAccent: { a: theme.tokens.colors.accent, b: theme.tokens.colors.accent2 } }} />
      <main id="main" className="page-enter">{children}</main>
      <Footer s={s} columns={nav.footer} />
      <FloatingWidgets
        chat={chatOn ? { side: i.chatPosition === "left" ? "left" : "right", greeting: i.chatGreeting, mode: i.chatMode, name: id.name, botName: (i as any).chatBotName || "", suggestions: ((i as any).chatSuggestions || []) as string[], leadCapture: (i as any).chatLeadCapture !== false } : null}
        backToTop={s.features.backToTop ? { side: i.backToTopPosition === "left" ? "left" : "right" } : null}
      />
      {chatOn && i.chatMode === "thirdparty" && i.chatScript && <ThirdPartyChat html={i.chatScript} />}
      {i.gaId && <Analytics id={i.gaId} />}
    </>
  );
}
