// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to build the pages for the Vercel serverless environment.
  // This is often required when using server-only dependencies like 'pg'.
  target: 'serverless', 

  // This still ensures 'pg' is explicitly marked as an external dependency.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pg');
    }
    return config;
  },
};

module.exports = nextConfig;
