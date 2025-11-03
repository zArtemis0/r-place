// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to treat the 'pg' library as an external dependency
  // that should only be available on the Vercel server, not the browser.
  webpack: (config, { isServer }) => {
    // Only apply this change to the server-side build phase
    if (isServer) {
      config.externals = {
        ...config.externals,
        // Add the 'pg' module to the list of externals
        'pg': 'commonjs pg', 
      };
    }
    return config;
  },
};

module.exports = nextConfig;
