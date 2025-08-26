/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "places.googleapis.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevents Vercel from failing builds on ESLint warnings
  },
};

module.exports = nextConfig;
