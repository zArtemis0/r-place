// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the 'serverRuntimeConfig' for secrets if needed, but the main fix is below:
  // Use this simple 'externals' configuration for the 'pg' library
  experimental: {
    // This tells Next.js to treat certain imports as external in the Vercel build,
    // solving the 'Module not found: Can't resolve...' errors for Node.js core modules (fs, dns, net, tls).
    serverComponentsExternalPackages: ['pg'],
  },
  
  // You can also use the target: 'serverless' property if you were on an older Next.js version,
  // but the experimental property is the modern approach for App Router/Edge functions.
  // For Next.js 14, sticking to the standard target is usually best.
};

module.exports = nextConfig;
