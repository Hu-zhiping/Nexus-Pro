import router from "@/router/index.ts";
import { getToken } from "@/api/user.ts";
import useMenuStore from "@/store/modules/menu.ts";
import { RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";

const whiteList = ["/login"];
let isLoad = false;

NProgress.configure({
	easing: "ease", // 动画方式
	speed: 300, // 递增进度条的速度
	showSpinner: false, // 是否显示加载ico
	trickleSpeed: 200, // 自动递增间隔
	minimum: 0.3, // 更改启动时使用的最小百分比
	parent: "body" //指定进度条的父容器
});

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
	NProgress.start();
	// 未登录检查是否在白名单
	if (!getToken()) {
		if (whiteList.indexOf(to.path) > -1) {
			return next();
		} else {
			return next({ path: "/login" });
		}
	}

	if (to.path === "/login") return next({ path: "/" });

	if (isLoad) return next();

	const menuStore = useMenuStore();
	let routes: RouteRecordRaw[] = [];
	
	if (!menuStore.asyncRoutes.length) {
		// 首次加载，从 API 获取菜单
		routes = await menuStore.fetchMenuList();
	} else {
		// 从持久化恢复，重新处理路由
		routes = menuStore.reprocessRoutes();
	}
	
	// 添加动态路由
	routes.forEach((route: any) => {
		router.addRoute(route);
	});
	
	isLoad = true;
	router.addRoute({
		path: "/:pathMatch(.*)*",
		name: "notMatch",
		redirect: "/404",
		meta: { title: "404", hidden: true }
	})

router.addRoute({
	path: "/404",
	name: "NotFound",
	component: () => import("@/views/404.vue"),
	meta: { title: "404", hidden: true }
})

// 添加重定向路由
router.addRoute({
	path: "/redirect/:path(.*)",
	name: "Redirect",
	component: () => import("@/views/redirect/index.vue"),
	meta: { title: "重定向", hidden: true }
})
	next({ ...to, replace: true });
});
router.afterEach(() => {
	NProgress.done();
});