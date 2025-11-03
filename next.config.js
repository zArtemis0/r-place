// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the CRITICAL fix for the 'pg' module's Node.js dependencies (fs, net, etc.)
  webpack: (config, { isServer }) => {
    // Check if we are building for the server environment (the API route)
    if (isServer) {
      // Add 'pg' to the list of packages that should be treated as external Node modules
      // This stops Webpack from trying to bundle them for the browser.
      config.externals.push('pg');
    }

    // Always return the modified configuration
    return config;
  },
};

module.exports = nextConfig;
