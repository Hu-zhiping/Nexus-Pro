import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";
// 自动导入
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// mockjs
import { viteMockServe } from "vite-plugin-mock";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

// 自动引入图标
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		// viteEslint(),
		AutoImport({
			resolvers: [ElementPlusResolver()],
			imports: ["vue", "vue-router"],
			eslintrc: {
				enabled: false //是否自动生成 eslint 规则，建议生成之后设置 false
			}
		}),
		Components({
			resolvers: [
				ElementPlusResolver({
					importStyle: "sass"
				}),
				IconsResolver({
					enabledCollections: ['ri']
				})
			]
		}),
		Icons({
			autoInstall: true,
		}),
		viteMockServe({
			mockPath: "mock",
			localEnabled: true,
			prodEnabled: false,
			supportTs: true,
			logger: true
		}),
		createSvgIconsPlugin({
			//指定需要缓存的图标文件夹
			iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
			//指定symbolId格式
			symbolId: "icon-[name]"
		}),

	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	},
	server: {
		// 开发环境使用 mock，不启用代理
		// proxy: {
		// 	"/api": {
		// 		target: "http://localhost:8080",
		// 		changeOrigin: true,
		// 		rewrite: path => path.replace(/^\/api/, '')
		// 	}
		// }
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "@/styles/theme.css"  as *;`
			}
		}
	}
});
