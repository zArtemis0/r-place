// pages/api/place.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // Import the centralized database utility

const COOLDOWN_SECONDS = 10;
const CANVAS_SIZE = 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { x, y, color } = req.body;
    // Vercel automatically forwards the user's IP in the 'x-forwarded-for' header
    const userIP = req.headers['x-forwarded-for'] as string | undefined || req.socket.remoteAddress;

    // 1. Validation and IP Check
    if (x == null || y == null || x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE || !color || !userIP) {
        return res.status(400).json({ message: 'Invalid coordinates, color, or missing user identifier.' });
    }

    try {
        // --- 2. Check Cooldown ---
        // Find the last time this IP placed a pixel
        const lastPlacementResult = await db.query(
            // We only need the updated_at column
            `SELECT updated_at FROM pixels WHERE user_ip = $1 AND updated_at IS NOT NULL ORDER BY updated_at DESC LIMIT 1`,
            [userIP]
        );

        if (lastPlacementResult.rows.length > 0) {
            const lastTime = new Date(lastPlacementResult.rows[0].updated_at).getTime();
            const now = Date.now();
            const elapsed = (now - lastTime) / 1000; // Time in seconds

            if (elapsed < COOLDOWN_SECONDS) {
                const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
                return res.status(429).json({ 
                    message: `Cooldown active. Try again in ${remaining} seconds.`,
                    remaining
                });
            }
        }

        // --- 3. Place the Pixel ---
        // This query updates the pixel at (x, y) with the new color and updates the cooldown timer
        await db.query(
            `UPDATE pixels SET color = $1, user_ip = $2, updated_at = NOW() WHERE x = $3 AND y = $4`,
            [color, userIP, x, y]
        );

        return res.status(200).json({ success: true, x, y, color });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
}
