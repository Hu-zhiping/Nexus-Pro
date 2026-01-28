import { createApp } from "vue";
import App from "./App.vue";

import router from "@/router";
// import "@/styles/styles.scss";
import "element-plus/theme-chalk/index.css";

import "virtual:svg-icons-register";
import pinia from "@/store";
import "@/router/permission.ts";
// 国际化 - 如果导入有问题，可以先注释掉

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import "@/styles/index.scss";


// 添加 Font Awesome CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
document.head.appendChild(link);

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component);
}

// 使用 Element Plus 并配置中文语言
app.use(ElementPlus, {
	locale: zhCn,
});

// app.use(ElementPlus)

app.use(router);
app.use(pinia);
app.mount("#app");
