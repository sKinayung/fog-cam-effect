// src/utils/drawUtils.ts

// Membuat noise generator untuk efek embun/kabut (dijalankan sekali saja untuk performa)
export const createFogNoise = (width: number, height: number, density: number = 0.8): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  if (!ctx) return canvas;

  // Warna dasar kabut (putih keabu-abuan semi transparan)
  ctx.fillStyle = `rgba(255, 255, 255, ${density})`;
  ctx.fillRect(0, 0, width, height);

  // Menambahkan procedural grain/noise (embun)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 20 - 10; // Variasi tipis
    data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
    // Alpha dibiarkan berdasarkan density
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

// Interpolasi untuk memperhalus pergerakan (mengurangi jitter / tangan gemetar)
export const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};