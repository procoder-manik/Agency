/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["sharp", "postgres", "bcryptjs", "nodemailer"], serverActions: { bodySizeLimit: "12mb" } },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  poweredByHeader: false,
  async redirects() { return [{ source: "/portfolio", destination: "/work", permanent: true }, { source: "/portfolio/:slug", destination: "/work/:slug", permanent: true }]; },
};
export default nextConfig;
