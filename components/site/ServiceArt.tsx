import type { ReactElement } from "react";

/** Animated vector artwork for a service, drawn in white so it sits on the theme gradient.
 *  It is picked from the service's name and address, so a web service gets code, SEO gets a growing chart and so on. */
export type ArtKind = "code" | "design" | "seo" | "marketing" | "video" | "ai" | "automation" | "care" | "store" | "orbit";

export function artKind(title: string, slug = ""): ArtKind {
  const t = `${slug} ${title}`.toLowerCase();
  if (/\bseo\b|search engine|ranking|keyword/.test(t)) return "seo";
  if (/video|film|motion|edit(ing)?\b/.test(t)) return "video";
  if (/\bai\b|artificial|chatbot|assistant|machine/.test(t)) return "ai";
  if (/automation|workflow|crm|zapier|n8n/.test(t)) return "automation";
  if (/marketing|ads\b|advert|social|campaign|growth|email/.test(t)) return "marketing";
  if (/care|maintenance|support|security|hosting|backup/.test(t)) return "care";
  if (/shop|store|commerce|woocommerce|cart/.test(t)) return "store";
  if (/design|brand|logo|\bui\b|\bux\b|creative|graphic/.test(t) && !/develop/.test(slug)) return "design";
  if (/develop|code|web|app|software|next|laravel|wordpress|platform|site/.test(t)) return "code";
  return "orbit";
}

const S = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const SOFT = "rgb(255 255 255 / .18)";

const ART: Record<ArtKind, ReactElement> = {
  code: (<>
    <rect x="22" y="18" width="196" height="124" rx="14" {...S} />
    <path d="M22 44h196" {...S} />
    <circle cx="38" cy="31" r="3" fill="currentColor" /><circle cx="50" cy="31" r="3" fill="currentColor" /><circle cx="62" cy="31" r="3" fill="currentColor" />
    <path className="va-draw" d="M88 76l-18 16 18 16" {...S} />
    <path className="va-draw va-d2" d="M152 76l18 16-18 16" {...S} />
    <path className="va-slash" d="M130 70l-20 44" {...S} />
    <rect className="va-line" x="38" y="58" width="60" height="6" rx="3" fill={SOFT} />
    <rect className="va-line va-d2" x="150" y="58" width="52" height="6" rx="3" fill={SOFT} />
    <rect className="va-blink" x="176" y="112" width="4" height="16" rx="2" fill="currentColor" />
  </>),
  design: (<>
    <path className="va-draw va-long" d="M30 118C56 28 100 28 120 78s60 62 90-8" {...S} />
    <circle className="va-pulse" cx="30" cy="118" r="7" fill="currentColor" /><circle className="va-pulse va-d2" cx="210" cy="70" r="7" fill="currentColor" />
    <path d="M30 118L56 62M210 70l-26 42" {...S} strokeWidth={2} strokeDasharray="4 6" />
    <rect className="va-float" x="52" y="54" width="14" height="14" rx="3" fill="currentColor" /><rect className="va-float va-d2" x="176" y="108" width="14" height="14" rx="3" fill="currentColor" />
    <circle className="va-sw" cx="80" cy="130" r="9" fill={SOFT} stroke="currentColor" strokeWidth={2} /><circle className="va-sw va-d2" cx="104" cy="130" r="9" fill={SOFT} stroke="currentColor" strokeWidth={2} /><circle className="va-sw va-d3" cx="128" cy="130" r="9" fill={SOFT} stroke="currentColor" strokeWidth={2} />
  </>),
  seo: (<>
    <rect className="va-bar" x="44" y="96" width="22" height="40" rx="5" fill={SOFT} stroke="currentColor" strokeWidth={2.5} />
    <rect className="va-bar va-d2" x="80" y="76" width="22" height="60" rx="5" fill={SOFT} stroke="currentColor" strokeWidth={2.5} />
    <rect className="va-bar va-d3" x="116" y="56" width="22" height="80" rx="5" fill={SOFT} stroke="currentColor" strokeWidth={2.5} />
    <path className="va-draw va-long" d="M40 92L82 66l32-8 38-26" {...S} />
    <path className="va-draw va-d3" d="M140 28h14v14" {...S} />
    <g className="va-scan"><circle cx="176" cy="94" r="24" {...S} /><path d="M193 112l22 22" {...S} strokeWidth={5} /></g>
  </>),
  marketing: (<>
    <path d="M52 70v32l60 22V48z" fill={SOFT} stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />
    <path d="M52 70H36a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h16" {...S} />
    <path d="M78 114l10 26h16l-8-24" {...S} />
    <path className="va-wave" d="M132 72c10 8 10 28 0 36" {...S} />
    <path className="va-wave va-d2" d="M148 58c18 14 18 54 0 68" {...S} />
    <path className="va-wave va-d3" d="M164 44c26 22 26 78 0 100" {...S} />
    <path className="va-float" d="M196 40l8 14 14 2-10 10 3 15-15-7-15 7 3-15-10-10 14-2z" fill="currentColor" />
  </>),
  video: (<>
    <rect x="24" y="22" width="192" height="104" rx="16" {...S} />
    <circle className="va-pulse" cx="120" cy="74" r="26" fill={SOFT} stroke="currentColor" strokeWidth={3} />
    <path d="M112 62l20 12-20 12z" fill="currentColor" />
    <path d="M24 142h192" {...S} strokeWidth={5} opacity={0.35} />
    <path className="va-progress" d="M24 142h192" {...S} strokeWidth={5} />
    <circle className="va-head" cx="24" cy="142" r="7" fill="currentColor" />
  </>),
  ai: (<>
    <g className="va-link">
      <path d="M52 50L120 80 52 112M120 80L188 46M120 80l68 36M52 50v62M188 46v70" {...S} strokeWidth={2.2} />
    </g>
    <circle className="va-node" cx="52" cy="50" r="11" fill="currentColor" /><circle className="va-node va-d2" cx="52" cy="112" r="11" fill="currentColor" />
    <circle className="va-node va-d3" cx="188" cy="46" r="11" fill="currentColor" /><circle className="va-node va-d2" cx="188" cy="116" r="11" fill="currentColor" />
    <circle className="va-node" cx="120" cy="80" r="18" fill={SOFT} stroke="currentColor" strokeWidth={3} />
    <path className="va-spark" d="M120 68l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="currentColor" />
    <path className="va-spark va-d2" d="M82 20l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor" />
  </>),
  automation: (<>
    <g className="va-spin" style={{ transformOrigin: "88px 80px" }}>
      <circle cx="88" cy="80" r="22" {...S} />
      <path d="M88 44v12M88 104v12M52 80h12M112 80h12M62 54l8 8M106 98l8 8M114 54l-8 8M70 98l-8 8" {...S} />
    </g>
    <g className="va-spin va-rev" style={{ transformOrigin: "160px 56px" }}>
      <circle cx="160" cy="56" r="14" {...S} strokeWidth={2.5} />
      <path d="M160 30v8M160 74v8M134 56h8M178 56h8M142 38l5 5M173 69l5 5M178 38l-5 5M147 69l-5 5" {...S} strokeWidth={2.5} />
    </g>
    <path d="M100 122h60l14-30" {...S} strokeWidth={2.2} strokeDasharray="3 7" />
    <circle className="va-run" cx="100" cy="122" r="6" fill="currentColor" />
    <rect x="172" y="118" width="40" height="22" rx="8" fill={SOFT} stroke="currentColor" strokeWidth={2.5} />
    <path className="va-draw" d="M181 129l6 6 12-12" {...S} strokeWidth={3} />
  </>),
  care: (<>
    <path className="va-pulse" d="M120 20l66 24v42c0 32-26 52-66 64-40-12-66-32-66-64V44z" fill={SOFT} stroke="currentColor" strokeWidth={3.5} strokeLinejoin="round" />
    <path className="va-draw va-d2" d="M92 82l20 20 38-40" {...S} strokeWidth={5} />
    <circle className="va-orbit" cx="120" cy="18" r="5" fill="currentColor" />
    <circle className="va-float" cx="34" cy="40" r="4" fill="currentColor" /><circle className="va-float va-d3" cx="210" cy="120" r="4" fill="currentColor" />
  </>),
  store: (<>
    <path d="M30 34h22l16 70h92l16-52H62" {...S} />
    <circle cx="82" cy="126" r="9" {...S} /><circle cx="150" cy="126" r="9" {...S} />
    <rect className="va-drop" x="86" y="52" width="26" height="26" rx="6" fill={SOFT} stroke="currentColor" strokeWidth={2.5} />
    <rect className="va-drop va-d2" x="120" y="60" width="26" height="22" rx="6" fill={SOFT} stroke="currentColor" strokeWidth={2.5} />
    <path className="va-float" d="M196 36l5 10 11 1-8 8 2 11-10-5-10 5 2-11-8-8 11-1z" fill="currentColor" />
  </>),
  orbit: (<>
    <circle cx="120" cy="80" r="14" fill="currentColor" />
    <ellipse cx="120" cy="80" rx="80" ry="30" {...S} strokeWidth={2} opacity={0.5} />
    <g className="va-spin" style={{ transformOrigin: "120px 80px" }}><circle cx="200" cy="80" r="8" fill="currentColor" /></g>
  </>),
};

export function ServiceArt({ kind }: { kind: ArtKind }) {
  return <svg className={`va va-${kind}`} viewBox="0 0 240 160" fill="none" aria-hidden focusable="false">{ART[kind]}</svg>;
}
