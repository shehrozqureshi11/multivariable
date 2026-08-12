import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone is for Docker; Vercel needs the default Next.js output.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
