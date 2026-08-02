import useMenuStore from "@/store/modules/menu";
import useUserStore from "@/store/modules/user";

/**
 * 权限校验：菜单权限点命中即通过，支持通配符 "*"
 */
export function checkPermission(code?: string): boolean {
  if (!code) return true;

  const menuStore = useMenuStore();

  return menuStore.hasPermission(code);
}

/**
 * 角色校验：任一角色命中即通过，支持通配符 "*"
 */
export function checkRole(roles?: string[]): boolean {
  if (!roles || roles.length === 0) return true;

  const userStore = useUserStore();

  return roles.some((role) => role === "*" || userStore.hasRole(role));
}

/**
 * v-permission 指令：无权限时移除元素
 *
 * 用法：<el-button v-permission="'system:user:add'">新增</el-button>
 */
export const permissionDirective = {
  mounted(el: HTMLElement, binding: { value?: string }) {
    if (binding.value && !checkPermission(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * v-role 指令：无角色时移除元素
 *
 * 用法：<el-button v-role="['admin']">删除</el-button>
 */
export const roleDirective = {
  mounted(el: HTMLElement, binding: { value?: string[] }) {
    if (binding.value && !checkRole(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  },
};
