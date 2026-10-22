/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["sharp", "postgres", "bcryptjs", "nodemailer"], serverActions: { bodySizeLimit: "12mb" } },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  poweredByHeader: false,
};
export default nextConfig;
