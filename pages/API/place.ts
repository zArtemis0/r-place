// pages/API/place.ts

// NEW: Prevents Next.js from attempting to statically generate the API route,
// which causes the "Minified React error #31" and response object issues.
export const config = {
  runtime: 'nodejs',
};

// ... your existing imports and database logic follow ...

// ... your existing export default async function handler(req: NextApiRequest, res: NextApiResponse) { ... }
