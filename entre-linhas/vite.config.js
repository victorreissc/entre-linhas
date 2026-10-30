import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Dois sites independentes no mesmo deploy:
//   /             → apresentação (projetada na sala)
//   /participar/  → site de participação (celular da turma)
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        apresentacao: resolve(__dirname, 'index.html'),
        participar: resolve(__dirname, 'participar/index.html'),
      },
    },
  },
});
