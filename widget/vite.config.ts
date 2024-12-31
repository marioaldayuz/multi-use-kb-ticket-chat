import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        widget: path.resolve(__dirname, 'src/index.ts'),
        loader: path.resolve(__dirname, 'src/loader.ts')
      },
      formats: ['es'],
      fileName: (format, name) => `${name}.js`
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'widget.css';
          return assetInfo.name!;
        }
      }
    }
  }
});