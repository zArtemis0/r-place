// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This part ensures that 'pg' itself is not bundled for the client
    if (isServer) {
      config.externals.push('pg');
    }

    // CRITICAL FIX: Explicitly disable Node.js core module polyfills for the browser
    if (!isServer) {
      config.resolve.fallback = {
        // Disables polyfills for the specific modules causing the "Can't resolve..." errors
        fs: false, 
        net: false,
        dns: false,
        tls: false,
        
        // Use existing fallbacks if they exist
        ...config.resolve.fallback,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
