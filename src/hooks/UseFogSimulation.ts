// src/hooks/useFogSimulation.ts
import { useRef, useCallback } from 'react';
import { createFogNoise } from '../utils/drawUtils';
import { useAppStore } from '../store/useAppStore';

export const useFogSimulation = () => {
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const noisePatternRef = useRef<HTMLCanvasElement | null>(null);
  
  const fogDensity = useAppStore(state => state.fogDensity);
  const brushSize = useAppStore(state => state.brushSize);
  const regenerationSpeed = useAppStore(state => state.regenerationSpeed);

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

    // Buat tekstur kabut awal
    noisePatternRef.current = createFogNoise(width, height, fogDensity);
    
    // Fill canvas dengan kabut
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(noisePatternRef.current, 0, 0);
  }, [fogDensity]);

  const drawErase = useCallback((x: number, y: number, prevX: number, prevY: number) => {
    const ctx = fogCtxRef.current;
    if (!ctx) return;

    // Mode 'destination-out' akan menghapus pixel yang dilewati
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // Efek brush yang lembut
    ctx.shadowBlur = brushSize * 0.5;
    ctx.shadowColor = 'black';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    // Gambar garis dari posisi sebelumnya ke posisi saat ini agar tidak terputus-putus
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Reset shadow agar tidak membebani performa
    ctx.shadowBlur = 0;
  }, [brushSize]);

  const regenerateFog = useCallback(() => {
    const ctx = fogCtxRef.current;
    const noise = noisePatternRef.current;
    if (!ctx || !noise || regenerationSpeed <= 0) return;

    // Secara perlahan mengembalikan kabut (kondensasi)
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = regenerationSpeed * 0.05; // Sangat tipis setiap frame
    ctx.drawImage(noise, 0, 0);
    ctx.globalAlpha = 1.0;
  }, [regenerationSpeed]);

  return { fogCanvasRef, initFog, drawErase, regenerateFog };
};