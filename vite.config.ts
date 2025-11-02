import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anki': {
        target: 'http://localhost:8765',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api\/anki/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Remove origin-related headers that might cause issues
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Add CORS headers to the response
            proxyRes.headers['access-control-allow-origin'] = '*';
            proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['access-control-allow-headers'] = 'Content-Type';
            // Handle OPTIONS preflight
            if (req.method === 'OPTIONS') {
              proxyRes.statusCode = 200;
              proxyRes.end();
            }
          });
        },
      },
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add API key from environment variable
            const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
            if (apiKey) {
              proxyReq.setHeader('x-api-key', apiKey);
              proxyReq.setHeader('anthropic-version', '2023-06-01');
              proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true');
            }
          });
        },
      },
    },
  },
});

