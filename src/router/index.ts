import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

// ==================== 类型定义 ====================

/** 路由元信息 */
export interface RouteMeta {
  /** 页面标题 */
  title?: string;
  /** 图标 */
  icon?: string;
  /** 是否隐藏（不在侧边栏显示） */
  hidden?: boolean;
  /** 是否固定在标签页 */
  affix?: boolean;
  /** 是否不缓存（keep-alive） */
  noCache?: boolean;
  /** 是否在面包屑中显示 */
  breadcrumb?: boolean;
  /** 激活的菜单路径（用于详情页等） */
  activeMenu?: string;
  /** 权限标识 */
  permission?: string;
  /** 允许访问的角色 */
  roles?: string[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否缓存（keep-alive） */
  keepAlive?: boolean;
  /** 外链地址 */
  link?: string;
  /** 是否内嵌 iframe */
  isIframe?: boolean;
}

/** 扩展的路由配置 */
export type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
  children?: AppRouteRecordRaw[];
};

// ==================== 静态路由配置 ====================

/**
 * 常量路由（无需登录）
 */
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

/**
 * 基础路由（登录后默认拥有）
 */
export const baseRoutes: AppRouteRecordRaw[] = [
  {
    path: "/dashboard",
    component: () => import("@/layout/index.vue"),
    meta: { hidden: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
          title: "首页",
          icon: "ri:dashboard-line",
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

/**
 * 错误页面路由
 */
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

// ==================== 路由实例 ====================

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...constantRoutes, ...baseRoutes, ...errorRoutes] as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// ==================== 导出 ====================

export default router;
