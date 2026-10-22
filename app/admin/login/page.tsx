import { getAllSettings } from "@/lib/settings";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { robots: { index: false } };

export default async function Login() {
  const s = await getAllSettings();
  return (
    <main className="tex relative grid min-h-screen place-items-center overflow-hidden p-5">
      <div className="aurora" aria-hidden><span /><span /><span /></div>
      <div className="glass w-full max-w-sm p-8">
        <Logo name={s.identity.name} shortName={s.identity.shortName} logo={s.identity.logo} alt={s.identity.logoAlt} />
        <h1 className="mt-8 text-2xl font-bold">Sign in to {s.identity.name}</h1>
        <p className="mt-1 text-sm text-fg2">Manage your site, content and leads.</p>
        <LoginForm />
      </div>
    </main>
  );
}
