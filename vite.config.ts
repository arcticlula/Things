import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin(), // Add ESLint plugin here
    AutoImport({
      imports: ['vue', 'vue-router'],
    }),
    Components({
      resolvers: [NaiveUiResolver()]
    })
  ],
})
