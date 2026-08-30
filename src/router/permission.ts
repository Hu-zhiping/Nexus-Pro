import router from "@/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken } from "@/utils/auth";
import useMenuStore, { MENU_VERSION } from "@/store/modules/menu";
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

  // 首次登录、页面刷新后，或菜单版本升级时，生成动态路由；
  // 版本一致（页面刷新）时复用持久化菜单免请求，版本升级则必须重新拉取，
  // 避免用旧的持久化菜单刷新版本号导致新菜单永不生效
  if (!menuStore.loaded || menuStore.menuVersion !== MENU_VERSION) {
    const routes =
      menuStore.menuVersion === MENU_VERSION && menuStore.menuList.length
        ? menuStore.regenerateRoutes()
        : await menuStore.buildRoutes();

    routes.forEach((route: RouteRecordRaw) => {
      // 静态路由已注册同名路径时跳过，避免重复注册
      if (router.getRoutes().some((r) => r.path === route.path)) return;
      router.addRoute(route);
    });

    // 兜底路由只需注册一次（登出后再登录会重复进入此分支）
    if (!router.hasRoute("CatchAllRedirect")) {
      router.addRoute({ path: "/:pathMatch(.*)*", name: "CatchAllRedirect", redirect: "/404" });
    }

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
