import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { coreRefs } from '../store/coreRefs';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setCameraReady = useAppStore((state) => state.setCameraReady);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 }, // Resolusi HD untuk kejernihan cermin
            height: { ideal: 1080 },
            facingMode: 'user', // Kamera depan
          },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          coreRefs.video = videoRef.current; // Simpan ke referensi global
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (error) {
        console.error("Gagal mengakses webcam:", error);
        setCameraReady(false);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setCameraReady]);

  return { videoRef };
};