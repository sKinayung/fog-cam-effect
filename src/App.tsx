// src/App.tsx
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Camera } from './components/Camera'; 

export default function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-black';
  }, [theme]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Layer 1: Hidden Video Element (Camera Source) */}
      <Camera /> 
      
      <div className="absolute inset-0 flex items-center justify-center text-white text-xl z-50">
        Kamera & AI sedang dimuat di background...
      </div>
    </div>
  );
}