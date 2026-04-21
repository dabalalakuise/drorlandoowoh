import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const port = Number(env.PORT) || 3005;
  const host = env.HOST || (process.env.CODESPACE_NAME ? '0.0.0.0' : '127.0.0.1');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.APP_URL': JSON.stringify(env.APP_URL || `http://localhost:${port}`),
      'import.meta.env.VITE_PAYSTACK_PUBLIC_KEY': JSON.stringify(env.VITE_PAYSTACK_PUBLIC_KEY),
    },
    server: {
      host,
      port,
      strictPort: true,
      hmr: {
        clientPort: process.env.CODESPACE_NAME ? 443 : port,
        protocol: process.env.CODESPACE_NAME ? 'wss' : 'ws',
      },
    },
  };
});
