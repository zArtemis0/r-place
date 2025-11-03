// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Tells Next.js to treat the 'pg' package as a server-only external dependency.
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

module.exports = nextConfig;
