// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the critical configuration for using server-only modules like 'pg'
  // inside an API route without Next.js trying to bundle them for the browser.
  webpack: (config, { isServer }) => {
    // Only apply this change to the server-side build phase
    if (isServer) {
      config.externals.push('pg');
    }
    return config;
  },
};

module.exports = nextConfig;
