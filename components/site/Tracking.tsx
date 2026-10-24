"use client";
import { useEffect } from "react";

const w = () => window as any;
const load = (src: string, attrs: Record<string, string> = {}) => { const s = document.createElement("script"); s.async = true; s.src = src; Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v)); document.head.appendChild(s); return s; };
const ok = (v: string | undefined, rx: RegExp) => !!v && rx.test(v.trim());

/** Loads the connected marketing tools. Each ID is checked against the tool's own format before anything is injected. */
export function Tracking({ ids }: { ids: { ga?: string; ads?: string; gtm?: string; meta?: string; tiktok?: string; linkedin?: string; clarity?: string; hotjar?: string } }) {
  const key = JSON.stringify(ids);
  useEffect(() => {
    const win = w(); const done = (win.__tracked = win.__tracked || {});
    const once = (k: string, fn: () => void) => { if (done[k]) return; done[k] = 1; try { fn(); } catch (e) { console.warn("[tracking]", k, e); } };

    // Google Analytics 4 and Google Ads share the gtag loader
    const gids = [ids.ga, ids.ads].filter((x) => ok(x, /^(G-[A-Z0-9]+|AW-\d+|UA-\d+-\d+)$/)) as string[];
    if (gids.length) once("gtag", () => {
      load(`https://www.googletagmanager.com/gtag/js?id=${gids[0]}`);
      win.dataLayer = win.dataLayer || []; win.gtag = function () { win.dataLayer.push(arguments); }; win.gtag("js", new Date()); gids.forEach((g) => win.gtag("config", g));
    });
    if (ok(ids.gtm, /^GTM-[A-Z0-9]+$/)) once("gtm", () => { win.dataLayer = win.dataLayer || []; win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" }); load(`https://www.googletagmanager.com/gtm.js?id=${ids.gtm}`); });
    if (ok(ids.meta, /^\d{6,20}$/)) once("meta", () => {
      if (!win.fbq) { const n: any = (win.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }); if (!win._fbq) win._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = []; load("https://connect.facebook.net/en_US/fbevents.js"); }
      win.fbq("init", ids.meta); win.fbq("track", "PageView");
    });
    if (ok(ids.tiktok, /^[A-Z0-9]{8,30}$/)) once("tiktok", () => {
      win.TiktokAnalyticsObject = "ttq"; const t: any = (win.ttq = win.ttq || []);
      t.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
      t.setAndDefer = (o: any, m: string) => { o[m] = function () { o.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
      t.methods.forEach((m: string) => t.setAndDefer(t, m));
      t.load = (id: string) => { t._i = t._i || {}; t._i[id] = []; t._i[id]._u = "https://analytics.tiktok.com/i18n/pixel/events.js"; t._t = t._t || {}; t._t[id] = +new Date(); t._o = t._o || {}; t._o[id] = {}; load(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=ttq`); };
      t.load(ids.tiktok); t.page();
    });
    if (ok(ids.linkedin, /^\d{4,10}$/)) once("linkedin", () => { win._linkedin_data_partner_ids = win._linkedin_data_partner_ids || []; win._linkedin_data_partner_ids.push(ids.linkedin); load("https://snap.licdn.com/li.lms-analytics/insight.min.js"); });
    if (ok(ids.clarity, /^[a-z0-9]{6,14}$/i)) once("clarity", () => { win.clarity = win.clarity || function () { (win.clarity.q = win.clarity.q || []).push(arguments); }; load(`https://www.clarity.ms/tag/${ids.clarity}`); });
    if (ok(ids.hotjar, /^\d{5,10}$/)) once("hotjar", () => { win.hj = win.hj || function () { (win.hj.q = win.hj.q || []).push(arguments); }; win._hjSettings = { hjid: Number(ids.hotjar), hjsv: 6 }; load(`https://static.hotjar.com/c/hotjar-${ids.hotjar}.js?sv=6`); });
  }, [key]); // eslint-disable-line
  return null;
}
