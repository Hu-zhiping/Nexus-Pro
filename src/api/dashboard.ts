import http from "@/utils/request";
import type { ApiResult } from "@/api/user";

export type DashboardStatus = "success" | "running" | "failed";
export type DashboardDirection = "forward" | "reverse" | "bidirectional";

export interface DashboardMetrics {
  totalTasks: number;
  todaySyncCount: number;
  /** 成功率，百分比 */
  successRate: number;
  /** 平均耗时（秒） */
  avgDuration: number;
  /** 与上期对比的变化幅度，正为增、负为减 */
  totalTasksTrend: number;
  todaySyncTrend: number;
  successRateTrend: number;
  avgDurationTrend: number;
}

export interface DailyTrend {
  date: string;
  success: number;
  failed: number;
}

export interface StatusDistribution {
  success: number;
  running: number;
  failed: number;
}

export interface DashboardRecentTask {
  id: number;
  taskName: string;
  source: string;
  target: string;
  direction: DashboardDirection;
  status: DashboardStatus;
  /** 单次同步耗时（秒） */
  duration: number;
  createTime: string;
}

export interface DashboardOverview {
  metrics: DashboardMetrics;
  trends: DailyTrend[];
  statusDistribution: StatusDistribution;
  recentTasks: DashboardRecentTask[];
}

export const getDashboardOverview = () => {
  return http.get<ApiResult<DashboardOverview>>("/api/dashboard/overview");
};
