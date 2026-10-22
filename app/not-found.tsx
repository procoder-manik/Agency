import Link from "next/link";
export default function RootNotFound() {
  return <main className="grid min-h-screen place-items-center p-8 text-center"><div><h1 className="h-section">Page not found</h1><Link href="/" className="btn btn-primary mt-6">Go home</Link></div></main>;
}
