import type { NextConfig } from "next";

// Any non-canonical host that Vercel also serves this app on. These return 200
// by default, which lets Google index the .vercel.app copy instead of the real
// domain. A permanent redirect collapses them into brandorbitgroup.in.
const NON_CANONICAL_HOSTS = ["brand-orbit-one.vercel.app"];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Hero scrub frames are versioned by folder (/hero-frames/v1), so they can be
  // cached forever. Without this, files in /public revalidate on every visit.
  headers() {
    return [
      {
        source: "/hero-frames/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  redirects() {
    return NON_CANONICAL_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://brandorbitgroup.in/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
