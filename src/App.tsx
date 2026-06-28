// src/App.tsx
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Camera } from './components/Camera'; 
import { CanvasRenderer } from './components/CanvasRender';

export default function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-black';
  }, [theme]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Camera /> 
      <CanvasRenderer />
    </div>
  );
}