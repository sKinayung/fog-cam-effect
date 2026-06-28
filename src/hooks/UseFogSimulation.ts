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

  const addBreath = useCallback((x: number, y: number, intensity: number, radius: number) => {
    const ctx = fogCtxRef.current;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over'; // Mode menambah kabut
    
    // Membuat efek gradien radial agar embun terlihat menyebar dan halus di pinggirnya
    const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    
    // Opacity sangat kecil per-frame, tapi karena berjalan 60 FPS, 
    // embun akan menumpuk secara organik saat user terus meniup.
    const alpha = intensity * 0.08; 
    
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);
  
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
  
  return { fogCanvasRef, initFog, drawErase, regenerateFog, addBreath };
};