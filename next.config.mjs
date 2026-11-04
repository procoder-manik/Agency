/** @type {import('next').NextConfig} */
const nextConfig = {
  // staleTimes keeps pages you already opened (and menu pages prefetched in the background) in the browser, so going back or revisiting is instant
  serverExternalPackages: ["sharp", "postgres", "bcryptjs", "nodemailer"],
  experimental: { serverActions: { bodySizeLimit: "12mb" }, staleTimes: { dynamic: 60, static: 300 } },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  async redirects() { return [{ source: "/portfolio", destination: "/work", permanent: true }, { source: "/portfolio/:slug", destination: "/work/:slug", permanent: true }]; },
};
export default nextConfig;
