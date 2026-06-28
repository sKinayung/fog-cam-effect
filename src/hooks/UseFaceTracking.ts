// src/hooks/useFaceTracking.ts
import { useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useAppStore } from '../store/useAppStore';
import { coreRefs } from '../store/coreRefs';

export const useFaceTracking = () => {
  const setFaceTrackerReady = useAppStore((state) => state.setFaceTrackerReady);

  useEffect(() => {
    const initFaceTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true // Wajib True untuk deteksi gerakan mulut (openness)
        });
        
        coreRefs.faceLandmarker = landmarker;
        setFaceTrackerReady(true);
      } catch (error) {
        console.error("Gagal memuat Face Landmarker:", error);
        setFaceTrackerReady(false);
      }
    };
    
    initFaceTracking();
  }, [setFaceTrackerReady]);
};