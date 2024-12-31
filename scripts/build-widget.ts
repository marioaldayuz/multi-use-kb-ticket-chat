import { build } from 'vite';
import path from 'path';

async function buildWidget() {
  try {
    await build({
      configFile: false,
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: [
            path.resolve(__dirname, '../src/widget/index.ts'),
            path.resolve(__dirname, '../src/widget/loader.ts')
          ],
          formats: ['es'],
          fileName: (format, name) => `${name}.js`
        },
        rollupOptions: {
          output: {
            entryFileNames: '[name].js',
            assetFileNames: '[name][extname]'
          }
        }
      }
    });

    console.log('Widget build completed successfully');
  } catch (error) {
    console.error('Widget build failed:', error);
    process.exit(1);
  }
}

buildWidget();