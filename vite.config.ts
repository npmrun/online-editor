import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ _, mode }) => {
  const __PROD__ = mode === 'production';
  const __DEV__ = mode === 'development';
  const __STAGE__ = mode === 'staging';
  const config = <ImportMetaEnv>loadEnv(mode, process.cwd());

  return {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: ` @import "@/assets/style/_global.scss"; `,
        },
      },
    },
    plugins: [
      vue()
    ],
  };
});
