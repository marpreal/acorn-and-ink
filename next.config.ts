import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (multiple lockfiles live above this folder).
  turbopack: { root: import.meta.dirname },
  // Book covers come from Open Library.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
  // Legacy-imported covers may be http:// URLs. On the HTTPS site the browser
  // blocks those as "mixed content" (they load on http://localhost but not on
  // Vercel). This tells the browser to auto-upgrade such requests to https.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "upgrade-insecure-requests" },
        ],
      },
    ];
  },
};

export default nextConfig;
