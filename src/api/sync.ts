import http from "@/utils/request";
import type { ApiResult } from "@/api/user";

/** 同步方向：飞书→数据库 / 数据库→飞书 / 双向 */
export type SyncDirection = "feishu-to-db" | "db-to-feishu" | "bidirectional";

export type DatabaseType = "mysql" | "sqlserver" | "postgresql";

export interface FeishuConfig {
  appToken: string;
  tableId: string;
  direction: SyncDirection;
}

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  table: string;
}

export interface FieldMappingItem {
  /** 是否启用本字段同步 */
  enabled: boolean;
  source: string;
  sourceType: string;
  target: string;
  targetType: string;
  /** 是否必填（用于校验源端空值） */
  required: boolean;
}

export interface ScheduleConfig {
  enabled: boolean;
  cron: string;
}

export interface TaskForm {
  id?: string | number;
  name: string;
  description: string;
  feishu: FeishuConfig;
  database: DatabaseConfig;
  fields: FieldMappingItem[];
  schedule: ScheduleConfig;
}

export interface FieldInfo {
  name: string;
  type: string;
  description?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
  /** 连接耗时（ms） */
  latency?: number;
}

export interface CronParseResult {
  description: string;
  nextRuns: string[];
}

export interface SaveTaskResult {
  id: string | number;
}

export interface RunTaskResult {
  runId: string | number;
  /** 预计完成时间 */
  estimatedFinishAt: string;
}

export const testFeishuConnection = (data: Partial<FeishuConfig>) =>
  http.post<ApiResult<TestResult>>("/api/sync/testFeishu", data);

export const testDatabaseConnection = (data: Partial<DatabaseConfig>) =>
  http.post<ApiResult<TestResult>>("/api/sync/testDatabase", data);

export const getFeishuFields = (params: { appToken: string; tableId: string }) =>
  http.post<ApiResult<FieldInfo[]>>("/api/sync/getFeishuFields", params);

export const getDatabaseFields = (data: Partial<DatabaseConfig>) =>
  http.post<ApiResult<FieldInfo[]>>("/api/sync/getDatabaseFields", data);

export const parseCron = (cron: string) =>
  http.post<ApiResult<CronParseResult>>("/api/sync/parseCron", { cron });

export const saveSyncTask = (data: TaskForm) =>
  http.post<ApiResult<SaveTaskResult>>("/api/sync/save", data);

export const runSyncTask = (id: string | number) =>
  http.post<ApiResult<RunTaskResult>>(`/api/sync/run`, { id });

/* ==================== 同步任务列表 ==================== */

export type SyncTaskRunStatus = "success" | "failed" | "running" | "";

/** 任务列表行 */
export interface SyncTaskSummary {
  id: number;
  name: string;
  description: string;
  direction: SyncDirection;
  scheduleEnabled: boolean;
  cron: string;
  cronDescription: string;
  /** 1 启用 / 0 停用 */
  status: number;
  lastRunAt: string;
  lastRunStatus: SyncTaskRunStatus;
  updateTime: string;
}

export interface SyncTaskListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  /** 空表示全部 */
  status?: number | "";
}

export interface SyncTaskListResult {
  list: SyncTaskSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export const getSyncTaskList = (params: SyncTaskListParams) =>
  http.get<ApiResult<SyncTaskListResult>>("/api/sync/task/list", params as Record<string, unknown>);

export const getSyncTaskDetail = (id: string | number) =>
  http.get<ApiResult<TaskForm & { status: number }>>(`/api/sync/task/detail`, { id } as Record<string, unknown>);

export const updateSyncTaskStatus = (id: string | number, status: number) =>
  http.post<ApiResult<{ id: number; status: number }>>("/api/sync/task/status", { id, status });

export const deleteSyncTask = (id: string | number) =>
  http.post<ApiResult<null>>("/api/sync/task/delete", { id });
