/** 后端返回的原始菜单数据 */
export interface MenuItem {
  id: string | number;
  path: string;
  name?: string;
  component?: string;
  redirect?: string;
  meta?: {
    title: string;
    icon?: string;
    hidden?: boolean;
    permission?: string;
    disabled?: boolean;
  };
  children?: MenuItem[];
}

/** 侧边栏渲染用的菜单视图模型（由动态路由生成） */
export interface MenuVO {
  /** 完整路由路径（如 /system/user） */
  path: string;
  /** 菜单标题 */
  title: string;
  /** 图标名（ri:xxx） */
  icon?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子菜单 */
  children?: MenuVO[];
}
