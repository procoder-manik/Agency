"use client";
import { createContext, useContext, type ReactNode } from "react";

export interface AdminCtx { role: "admin" | "editor"; email: string; aiOn: boolean; colors: Record<string, string>; siteName: string }
const Ctx = createContext<AdminCtx>({ role: "editor", email: "", aiOn: false, colors: {}, siteName: "" });
export const AdminProvider = ({ value, children }: { value: AdminCtx; children: ReactNode }) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useAdmin = () => useContext(Ctx);

/** The item currently being edited, so AI helpers can read real content. */
const ItemCtx = createContext<{ collection: string; item: any }>({ collection: "", item: {} });
export const ItemProvider = ({ value, children }: { value: { collection: string; item: any }; children: ReactNode }) => <ItemCtx.Provider value={value}>{children}</ItemCtx.Provider>;
export const useItem = () => useContext(ItemCtx);
