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

/**
 * 构建模式说明：
 * - `npm run build`：纯净生产包，不带 mock，对接真实后端；
 * - `npm run build:demo`（--mode demo）：携带浏览器端 mock 的自演示包，
 *   可直接静态部署作为在线 Demo。
 */
export default defineConfig(({ mode }) => {
  const isDemoBuild = mode === "demo";

  return {
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
      // Mock：开发模式全量启用；demo 构建注入浏览器端 mock（src/mock-prod.ts）
      viteMockServe({
        mockPath: "mock",
        localEnabled: mode === "development",
        prodEnabled: isDemoBuild,
        injectCodeFile: isDemoBuild ? "./src/mock-prod.ts" : undefined,
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
  };
});
