// src/store/coreRefs.ts
import { HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

export const coreRefs = {
  video: null as HTMLVideoElement | null,
  handLandmarker: null as HandLandmarker | null,
  faceLandmarker: null as FaceLandmarker | null,
};