import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export interface RouteMeta {
  title?: string;
  icon?: string;
  hidden?: boolean;
  /** 仅有一个子路由时也以父级目录展示（否则自动扁平化为子级） */
  alwaysShow?: boolean;
  affix?: boolean;
  noCache?: boolean;
  breadcrumb?: boolean;
  activeMenu?: string;
  permission?: string;
  roles?: string[];
  disabled?: boolean;
  keepAlive?: boolean;
  link?: string;
  isIframe?: boolean;
}

export type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
  children?: AppRouteRecordRaw[];
};

export const constantRoutes: AppRouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录", hidden: true },
  },
  {
    path: "/",
    redirect: "/dashboard",
    meta: { hidden: true },
  },
];

export const baseRoutes: AppRouteRecordRaw[] = [
  {
    path: "/dashboard",
    component: () => import("@/layout/index.vue"),
    meta: { hidden: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/dashboard/dashboard.vue"),
        meta: {
          title: "仪表盘",
          icon: "ri:dashboard-3-line",
          affix: true,
          noCache: false,
        },
      },
    ],
  },
  {
    path: "/profile",
    component: () => import("@/layout/index.vue"),
    meta: { hidden: true },
    children: [
      {
        path: "",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: {
          title: "个人中心",
          hidden: true,
        },
      },
      {
        path: "settings",
        name: "ProfileSettings",
        component: () => import("@/views/profile/settings.vue"),
        meta: {
          title: "个人设置",
          hidden: true,
        },
      },
    ],
  },
];

export const errorRoutes: AppRouteRecordRaw[] = [
  {
    path: "/404",
    name: "NotFound",
    component: () => import("@/views/404.vue"),
    meta: { title: "页面不存在", hidden: true },
  },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("@/views/403.vue"),
    meta: { title: "无权访问", hidden: true },
  },
  {
    path: "/redirect/:path(.*)",
    name: "Redirect",
    component: () => import("@/views/redirect/index.vue"),
    meta: { title: "重定向", hidden: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...constantRoutes, ...baseRoutes, ...errorRoutes] as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export default router;
