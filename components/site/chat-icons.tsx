/** Chat launcher icons the site owner can choose from (Admin > Site settings > Integrations). */
export const CHAT_ICONS: { id: string; label: string; paths: React.ReactNode }[] = [
  { id: "bubble", label: "Speech bubble", paths: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /> },
  { id: "dots", label: "Typing bubble", paths: <><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" /></> },
  { id: "square", label: "Message box", paths: <path d="M4 5h16v11H9l-5 4z" /> },
  { id: "headset", label: "Support headset", paths: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="2.5" y="13" width="4" height="6" rx="1.5" /><rect x="17.5" y="13" width="4" height="6" rx="1.5" /><path d="M19.5 19c0 1.7-2 3-5 3h-2" /></> },
  { id: "sparkle", label: "AI sparkle", paths: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></> },
  { id: "robot", label: "Assistant", paths: <><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 5v3M9 13h.01M15 13h.01M9.5 17h5" /><circle cx="12" cy="4" r="1" /></> },
  { id: "help", label: "Question mark", paths: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" /></> },
  { id: "mail", label: "Envelope", paths: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></> },
];

export function ChatIcon({ id, size = 24, className = "" }: { id?: string; size?: number; className?: string }) {
  const icon = CHAT_ICONS.find((i) => i.id === id) || CHAT_ICONS[0];
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icon.paths}</svg>;
}
