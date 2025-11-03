// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    
    // 1. CRITICAL FIX for the server-side API route: Externalize 'pg'
    // This tells Vercel to look for the 'pg' library in its Node.js environment.
    if (isServer) {
      config.externals.push('pg');
    }

    // 2. CRITICAL FIX for the client-side build: Disable Node.js core module polyfills
    // This resolves the stubborn 'Module not found: Can't resolve "fs"' errors.
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, 
        net: false,
        dns: false,
        tls: false,
        ...config.resolve.fallback,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
