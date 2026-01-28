// store/modules/menu.ts
import { getMenuList } from "@/api/user";
import { defineStore } from "pinia";
import { routes } from "@/router";
import { RouteRecordRaw } from "vue-router";

// 定义菜单项的类型
export interface MenuItem {
	path: string;
	component: string | (() => Promise<any>);
	name?: string;
	meta?: {
		icon?: string;
		title?: string;
		hidden?: boolean;
		[key: string]: any;
	};
	children?: MenuItem[];
	[key: string]: any;
}

const modules = import.meta.glob("@/views/**/*.vue");
// 布局组件
const Layout = () => import("@/layout/index.vue");

const useMenuStore = defineStore("menu", {
	state: () => ({
		asyncRoutes: [] as RouteRecordRaw[], // 异步获取的动态路由
		constantRoutes: [] as RouteRecordRaw[], // 预定义的静态路由
		allRoutes: [] as RouteRecordRaw[], // 所有路由的集合
		menuList: [] as MenuItem[] // 原始菜单数据，用于持久化
	}),
	actions: {
		async fetchMenuList(): Promise<RouteRecordRaw[]> {
			try {
				const res: any = await getMenuList();
				// 保存原始菜单数据
				this.menuList = res.data || [];
				// 转换为路由格式
				this.asyncRoutes = transformRoute(this.menuList);
				this.constantRoutes = [...routes];
				this.allRoutes = [...this.constantRoutes, ...this.asyncRoutes];
				return this.asyncRoutes;
			} catch (error) {
				console.error("获取菜单列表失败:", error);
				return [];
			}
		},

		// 从持久化存储恢复后重新处理路由
		reprocessRoutes() : RouteRecordRaw[]{
			// 如果有原始菜单数据，重新转换路由
			if (this.menuList && this.menuList.length > 0) {
				this.asyncRoutes = transformRoute(this.menuList);
				this.constantRoutes = [...routes];
				this.allRoutes = [...this.constantRoutes, ...this.asyncRoutes];
				return this.asyncRoutes;
			}
			return [];
		}
	},
	getters: {
		// 获取可见菜单（过滤掉 meta.hidden 为 true 的菜单项）
		visibleMenus(): RouteRecordRaw[] {
			return this.allRoutes.filter(route => {
				return !(route.meta?.hidden);
			});
		},
		
		// 获取扁平化的路由列表
		flatRoutes(): RouteRecordRaw[] {
			const flattenRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
				let result: RouteRecordRaw[] = [];
				routes.forEach(route => {
					result.push(route);
					if (route.children && route.children.length > 0) {
						result = result.concat(flattenRoutes(route.children));
					}
				});
				return result;
			};
			
			return flattenRoutes(this.allRoutes);
		},
		
		// 根据路径获取路由
		getRouteByPath: (state) => (path: string): RouteRecordRaw | undefined => {
			const findRoute = (routes: RouteRecordRaw[], targetPath: string): RouteRecordRaw | undefined => {
				for (const route of routes) {
					if (route.path === targetPath) {
						return route;
					}
					if (route.children && route.children.length > 0) {
						const found = findRoute(route.children, targetPath);
						if (found) return found;
					}
				}
				return undefined;
			};
			
			return findRoute(state.allRoutes, path);
		}
	},
	persist: {
		paths: ["menuList"] // 只持久化原始菜单数据，不持久化路由对象
	}
});

/**
 * 路由转换函数
 * 将菜单数据转换为路由格式，处理组件加载
 * @param data 菜单数据数组
 * @returns 转换后的路由数据
 */
/**
 * 路由转换函数
 * 将菜单数据转换为路由格式，处理组件加载
 * @param data 菜单数据数组
 * @returns 转换后的路由数据
 */
/**
 * 转换菜单数据为路由配置
 * 顶层菜单包裹 Layout，叶子节点直接作为 Layout 的子路由
 */
export const transformRoute = (data: MenuItem[]): RouteRecordRaw[] => {
	// 验证输入数据
	if (!Array.isArray(data)) {
		console.warn("菜单数据格式不正确，应为数组");
		return [];
	}

	// 使用 map 创建新数组，避免修改原始数据
	return data.map((item: MenuItem) => {
		// 创建路由项的副本
		const route = { ...item } as unknown as RouteRecordRaw;
		
		// 判断是否为需要 Layout 包裹的顶层菜单（有子菜单或者是明确标记为 Layout 的）
		const needsLayout = item.component === "Layout" || (item.children && item.children.length > 0);
		
		if (needsLayout) {
			// 使用 Layout 作为组件
			route.component = Layout;
			
			// 处理子菜单 - 子菜单直接是页面组件，不再嵌套 Layout
			if (item.children && item.children.length > 0) {
				route.children = item.children.map((child: MenuItem) => {
					const childRoute: RouteRecordRaw = {
						path: child.path,
						name: child.name,
						meta: child.meta,
						component: typeof child.component === "string"
							? loadView(child.component)
							: () => import("@/views/404.vue")
					} as RouteRecordRaw;
					
					// 如果子菜单还有更深层的嵌套（三级菜单），递归处理
					if (child.children && child.children.length > 0) {
						childRoute.children = transformRoute(child.children);
					}
					
					return childRoute;
				});
			}
		} else {
			// 顶层叶子节点（如 dashboard），需要包裹在 Layout 中
			// 创建子路由（保留所有原始属性）
			const childRoute: RouteRecordRaw = {
				path: item.path,
				name: item.name,
				meta: item.meta,
				component: typeof item.component === "string" 
					? loadView(item.component) 
					: () => import("@/views/404.vue")
			} as RouteRecordRaw;
			
			// 父路由使用 Layout，移除 name 避免冲突，子路由数组包含当前路由
			route.component = Layout;
			delete (route as any).name; // 移除父路由的 name，避免与子路由冲突
			route.children = [childRoute];
		}
		return route;
	});
};

/**
 * 动态加载vue组件
 * @param view 组件路径（相对于views目录）
 * @returns 组件加载函数或404组件
 */
export const loadView = (view: string) => {
	// 查找匹配的组件路径
	const modulePath = Object.keys(modules).find(path => path.includes(`views/${view}`));

	if (modulePath) {
		// 返回组件加载函数
		return () => modules[modulePath]();
	} else {
		// 记录错误并返回404组件
		console.error(`未能找到与路径 ${view} 对应的组件`);
		return () => import("@/views/404.vue");
	}
};

export default useMenuStore;