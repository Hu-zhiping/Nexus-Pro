import { defineStore } from "pinia";
import type { RouteRecordRaw } from "vue-router";

import { getMenuList } from "@/api/user";
import type { MenuItem } from "@/types/menu";

const Layout = () => import("@/layout/index.vue");

const views = import.meta.glob("@/views/**/*.vue");

function loadView(component?: string) {
  if (!component || component === "Layout") {
    return Layout;
  }

  const path = `/src/views/${component}.vue`;

  return views[path] ?? (() => import("@/views/404.vue"));
}

function joinPath(parent: string, child: string) {
  return `${parent}/${child}`.replace(/\/+/g, "/");
}

function transformMenuToRoute(menu: MenuItem, parent = ""): RouteRecordRaw {
  const path = joinPath(parent, menu.path);

  const children = menu.children?.map((item) => transformMenuToRoute(item, path));

  return {
    path,

    name: menu.name,

    component: loadView(menu.component),

    meta: menu.meta,

    ...(children?.length ? { children } : {}),
  };
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

    loaded: false,
  }),

  getters: {
    hasPermission: (state) => (code: string) => state.permissions.includes(code),

    /** 侧边栏菜单（构建后的动态路由） */
    sidebarMenus: (state) => state.routes,
  },

  actions: {
    /** 从已有菜单数据重新生成路由（避免重复请求接口） */
    regenerateRoutes() {
      this.routes = this.menuList.map((item) => transformMenuToRoute(item));

      this.loaded = true;

      return this.routes;
    },

    async buildRoutes() {
      const { data } = await getMenuList();

      this.menuList = data ?? [];

      this.routes = this.menuList.map((item) => transformMenuToRoute(item));

      this.permissions = collectPermissions(this.menuList);

      this.loaded = true;

      return this.routes;
    },

    reset() {
      this.$reset();
    },
  },

  persist: {
    pick: ["menuList"],
  },
});

export default useMenuStore;
