import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


export default defineConfig({

  server: {
    open: true //vite项目启动时自动打开浏览器
  },
  plugins: [
    vue(),
  Components({
		dirs: ['src/components', 'src/views'],
    resolvers: [ElementPlusResolver()],
    dts: true,
    include: [/.vue$/, /.vue?vue/, /.md$/]
  }),,
AutoImport({
  include: [
    /.[tj]sx?$/,
    /.vue$/,
    /.vue?vue/,
    /.md$/,
  ],

  imports: [
    'vue',
    'vue-router',
		// 需在安裝 vueuse 後，才能解開下面註解
		// '@vueuse/core',

		// 引入型別模組
    {
      from: 'vue-router',
      imports: ['RouteLocationRaw'],
      type: true,
    },
        {'lodash-es': ['cloneDeep', 'camelCase', 'isPlainObject', 'merge']}
  ],

  defaultExportByFilename: false,
  dts: './auto-imports.d.ts',
  vueTemplate: false,
  injectAtEnd: true,

  eslintrc: {
    enabled: false,
    filepath: './.eslintrc-auto-import.json',
    globalsPropValue: true,
  },
}),,
    VueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
    }
  }
})
