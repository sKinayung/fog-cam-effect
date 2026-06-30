// src/hooks/useAnimationLoop.ts
import { useEffect, useRef } from 'react';
import { coreRefs } from '../store/coreRefs';
import { useAppStore } from '../store/useAppStore';
import { useFogSimulation } from './UseFogSimulation';
import { lerp } from '../utils/drawUtils';

interface Droplet {
  x: number;
  y: number;
  speed: number;
  size: number;
}

export const useAnimationLoop = (mainCanvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const requestRef = useRef<number>(0);
  const setFps = useAppStore(state => state.setFps);
const resetTrigger = useAppStore(state => state.resetTrigger);
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);
  
  // State Pelacakan (Jari & Mouse)
  const fingerPos = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, isTracking: false });
  const pointerPos = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, isDown: false });
  
  // State Partikel Tetesan Air
  const dropletsRef = useRef<Droplet[]>([]);

  const { fogCanvasRef, initFog, drawErase, regenerateFog, addBreath } = useFogSimulation();

  // Reset Canvas Trigger
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (canvas) initFog(canvas.width, canvas.height);
  }, [resetTrigger, initFog, mainCanvasRef]);

  // Event Listeners untuk Mouse & Touch
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      pointerPos.current.isDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      pointerPos.current.x = clientX;
      pointerPos.current.y = clientY;
      pointerPos.current.prevX = clientX;
      pointerPos.current.prevY = clientY;
      drawErase(clientX, clientY, clientX, clientY);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!pointerPos.current.isDown) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      pointerPos.current.x = clientX;
      pointerPos.current.y = clientY;
    };

    const handlePointerUp = () => { pointerPos.current.isDown = false; };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    // Setup ukuran kanvas awal
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initFog(canvas.width, canvas.height);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFog(canvas.width, canvas.height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [mainCanvasRef, initFog, drawErase]);

  // Main Render Loop (60 FPS)
  useEffect(() => {
    const loop = () => {
      const canvas = mainCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      const video = coreRefs.video;
      const handModel = coreRefs.handLandmarker;

      if (canvas && ctx && video && video.readyState >= 2) {
        const { width, height } = canvas;

        let isDrawingActive = pointerPos.current.isDown; 

        // 1. Hitung FPS
        const now = performance.now();
        framesRef.current++;
        if (now - lastTimeRef.current >= 1000) {
          setFps(framesRef.current);
          framesRef.current = 0;
          lastTimeRef.current = now;
        }

        // 2. Gambar Background (Kamera Mirror)
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = width / height;
        let drawW = width, drawH = height, drawX = 0, drawY = 0;
        
        if (videoRatio > canvasRatio) {
          drawW = height * videoRatio;
          drawX = (width - drawW) / 2;
        } else {
          drawH = width / videoRatio;
          drawY = (height - drawH) / 2;
        }
        ctx.drawImage(video, drawX, drawY, drawW, drawH);
        ctx.restore();

        // 3. Proses Hand Tracking (Dijalankan PERTAMA)
        if (handModel) {
          const results = handModel.detectForVideo(video, performance.now());
          
          if (results.landmarks.length > 0) {
            // TANGAN TERDETEKSI: Kunci sistem agar tidak memproses tiupan
            isDrawingActive = true; 
            
            const indexFinger = results.landmarks[0][8]; 
            const targetX = (1 - indexFinger.x) * width;
            const targetY = indexFinger.y * height;

            if (!fingerPos.current.isTracking) {
              fingerPos.current.x = targetX;
              fingerPos.current.y = targetY;
              fingerPos.current.prevX = targetX;
              fingerPos.current.prevY = targetY;
              fingerPos.current.isTracking = true;
              
              drawErase(targetX, targetY, targetX, targetY);
            } else {
              fingerPos.current.x = lerp(fingerPos.current.x, targetX, 0.4);
              fingerPos.current.y = lerp(fingerPos.current.y, targetY, 0.4);
              
              drawErase(fingerPos.current.x, fingerPos.current.y, fingerPos.current.prevX, fingerPos.current.prevY);
              
              fingerPos.current.prevX = fingerPos.current.x;
              fingerPos.current.prevY = fingerPos.current.y;
            }
            
            const showLandmarks = useAppStore.getState().showLandmarks;
            if (showLandmarks) {
              ctx.beginPath();
              ctx.arc(fingerPos.current.x, fingerPos.current.y, 10, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
              ctx.shadowBlur = 15;
              ctx.shadowColor = 'cyan';
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          } else {
            fingerPos.current.isTracking = false;
          }
        }

        // 4. Proses Pointer/Mouse 
        if (pointerPos.current.isDown) {
          drawErase(pointerPos.current.x, pointerPos.current.y, pointerPos.current.prevX, pointerPos.current.prevY);
          pointerPos.current.prevX = pointerPos.current.x;
          pointerPos.current.prevY = pointerPos.current.y;
        }

        // 5. Proses Face Tracking (HANYA DIJALANKAN JIKA TIDAK ADA TANGAN ATAU MOUSE)
        if (!isDrawingActive) {
          const faceModel = coreRefs.faceLandmarker;
          if (faceModel) {
            const faceResults = faceModel.detectForVideo(video, performance.now());
            if (faceResults.faceBlendshapes && faceResults.faceBlendshapes.length > 0) {
              const blendshapes = faceResults.faceBlendshapes[0].categories;
              const mouthPucker = blendshapes.find(shape => shape.categoryName === 'mouthPucker')?.score || 0;
              
              if (mouthPucker > 0.3 && faceResults.faceLandmarks.length > 0) {
                const lips = faceResults.faceLandmarks[0][13]; 
                const breathX = (1 - lips.x) * width;
                const breathY = lips.y * height;
                const radius = width * 0.15 + (mouthPucker * 150);
                addBreath(breathX, breathY, mouthPucker, radius);
              }
            }
          }
        }

        // 6. Regenerasi Kabut
        regenerateFog();

        // 7. Proses Partikel Tetesan Air (Water Droplets)
        // Spawn tetesan air secara acak berdasarkan ketebalan kabut
        const density = useAppStore.getState().fogDensity;
        if (Math.random() < (density * 0.05) && dropletsRef.current.length < 15) {
          dropletsRef.current.push({
            x: Math.random() * width,
            y: Math.random() * (height / 2), // Muncul di separuh atas
            speed: 1 + Math.random() * 3,
            size: 2 + Math.random() * 4
          });
        }

        // Update posisi tetesan dan hapus kabut di jalurnya
        for (let i = dropletsRef.current.length - 1; i >= 0; i--) {
          const drop = dropletsRef.current[i];
          const prevY = drop.y;
          drop.y += drop.speed;
          
          // Menggunakan drawErase bawaan secara manual (tanpa custom hook)
          // untuk membuat jalur tipis bersih yang dilalui air
          if (fogCanvasRef.current) {
            const fogCtx = fogCanvasRef.current.getContext('2d');
            if (fogCtx) {
              fogCtx.globalCompositeOperation = 'destination-out';
              fogCtx.beginPath();
              fogCtx.lineCap = 'round';
              fogCtx.lineWidth = drop.size;
              fogCtx.moveTo(drop.x, prevY);
              fogCtx.lineTo(drop.x, drop.y);
              fogCtx.stroke();
            }
          }

          // Hapus tetesan jika keluar layar
          if (drop.y > height) {
            dropletsRef.current.splice(i, 1);
          }
        }

        // 8. Render Layer Kabut Akhir
        if (fogCanvasRef.current) {
          ctx.drawImage(fogCanvasRef.current, 0, 0);
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mainCanvasRef, drawErase, regenerateFog, addBreath, fogCanvasRef, setFps]);
};