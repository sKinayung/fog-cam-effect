// src/components/UI.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export const UI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const {
    showLandmarks,
    fogDensity,
    brushSize,
    regenerationSpeed,
    fps,
    toggleLandmarks,
    setFogDensity,
    setBrushSize,
    setRegenerationSpeed,
    resetMask
  } = useAppStore();

  return (
    <div className="absolute top-0 right-0 p-4 z-50 pointer-events-none w-full h-full flex flex-col justify-between items-end">
      
      {/* Top Bar: FPS & Info */}
      <div className="w-full flex justify-between items-start pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-mono border border-white/10">
          FPS: {fps} | 🌬️ Tiup ke kamera untuk mereset
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg transition-colors border border-white/10"
        >
          {isOpen ? 'Tutup Panel' : 'Buka Panel'}
        </button>
      </div>

      {/* Control Panel (Framer Motion) */}
      <motion.div 
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: isOpen ? 0 : 300, opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-72 text-white shadow-2xl pointer-events-auto mt-4"
      >
        <h2 className="text-xl font-bold mb-6 border-b border-white/20 pb-2">Kontrol Cermin</h2>
        
        {/* Brush Size */}
        <div className="mb-4">
          <label className="text-sm text-gray-300 flex justify-between">
            <span>Ukuran Jari</span>
            <span>{brushSize}px</span>
          </label>
          <input 
            type="range" min="10" max="100" value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full accent-white"
          />
        </div>

        {/* Fog Density */}
        <div className="mb-4">
          <label className="text-sm text-gray-300 flex justify-between">
            <span>Ketebalan Kabut</span>
            <span>{Math.round(fogDensity * 100)}%</span>
          </label>
          <input 
            type="range" min="0.3" max="1" step="0.1" value={fogDensity}
            onChange={(e) => setFogDensity(Number(e.target.value))}
            className="w-full accent-white"
          />
        </div>

        {/* Regeneration Speed */}
        <div className="mb-6">
          <label className="text-sm text-gray-300 flex justify-between">
            <span>Kecepatan Mengembun</span>
            <span>{Math.round(regenerationSpeed * 100)}%</span>
          </label>
          <input 
            type="range" min="0" max="1" step="0.01" value={regenerationSpeed}
            onChange={(e) => setRegenerationSpeed(Number(e.target.value))}
            className="w-full accent-white"
          />
        </div>

        {/* Toggles & Actions */}
        <div className="space-y-3">
          <button 
            onClick={toggleLandmarks}
            className={`w-full py-2 rounded-lg border transition-colors ${showLandmarks ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-white/20 hover:bg-white/10'}`}
          >
            {showLandmarks ? 'Sembunyikan Titik AI' : 'Tampilkan Titik AI'}
          </button>
          
          <button 
            onClick={resetMask}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
          >
            Hapus Semua Coretan (Reset)
          </button>
        </div>
      </motion.div>
    </div>
  );
};