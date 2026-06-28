// src/components/CanvasRenderer.tsx
import React, { useRef } from 'react';
import { useAnimationLoop } from '../hooks/UseAnimationLoop';

export const CanvasRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mengaktifkan Loop Render 60 FPS
  useAnimationLoop(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-10"
    />
  );
};