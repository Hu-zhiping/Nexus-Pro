import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
	{
		path: "/login",
		name: "login",
		component: () => import("@/views/login/index.vue"),
		meta: {
			title: "登录",
			hidden: true
		}
	},
	// 根路由重定向到 dashboard，具体路由由动态菜单加载
	{
		path: "/",
		redirect: "/dashboard",
		meta: { hidden: true }
	},
	// {
	// 	path: "/users",
	// 	component: () => import("@/layout/index.vue"),
	// 	meta: { title: "用户管理", icon: "users" },
	// 	children: [
	// 		{
	// 			path: "list",
	// 			name: "userList",
	// 			component: () => import("@/views/dashboard/index.vue"),
	// 			meta: {
	// 				hidden: false,
	// 				title: "用户列表",
	// 				icon: "user-friends"
	// 			}
	// 		}
	// 	]
	// },
	// {
	// 	path: "/settings",
	// 	component: () => import("@/layout/index.vue"),
	// 	meta: { title: "系统设置", icon: "cog" },
	// 	children: [
	// 		{
	// 			path: "general",
	// 			name: "generalSettings",
	// 			component: () => import("@/views/dashboard/index.vue"),
	// 			meta: {
	// 				hidden: false,
	// 				title: "基本设置",
	// 				icon: "sliders-h"
	// 			}
	// 		}
	// 	]
	// },
	// {
	// 	path: "/:pathMatch(.*)*",
	// 	name: "notMatch",
	// 	redirect: "/404",
	// 	meta: { title: "404", hidden: true }
	// },
	// {
	// 	path: "/404",
	// 	name: "NotFound",
	// 	component: () => import("@/views/404.vue"),
	// 	meta: { title: "404", hidden: true }
	// }
];

const router = createRouter({
	history: createWebHashHistory(),
	routes
});

export default router;
