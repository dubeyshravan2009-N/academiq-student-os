import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // <--- This ensures JavaScript imports use relative paths
  // ... rest of your config
});
