import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Sketch from 'react-sketch';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL);

const Canvas = () => {
  const sketchRef = useRef(null);

  useEffect(() => {
    socket.on('initialCanvas', (data) => {
      sketchRef.current.loadCanvas(data);
    });

    socket.on('draw', (data) => {
      sketchRef.current.loadCanvas(data);
    });
  }, []);

  const handleDraw = (data) => {
    socket.emit('draw', data);
  };

  return (
    <Sketch
      ref={sketchRef}
      onDraw={handleDraw}
      width={1000}
      height={1000}
    />
  );
};

export default Canvas;
