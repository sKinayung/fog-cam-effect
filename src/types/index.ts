export interface AppState {
  isCameraReady: boolean;
  isHandTrackerReady: boolean;
  isFaceTrackerReady: boolean;
  hasMicrophonePermission: boolean | null;
  fps: number;
  
  // Settings & Toggles
  showLandmarks: boolean;
  useMicrophone: boolean;
  fogDensity: number;
  brushSize: number;
  regenerationSpeed: number;
  theme: 'dark' | 'light';
  
  // Actions
  setCameraReady: (status: boolean) => void;
  setHandTrackerReady: (status: boolean) => void;
  setFaceTrackerReady: (status: boolean) => void;
  setMicrophonePermission: (status: boolean | null) => void;
  setFps: (fps: number) => void;
  toggleLandmarks: () => void;
  toggleMicrophone: () => void;
  setFogDensity: (density: number) => void;
  setBrushSize: (size: number) => void;
  setRegenerationSpeed: (speed: number) => void;
  toggleTheme: () => void;
  resetMask: () => void; // Trigger for canvas to reset
  
  // Event Triggers
  resetTrigger: number;
}

export interface Coordinates {
  x: number;
  y: number;
  z?: number;
}