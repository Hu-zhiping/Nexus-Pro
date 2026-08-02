import router from "@/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken } from "@/utils/auth";
import useMenuStore from "@/store/modules/menu";
import { checkPermission } from "@/utils/permission";
import type { RouteRecordRaw } from "vue-router";

const whiteList = ["/login", "/404", "/403"];

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, _from) => {
  NProgress.start();

  const hasToken = !!getToken();

  if (!hasToken) {
    if (whiteList.includes(to.path)) {
      return true;
    }

    return "/login";
  }

  if (to.path === "/login") {
    return "/";
  }

  const menuStore = useMenuStore();

  // 首次加载或页面刷新后，生成动态路由
  if (!menuStore.loaded) {
    const routes = menuStore.menuList.length ? menuStore.regenerateRoutes() : await menuStore.buildRoutes();

    routes.forEach((route: RouteRecordRaw) => router.addRoute(route));
    router.addRoute({ path: "/:pathMatch(.*)*", redirect: "/404" });

    return { ...to, replace: true };
  }

  // 权限校验
  const requiredPermission = to.meta?.permission as string | undefined;
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return "/403";
  }

  return true;
});

router.afterEach(() => NProgress.done());
