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
