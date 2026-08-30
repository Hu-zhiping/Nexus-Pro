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

export interface NotificationItem {
  id: number;
  type: "info" | "success" | "warning";
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export interface NotificationResult {
  list: NotificationItem[];
  unreadCount: number;
}

export type SyncDirection = "forward" | "reverse" | "bidirectional";
export type SyncStatus = "success" | "running" | "failed";
export type SyncTriggerType = "手动" | "定时";

export interface SyncHistoryItem {
  id: string | number;
  taskName: string;
  source: string;
  target: string;
  direction: SyncDirection;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  /** 单次同步耗时（秒） */
  duration: number;
  status: SyncStatus;
  triggerType: SyncTriggerType;
  createTime: string;
}

export interface SyncHistoryQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: SyncStatus;
  triggerType?: SyncTriggerType;
}

export const doLogin = (data: LoginParams) => {
  return http.post<ApiResult<LoginResult>>("/api/admin/login", data);
};

export const getMenuList = () => {
  return http.post<ApiResult<MenuItem[]>>("/api/admin/getMenuList");
};

export const getNotifications = () => {
  return http.get<ApiResult<NotificationResult>>("/api/admin/getNotifications");
};

export const getSyncHistory = (params?: SyncHistoryQueryParams) => {
  return http.get<ApiResult<PageResult<SyncHistoryItem>>>(
    "/api/admin/getSyncHistory",
    params as Record<string, unknown>,
  );
};

export const getUserList = (params?: UserQueryParams) => {
  return http.get<ApiResult<PageResult<UserItem>>>("/api/admin/user/list", params as Record<string, unknown>);
};

export const saveUser = (data: Partial<UserItem> & { password?: string }) => {
  return http.post<ApiResult<{ id: string | number }>>("/api/admin/user/save", data);
};

export const deleteUser = (id: string | number) => {
  return http.post<ApiResult<void>>("/api/admin/user/delete", { id });
};

export const updateUserStatus = (id: string | number, status: number) => {
  return http.post<ApiResult<void>>("/api/admin/user/status", { id, status });
};
