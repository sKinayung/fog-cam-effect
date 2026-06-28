import { useEffect } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useAppStore } from '../store/useAppStore';
import { coreRefs } from '../store/coreRefs';

export const useHandTracking = () => {
  const setHandTrackerReady = useAppStore((state) => state.setHandTrackerReady);

  useEffect(() => {
    const initHandTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU" // Gunakan GPU agar performa 60 FPS
          },
          runningMode: "VIDEO",
          numHands: 2 // Mendukung two-hand support nantinya
        });
        
        coreRefs.handLandmarker = landmarker;
        setHandTrackerReady(true);
      } catch (error) {
        console.error("Gagal memuat Hand Landmarker:", error);
        setHandTrackerReady(false);
      }
    };
    
    initHandTracking();
  }, [setHandTrackerReady]);
};