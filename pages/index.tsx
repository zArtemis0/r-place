// pages/index.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const CANVAS_SIZE = 1000;
const PIXEL_SCALE = 4; // Each logical pixel will be 4x4 on screen for visibility

// Replace with your actual Supabase details
// You must set these as Environment Variables in Vercel and include a fallback for the browser client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const colors = ['#000000', '#FFFFFF', '#FF4500', '#FFA800', '#FFD635', '#00A368', '#00CC78', '#7EED56', '#2450A4', '#3690EA', '#51E0ED', '#811E9F', '#B44AC0', '#FF99AA', '#6D482F', '#9C6926'];

const CanvasPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);

  // --- Real-Time Drawing Function ---
  const drawPixel = useCallback((x: number, y: number, color: string) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(x * PIXEL_SCALE, y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
    }
  }, []);

  // --- Initial Canvas Load & Real-Time Listener ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = CANVAS_SIZE * PIXEL_SCALE;
    canvas.height = CANVAS_SIZE * PIXEL_SCALE;
    
    // 1. Initial Data Fetch (Full Canvas)
    const fetchInitialCanvas = async () => {
      // NOTE: For 1 million rows, fetching the whole table at once is very slow. 
      // A better approach is to fetch a pre-rendered image or use a tileset, 
      // but for scratch, we use the simple fetch:
      const { data, error } = await supabase
        .from('pixels')
        .select('x, y, color')
        .limit(CANVAS_SIZE * CANVAS_SIZE);
      
      if (error) {
        console.error('Error fetching initial canvas:', error);
        return;
      }
      
      // Draw the entire initial state
      (data as Pixel[]).forEach(p => drawPixel(p.x, p.y, p.color));
    };
    
    fetchInitialCanvas();

    // 2. Real-Time Listener
    const pixelChannel = supabase
      .channel('public:pixels')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pixels' },
        (payload) => {
          const { x, y, color } = payload.new as Pixel;
          drawPixel(x, y, color); // Update the single pixel instantly
        }
      )
      .subscribe();

    return () => {
      // Clean up the subscription when the component unmounts
      pixelChannel.unsubscribe();
    };
  }, [drawPixel]);


  // --- Pixel Placement Handler ---
  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate the clicked position, accounting for the scale
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    
    // Determine the logical pixel coordinates (0-999)
    const pixelX = Math.floor(clientX / PIXEL_SCALE);
    const pixelY = Math.floor(clientY / PIXEL_SCALE);

    if (pixelX < 0 || pixelX >= CANVAS_SIZE || pixelY < 0 || pixelY >= CANVAS_SIZE) {
        return;
    }

    setCooldownMessage(null); // Clear previous messages

    try {
        const response = await fetch('/api/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: pixelX, y: pixelY, color: selectedColor })
        });

        if (response.status === 200) {
            // Success: Local canvas update will happen via the Real-Time listener
            // (or you can update it immediately here for better UX)
            drawPixel(pixelX, pixelY, selectedColor);
            setCooldownMessage('Pixel placed successfully!');
        } else if (response.status === 429) {
            const data = await response.json();
            setCooldownMessage(data.message);
        } else {
            setCooldownMessage('An error occurred placing the pixel.');
        }
    } catch (e) {
        setCooldownMessage('Network error. Check your connection.');
    }
  };


  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>r-place Clone ($1000 \times 1000$)</h1>
      <p>Place a pixel. Cooldown: 10 seconds.</p>

      {/* Cooldown Message Area */}
      {cooldownMessage && (
        <div style={{ color: cooldownMessage.includes('successfully') ? 'green' : 'red', margin: '10px 0' }}>
          {cooldownMessage}
        </div>
      )}

      {/* Color Palette */}
      <div style={{ marginBottom: '20px' }}>
        {colors.map(color => (
          <div
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              backgroundColor: color,
              margin: '0 5px',
              border: selectedColor === color ? '3px solid blue' : '1px solid #ccc',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
            title={color}
          ></div>
        ))}
      </div>

      {/* The Canvas */}
      <div style={{ border: '1px solid black', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{ cursor: 'crosshair' }}
        />
      </div>
      
      {/* Optional: Add a note about the PIXEL_SCALE for users */}
      <p style={{ marginTop: '10px', fontSize: 'small', color: '#666' }}>
        Canvas is $1000 \times 1000$ pixels, displayed at a {PIXEL_SCALE}x scale for visibility.
      </p>
    </div>
  );
};

export default CanvasPage;
