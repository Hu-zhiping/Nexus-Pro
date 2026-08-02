import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/theme-chalk/index.css";

import App from "./App.vue";
import router from "@/router";
import pinia from "@/store";
import "@/router/permission";
import "@/styles/index.scss";
import { permissionDirective, roleDirective } from "@/utils/permission";

const app = createApp(App);

app.use(ElementPlus, { locale: zhCn });
app.use(router);
app.use(pinia);

// 注册全局自定义指令
app.directive("permission", permissionDirective);
app.directive("role", roleDirective);

app.mount("#app");
