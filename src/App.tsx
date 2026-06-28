// src/App.tsx
import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Camera } from './components/Camera';
import { CanvasRenderer } from './components/CanvasRender';
import { UI } from './components/UI'; // IMPORT INI

export default function App() {
  const { theme, isCameraReady, isHandTrackerReady, isFaceTrackerReady } = useAppStore();

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-black';
  }, [theme]);

  // Cek apakah semua sistem siap
  const isReady = isCameraReady && isHandTrackerReady && isFaceTrackerReady;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-none">
      <Camera />
      
      {isReady ? (
        <>
          <CanvasRenderer />
          
          {/* Overlay Cahaya Cermin & Pantulan Basah */}
          <div className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: `
                radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
                linear-gradient(to bottom, transparent 80%, rgba(0,0,0,0.4) 100%)
              `,
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
            }}
          />
          
          <UI />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-50 bg-black">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Memanaskan Cermin...</h1>
          <div className="text-sm text-gray-400 space-y-1 text-center font-mono">
            <p>Webcam: {isCameraReady ? '✅ Siap' : '⏳ Menunggu Izin...'}</p>
            <p>AI Tangan: {isHandTrackerReady ? '✅ Siap' : '⏳ Memuat Model...'}</p>
            <p>AI Wajah: {isFaceTrackerReady ? '✅ Siap' : '⏳ Memuat Model...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}