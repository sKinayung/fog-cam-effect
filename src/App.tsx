// src/App.tsx
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
// Nanti kita akan uncomment komponen ini setelah dibuat
// import { Camera } from './components/Camera';
// import { CanvasRenderer } from './components/CanvasRenderer';
// import { UI } from './components/UI';

export default function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-black';
  }, [theme]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 
        Layer 1: Hidden Video Element (Camera Source)
        <Camera /> 
      */}
      
      {/* 
        Layer 2: Canvas Pipeline (Webcam -> Fog -> Drawing Mask -> Effects)
        <CanvasRenderer />
      */}

      {/* 
        Layer 3: UI & Debug Panel
        <UI /> 
      */}
      
      <div className="absolute inset-0 flex items-center justify-center text-white text-xl z-50">
        Menyiapkan Lingkungan Proyek...
        {/* Placeholder sebelum kita menambahkan komponen renderer */}
      </div>
    </div>
  );
}