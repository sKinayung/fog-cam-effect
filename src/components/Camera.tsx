// src/components/Camera.tsx
import React from 'react';
import { useCamera } from '../hooks/UseCamera';
import { useHandTracking } from '../hooks/UseHandTracking';
import { useFaceTracking } from '../hooks/UseFaceTracking';

export const Camera: React.FC = () => {
  const { videoRef } = useCamera();
  
  // Memulai proses download & inisialisasi AI secara asynchronous
  useHandTracking();
  useFaceTracking();

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="hidden" // Disembunyikan, dirender ulang di Canvas nanti
    />
  );
};