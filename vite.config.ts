import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
  const isUserSite = repository.endsWith('.github.io');
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

  return {
    base: isGitHubActions ? (isUserSite ? '/' : `/${repository}/`) : '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
