/** @type {import('next').NextConfig} */
const nextConfig = {
  // staleTimes keeps pages you already opened (and menu pages prefetched in the background) in the browser, so going back or revisiting is instant
  experimental: { serverComponentsExternalPackages: ["sharp", "postgres", "bcryptjs", "nodemailer"], serverActions: { bodySizeLimit: "12mb" }, staleTimes: { dynamic: 60, static: 300 } },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  poweredByHeader: false,
  async redirects() { return [{ source: "/portfolio", destination: "/work", permanent: true }, { source: "/portfolio/:slug", destination: "/work/:slug", permanent: true }]; },
};
export default nextConfig;
