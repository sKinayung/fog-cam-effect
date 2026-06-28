// src/store/useAppStore.ts
import { create } from 'zustand';
import type { AppState } from '../types';

export const useAppStore = create<AppState>((set) => ({
  // Initial Status
  isCameraReady: false,
  isHandTrackerReady: false,
  isFaceTrackerReady: false,
  hasMicrophonePermission: null,
  fps: 0,

  // Initial Settings
  showLandmarks: false,
  useMicrophone: true,
  fogDensity: 0.8,
  brushSize: 30,
  regenerationSpeed: 0.05,
  theme: 'dark',
  resetTrigger: 0,

  // Actions
  setCameraReady: (status) => set({ isCameraReady: status }),
  setHandTrackerReady: (status) => set({ isHandTrackerReady: status }),
  setFaceTrackerReady: (status) => set({ isFaceTrackerReady: status }),
  setMicrophonePermission: (status) => set({ hasMicrophonePermission: status }),
  setFps: (fps) => set({ fps }),
  
  toggleLandmarks: () => set((state) => ({ showLandmarks: !state.showLandmarks })),
  toggleMicrophone: () => set((state) => ({ useMicrophone: !state.useMicrophone })),
  setFogDensity: (density) => set({ fogDensity: density }),
  setBrushSize: (size) => set({ brushSize: size }),
  setRegenerationSpeed: (speed) => set({ regenerationSpeed: speed }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  
  resetMask: () => set((state) => ({ resetTrigger: state.resetTrigger + 1 })),
}));