import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { viteMockServe } from "vite-plugin-mock";
import path from "node:path";
import { fileURLToPath } from "node:url";
import VueDevTools from "vite-plugin-vue-devtools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    // Tailwind CSS v4
    tailwindcss(),
    VueDevTools(),
    // 自动导入 Vue / Element Plus API
    AutoImport({
      imports: ["vue", "vue-router"],
      resolvers: [ElementPlusResolver()],
      dts: "src/auto-imports.d.ts",
    }),
    // 自动注册组件
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
        IconsResolver({
          enabledCollections: ["ri"],
        }),
      ],
      dts: "src/components.d.ts",
    }),
    // Icon
    Icons({
      autoInstall: true,
    }),
    // Mock
    viteMockServe({
      mockPath: "mock",
      localEnabled: process.env.NODE_ENV === "development",
      prodEnabled: false,
      supportTs: true,
      logger: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: false,
    strictPort: false,
  },
  build: {
    target: "esnext",
    sourcemap: false,
  },
});
