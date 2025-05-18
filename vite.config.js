import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

  return {
    plugins: [react()],
    server: {
      hmr: isDevelopment, // Enable HMR only in development mode
    },
    build: {
      outDir: 'dist', // Default output directory for production builds
    },
  };
});