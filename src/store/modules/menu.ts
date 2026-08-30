import { defineStore } from "pinia";
import type { RouteComponent, RouteRecordRaw } from "vue-router";

import { getMenuList } from "@/api/user";
import type { AppRouteRecordRaw } from "@/router";
import type { MenuItem, MenuVO } from "@/types/menu";

const Layout = () => import("@/layout/index.vue");

const views = import.meta.glob("@/views/**/*.vue");

/** 菜单结构版本：后端/演示菜单发生结构性变更时 +1，
 *  已登录用户的持久化菜单会在下次进入时自动重新拉取 */
export const MENU_VERSION = 3;

function loadView(component?: string): () => Promise<RouteComponent> {
  if (!component || component === "Layout") {
    return Layout;
  }

  const path = `/src/views/${component}.vue`;

  return (views[path] ?? (() => import("@/views/404.vue"))) as () => Promise<RouteComponent>;
}

function joinPath(parent: string, child: string) {
  return `${parent}/${child}`.replace(/\/+/g, "/");
}

/** 后端菜单 → 动态路由 */
function transformMenuToRoute(menu: MenuItem, parent = ""): AppRouteRecordRaw {
  const path = joinPath(parent, menu.path);

  const children = menu.children?.map((item) => transformMenuToRoute(item, path));

  return {
    path,

    name: menu.name,

    component: loadView(menu.component),

    redirect: menu.redirect,

    meta: menu.meta,

    ...(children?.length ? { children } : {}),
  } as AppRouteRecordRaw;
}

/** 动态路由 → 侧边栏菜单树（过滤隐藏项，单子级扁平化） */
function generateMenus(routes: RouteRecordRaw[]): MenuVO[] {
  const menus: MenuVO[] = [];

  routes.forEach((route) => {
    // 隐藏的路由不渲染到侧边栏
    if (route.meta?.hidden) return;

    const children = route.children ? generateMenus(route.children) : [];

    // 只有一个子级且未显式声明 alwaysShow 时，直接展示子级
    if (children.length === 1 && !route.meta?.alwaysShow) {
      menus.push(children[0]);
      return;
    }

    menus.push({
      path: route.path,
      title: (route.meta?.title as string | undefined) ?? String(route.name ?? ""),
      icon: route.meta?.icon as string | undefined,
      disabled: route.meta?.disabled as boolean | undefined,
      ...(children.length ? { children } : {}),
    });
  });

  return menus;
}

function collectPermissions(menus: MenuItem[]): string[] {
  const permissions: string[] = [];

  menus.forEach((item) => {
    if (item.meta?.permission) {
      permissions.push(item.meta.permission);
    }

    if (item.children?.length) {
      permissions.push(...collectPermissions(item.children));
    }
  });

  return permissions;
}

const useMenuStore = defineStore("menu", {
  state: () => ({
    menuList: [] as MenuItem[],

    routes: [] as RouteRecordRaw[],

    permissions: [] as string[],

    /** 已加载菜单对应的 MENU_VERSION */
    menuVersion: 0,

    loaded: false,
  }),

  getters: {
    hasPermission: (state) => (code: string) => state.permissions.includes(code),

    /** 侧边栏菜单（由动态路由生成） */
    sidebarMenus: (state): MenuVO[] => generateMenus(state.routes),
  },

  actions: {
    /** 从已有菜单数据重新生成路由（避免重复请求接口） */
    regenerateRoutes() {
      this.routes = this.menuList.map((item) => transformMenuToRoute(item));

      this.menuVersion = MENU_VERSION;

      this.loaded = true;

      return this.routes;
    },

    async buildRoutes() {
      const { data } = await getMenuList();

      this.menuList = data ?? [];

      this.routes = this.menuList.map((item) => transformMenuToRoute(item));

      this.permissions = collectPermissions(this.menuList);

      this.menuVersion = MENU_VERSION;

      this.loaded = true;

      return this.routes;
    },

    reset() {
      this.$reset();
    },
  },

  persist: {
    key: "menu-store-nexus-sync",
    pick: ["menuList", "menuVersion"],
  },
});

export default useMenuStore;
