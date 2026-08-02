import http from "@/utils/request";
import type { MenuItem } from "@/types/menu";
import type { UserProfile } from "@/store/modules/user";

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  userInfo: UserProfile;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  status?: number;
}

export interface UserItem {
  id: string | number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  role: string;
  dept: string;
  status: number;
  createTime?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export interface ApiResult<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export const doLogin = (data: LoginParams) => {
  return http.post<ApiResult<LoginResult>>("/api/admin/login", data);
};

export const getMenuList = () => {
  return http.post<ApiResult<MenuItem[]>>("/api/admin/getMenuList");
};

export const getUserList = (params?: UserQueryParams) => {
  return http.get<ApiResult<PageResult<UserItem>>>("/api/admin/getUserList", params as Record<string, unknown>);
};

export const createUser = (data: Partial<UserItem>) => {
  return http.post<ApiResult<UserItem>>("/user", data);
};

export const updateUser = (id: string | number, data: Partial<UserItem>) => {
  return http.put<ApiResult<UserItem>>(`/user/${id}`, data);
};

export const deleteUser = (id: string | number) => {
  return http.delete<ApiResult<void>>(`/user/${id}`);
};

export const updateUserStatus = (id: string | number, status: number) => {
  return http.put<ApiResult<void>>(`/user/${id}/status`, { status });
};
