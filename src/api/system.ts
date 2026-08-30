import http from "@/utils/request";
import type { ApiResult, PageResult } from "@/api/user";

// ==================== 部门 ====================

export interface DeptItem {
  id: number;
  parentId: number;
  name: string;
  leader: string;
  phone: string;
  email: string;
  sort: number;
  status: number;
  children?: DeptItem[];
}

export type DeptPayload = Omit<DeptItem, "id" | "children"> & { id?: number };

export const getDeptList = () => http.get<ApiResult<DeptItem[]>>("/api/admin/dept/list");

export const saveDept = (data: DeptPayload) => http.post<ApiResult<{ id: number }>>("/api/admin/dept/save", data);

export const deleteDept = (id: number) => http.post<ApiResult<void>>("/api/admin/dept/delete", { id });

// ==================== 角色 ====================

export interface RoleItem {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  /** 已分配的菜单 ID 列表 */
  menuIds: (string | number)[];
  createTime?: string;
}

export type RolePayload = Omit<RoleItem, "id" | "createTime"> & { id?: number };

export interface RoleQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

export const getRoleList = (params?: RoleQueryParams) =>
  http.get<ApiResult<PageResult<RoleItem>>>("/api/admin/role/list", params as Record<string, unknown>);

export const saveRole = (data: RolePayload) => http.post<ApiResult<{ id: number }>>("/api/admin/role/save", data);

export const deleteRole = (id: number) => http.post<ApiResult<void>>("/api/admin/role/delete", { id });

export const toggleRoleStatus = (id: number, status: number) =>
  http.post<ApiResult<void>>("/api/admin/role/status", { id, status });

// ==================== 菜单 ====================

export type MenuType = "directory" | "menu" | "button";

export interface MenuTreeItem {
  id: string | number;
  parentId: string | number | null;
  type: MenuType;
  title: string;
  name?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  hidden: boolean;
  permission?: string;
  children?: MenuTreeItem[];
}

export type MenuPayload = Omit<MenuTreeItem, "id" | "children"> & { id?: string | number };

export const getMenuTree = () => http.get<ApiResult<MenuTreeItem[]>>("/api/admin/menu/tree");

export const saveMenu = (data: MenuPayload) => http.post<ApiResult<{ id: string | number }>>("/api/admin/menu/save", data);

export const deleteMenu = (id: string | number) => http.post<ApiResult<void>>("/api/admin/menu/delete", { id });
