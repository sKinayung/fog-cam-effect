// src/hooks/useFogSimulation.ts
import { useRef, useCallback } from 'react';
import { createFogNoise } from '../utils/drawUtils';
import { useAppStore } from '../store/useAppStore';

export const useFogSimulation = () => {
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const noisePatternRef = useRef<HTMLCanvasElement | null>(null);

  const initFog = useCallback((width: number, height: number) => {
    if (!fogCanvasRef.current) {
      fogCanvasRef.current = document.createElement('canvas');
    }
    const canvas = fogCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    fogCtxRef.current = ctx;

    // Ambil state secara PASIF agar tidak memicu re-render
    const fogDensity = useAppStore.getState().fogDensity;
    noisePatternRef.current = createFogNoise(width, height, fogDensity);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(noisePatternRef.current, 0, 0);
  }, []);

  const drawErase = useCallback((x: number, y: number, prevX: number, prevY: number) => {
    const ctx = fogCtxRef.current;
    if (!ctx) return;

    // Ambil state ukuran secara PASIF
    const brushSize = useAppStore.getState().brushSize;

    // Mode 'destination-out' murni tanpa shadow agar embun benar-benar terhapus
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // Warna solid (alpha 1) wajib untuk menghapus bersih
    
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, []);

  const regenerateFog = useCallback(() => {
    const ctx = fogCtxRef.current;
    const noise = noisePatternRef.current;
    const regenerationSpeed = useAppStore.getState().regenerationSpeed;

    if (!ctx || !noise || regenerationSpeed <= 0) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = regenerationSpeed * 0.05; 
    ctx.drawImage(noise, 0, 0);
    ctx.globalAlpha = 1.0;
  }, []);

  const addBreath = useCallback((x: number, y: number, intensity: number, radius: number) => {
    const ctx = fogCtxRef.current;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over'; 
    
    const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    const alpha = intensity * 0.08; 
    
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  return { fogCanvasRef, initFog, drawErase, regenerateFog, addBreath };
};