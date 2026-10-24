"use client";
import { Component, type ReactNode } from "react";

/** Wraps an optional extra (scroll indicator, cursor, trackers, chat...) so that if it ever fails,
 *  only that extra disappears and the header, footer and page keep working. */
export class Safe extends Component<{ children: ReactNode; name?: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.warn(`[site] "${this.props.name || "extra"}" was switched off after an error:`, e); }
  render() { return this.state.failed ? null : this.props.children; }
}
