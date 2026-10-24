"use client";
import { useEffect } from "react";

/** Two small helpers for button animations: the cursor position for "Spotlight", and the circle for "Ripple".
 *  They only do work when the matching animation is selected in Admin > Themes. */
export function ButtonFX() {
  useEffect(() => {
    const root = document.documentElement;
    const animOf = (b: Element) => (b.closest("[data-btn-anim]") || root).getAttribute("data-btn-anim") || "";
    const target = (e: Event) => (e.target as Element | null)?.closest?.(".btn") as HTMLElement | null;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const b = target(e); if (!b || animOf(b) !== "spotlight") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { const r = b.getBoundingClientRect(); b.style.setProperty("--mx", `${e.clientX - r.left}px`); b.style.setProperty("--my", `${e.clientY - r.top}px`); });
    };
    const click = (e: MouseEvent) => {
      const b = target(e); if (!b || animOf(b) !== "ripple" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = b.getBoundingClientRect(); const dot = document.createElement("span"); dot.className = "ripple";
      dot.style.left = `${e.clientX - r.left}px`; dot.style.top = `${e.clientY - r.top}px`; b.appendChild(dot); setTimeout(() => dot.remove(), 750);
    };
    document.addEventListener("pointermove", move, { passive: true }); document.addEventListener("click", click, true);
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("click", click, true); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
