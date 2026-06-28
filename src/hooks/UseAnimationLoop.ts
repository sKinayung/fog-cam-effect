// src/hooks/useAnimationLoop.ts
import { useEffect, useRef } from 'react';
import { coreRefs } from '../store/coreRefs';
import { useAppStore } from '../store/useAppStore';
import { useFogSimulation } from './UseFogSimulation';
import { lerp } from '../utils/drawUtils';

export const useAnimationLoop = (mainCanvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const requestRef = useRef<number>(0);
  const setFps = useAppStore(state => state.setFps);
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);
  
  // State pergerakan jari untuk interpolasi
  const fingerPos = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, isTracking: false });

  const { fogCanvasRef, initFog, drawErase, regenerateFog } = useFogSimulation();

  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    // Set ukuran awal
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initFog(canvas.width, canvas.height);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFog(canvas.width, canvas.height);
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [mainCanvasRef, initFog]);

  useEffect(() => {
    const loop = () => {
      const canvas = mainCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      const video = coreRefs.video;
      const handModel = coreRefs.handLandmarker;

      if (canvas && ctx && video && video.readyState >= 2) {
        const { width, height } = canvas;

        // 1. Hitung FPS
        const now = performance.now();
        framesRef.current++;
        if (now - lastTimeRef.current >= 1000) {
          setFps(framesRef.current);
          framesRef.current = 0;
          lastTimeRef.current = now;
        }

        // 2. Gambar Video Webcam sebagai Background (Di-mirror)
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        // Posisikan video agar memenuhi layar (cover)
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
        ctx.restore(); // Kembalikan koordinat normal

        // 3. Proses Hand Tracking
        if (handModel) {
          const results = handModel.detectForVideo(video, performance.now());
          
          if (results.landmarks.length > 0) {
            // Ambil ujung jari telunjuk (Index Finger Tip -> Landmark ke-8)
            const indexFinger = results.landmarks[0][8]; 
            
            // Konversi ke koordinat kanvas (Mirroring koordinat X)
            const targetX = (1 - indexFinger.x) * width;
            const targetY = indexFinger.y * height;

            if (!fingerPos.current.isTracking) {
              // TANGAN BARU SAJA MASUK FRAME:
              // Langsung set semua posisi (sekarang & sebelumnya) ke titik yang baru
              fingerPos.current.x = targetX;
              fingerPos.current.y = targetY;
              fingerPos.current.prevX = targetX;
              fingerPos.current.prevY = targetY;
              fingerPos.current.isTracking = true;
              
              // Hapus hanya di titik awal saja (sebagai dot)
              drawErase(targetX, targetY, targetX, targetY);
            } else {
              // TANGAN SEDANG BERGERAK DI DALAM FRAME:
              // Lakukan Lerp (Smoothing) agar pergerakan tidak patah-patah
              fingerPos.current.x = lerp(fingerPos.current.x, targetX, 0.4);
              fingerPos.current.y = lerp(fingerPos.current.y, targetY, 0.4);

              // Hapus kabut dari titik sebelumnya ke titik saat ini
              drawErase(
                fingerPos.current.x, 
                fingerPos.current.y, 
                fingerPos.current.prevX, 
                fingerPos.current.prevY
              );

              // Update posisi sebelumnya untuk frame berikutnya
              fingerPos.current.prevX = fingerPos.current.x;
              fingerPos.current.prevY = fingerPos.current.y;
            }
            
            // Gambar indikator ujung jari (Opsional/Debug)
            const showLandmarks = useAppStore.getState().showLandmarks;
            if (showLandmarks) {
              ctx.beginPath();
              ctx.arc(fingerPos.current.x, fingerPos.current.y, 8, 0, 2 * Math.PI);
              ctx.fillStyle = 'cyan';
              ctx.fill();
            }
          } else {
            // TANGAN KELUAR FRAME: Putus status tracking
            fingerPos.current.isTracking = false;
          }
        }

        // 4. Update dan Gambar Kabut
        regenerateFog();
        if (fogCanvasRef.current) {
          // Efek blur kabut (opsional, gunakan dengan bijak karena berat)
          ctx.filter = 'blur(4px)'; 
          ctx.drawImage(fogCanvasRef.current, 0, 0);
          ctx.filter = 'none';
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mainCanvasRef, drawErase, regenerateFog, fogCanvasRef, setFps]);
};