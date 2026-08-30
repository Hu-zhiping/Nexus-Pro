<template>
  <div class="dashboard">
    <!-- 欢迎区 -->
    <div class="dashboard__welcome">
      <div>
        <h2 class="dashboard__title">{{ greeting }}，{{ userName }}</h2>
        <p class="dashboard__desc">{{ todayLabel }} · 今日已执行 {{ overview?.metrics.todaySyncCount ?? 0 }} 次同步</p>
      </div>
      <div class="dashboard__quick">
        <el-button type="primary" @click="goNewTask">
          <SvgIcon name="ri:add-line" size="16" />
          <span>新建同步任务</span>
        </el-button>
        <el-button @click="goHistory">
          <SvgIcon name="ri:history-line" size="16" />
          <span>运行历史</span>
        </el-button>
      </div>
    </div>

    <!-- 指标卡 -->
    <div v-loading="loading" class="dashboard__metrics">
      <div
        v-for="m in metricCards"
        :key="m.key"
        class="metric-card"
        :class="`metric-card--${m.tone}`"
      >
        <div class="metric-card__icon">
          <SvgIcon :name="m.icon" size="22" />
        </div>
        <div class="metric-card__body">
          <div class="metric-card__label">{{ m.label }}</div>
          <div class="metric-card__value">{{ m.value }}<span v-if="m.unit" class="metric-card__unit">{{ m.unit }}</span></div>
          <div class="metric-card__trend" :class="m.trendClass">
            <SvgIcon :name="m.trendIcon" size="14" />
            <span>{{ m.trendText }}</span>
            <span class="metric-card__trend-label">{{ m.trendLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势 + 状态分布 -->
    <div class="dashboard__row">
      <el-card class="trend-card" shadow="never">
        <template #header>
          <div class="card-title">
            <SvgIcon name="ri:bar-chart-2-line" size="18" />
            <span>近 7 日同步趋势</span>
          </div>
        </template>
        <div class="trend-chart">
          <div class="trend-chart__bars">
            <div
              v-for="(item, idx) in overview?.trends ?? []"
              :key="idx"
              class="trend-bar"
            >
              <div class="trend-bar__stack" :title="`${item.date} · 成功 ${item.success} / 失败 ${item.failed}`">
                <div
                  class="trend-bar__seg trend-bar__seg--success"
                  :style="{ height: `${barHeight(item.success)}px` }"
                ></div>
                <div
                  class="trend-bar__seg trend-bar__seg--failed"
                  :style="{ height: `${barHeight(item.failed)}px` }"
                ></div>
              </div>
              <div class="trend-bar__label">{{ item.date }}</div>
            </div>
          </div>
          <div class="trend-legend">
            <span class="trend-legend__item"><i class="dot dot--success"></i>成功</span>
            <span class="trend-legend__item"><i class="dot dot--failed"></i>失败</span>
          </div>
        </div>
      </el-card>

      <el-card class="status-card" shadow="never">
        <template #header>
          <div class="card-title">
            <SvgIcon name="ri:donut-chart-line" size="18" />
            <span>运行状态分布</span>
          </div>
        </template>
        <div class="status-donut">
          <svg viewBox="0 0 120 120" class="status-donut__svg">
            <circle cx="60" cy="60" r="48" class="status-donut__track"></circle>
            <circle
              v-if="statusSegments.success"
              cx="60"
              cy="60"
              r="48"
              class="status-donut__seg status-donut__seg--success"
              :stroke-dasharray="statusSegments.success.dasharray"
              :stroke-dashoffset="statusSegments.success.dashoffset"
            ></circle>
            <circle
              v-if="statusSegments.running"
              cx="60"
              cy="60"
              r="48"
              class="status-donut__seg status-donut__seg--running"
              :stroke-dasharray="statusSegments.running.dasharray"
              :stroke-dashoffset="statusSegments.running.dashoffset"
            ></circle>
            <circle
              v-if="statusSegments.failed"
              cx="60"
              cy="60"
              r="48"
              class="status-donut__seg status-donut__seg--failed"
              :stroke-dasharray="statusSegments.failed.dasharray"
              :stroke-dashoffset="statusSegments.failed.dashoffset"
            ></circle>
          </svg>
          <div class="status-donut__center">
            <div class="status-donut__count">{{ statusTotal }}</div>
            <div class="status-donut__label">总执行</div>
          </div>
        </div>
        <div class="status-list">
          <div class="status-list__item">
            <span class="status-list__dot dot--success"></span>
            <span class="status-list__label">成功</span>
            <span class="status-list__value">{{ overview?.statusDistribution.success ?? 0 }}</span>
          </div>
          <div class="status-list__item">
            <span class="status-list__dot dot--running"></span>
            <span class="status-list__label">运行中</span>
            <span class="status-list__value">{{ overview?.statusDistribution.running ?? 0 }}</span>
          </div>
          <div class="status-list__item">
            <span class="status-list__dot dot--failed"></span>
            <span class="status-list__label">失败</span>
            <span class="status-list__value">{{ overview?.statusDistribution.failed ?? 0 }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近同步 -->
    <el-card class="recent-card" shadow="never">
      <template #header>
        <div class="card-title card-title--row">
          <div class="card-title__left">
            <SvgIcon name="ri:time-line" size="18" />
            <span>最近同步任务</span>
          </div>
          <el-button link type="primary" @click="goHistory">
            <span>查看全部</span>
            <SvgIcon name="ri:arrow-right-line" size="14" />
          </el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="overview?.recentTasks ?? []" size="default" empty-text="暂无同步记录">
        <el-table-column label="任务名称" prop="taskName" min-width="160" show-overflow-tooltip />
        <el-table-column label="方向" width="160">
          <template #default="{ row }">
            <el-tag :type="directionTagType(row.direction)" size="small" effect="plain">
              {{ directionLabel(row.direction) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源 → 目标" min-width="200">
          <template #default="{ row }">
            <span class="route-text">
              <span class="route-text__node">{{ row.source }}</span>
              <SvgIcon name="ri:arrow-right-line" size="14" class="route-text__arrow" />
              <span class="route-text__node">{{ row.target }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">{{ formatDuration(row.duration) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" :effect="row.status === 'running' ? 'light' : 'light'">
              <SvgIcon v-if="row.status === 'running'" name="ri:loader-4-line" size="12" class="is-spinning" />
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行时间" prop="createTime" min-width="160" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { getDashboardOverview } from "@/api/dashboard";
import type { DashboardOverview, DashboardStatus, DashboardDirection } from "@/api/dashboard";
import useUserStore from "@/store/modules/user";

defineOptions({ name: "Dashboard" });

interface SegmentDesc {
  dasharray: string;
  dashoffset: number;
}

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const overview = ref<DashboardOverview | null>(null);

const userName = computed(() => userStore.displayName || "管理员");

const todayLabel = computed(() => {
  const d = new Date();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return `${dateStr} · ${weekdays[d.getDay()]}`;
});

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "凌晨好";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
});

interface MetricCard {
  key: string;
  label: string;
  value: string;
  unit?: string;
  icon: string;
  tone: "primary" | "success" | "warning" | "danger";
  trendClass: "is-up" | "is-down" | "is-flat";
  trendIcon: string;
  trendText: string;
  trendLabel: string;
}

const metricCards = computed<MetricCard[]>(() => {
  const m = overview.value?.metrics;
  if (!m) return [];
  const fmt = (v: number, suffix = "") => `${v}${suffix}`;
  return [
    {
      key: "total",
      label: "任务总数",
      value: fmt(m.totalTasks),
      icon: "ri:stack-line",
      tone: "primary",
      trendClass: m.totalTasksTrend >= 0 ? "is-up" : "is-down",
      trendIcon: m.totalTasksTrend >= 0 ? "ri:arrow-up-line" : "ri:arrow-down-line",
      trendText: `${Math.abs(m.totalTasksTrend)}%`,
      trendLabel: "较上周",
    },
    {
      key: "today",
      label: "今日同步",
      value: fmt(m.todaySyncCount, " 次"),
      icon: "ri:pulse-line",
      tone: "success",
      trendClass: m.todaySyncTrend >= 0 ? "is-up" : "is-down",
      trendIcon: m.todaySyncTrend >= 0 ? "ri:arrow-up-line" : "ri:arrow-down-line",
      trendText: `${Math.abs(m.todaySyncTrend)}%`,
      trendLabel: "较昨日",
    },
    {
      key: "rate",
      label: "成功率",
      value: m.successRate.toFixed(1),
      unit: "%",
      icon: "ri:checkbox-circle-line",
      tone: m.successRateTrend >= 0 ? "success" : "warning",
      trendClass: m.successRateTrend >= 0 ? "is-up" : "is-down",
      trendIcon: m.successRateTrend >= 0 ? "ri:arrow-up-line" : "ri:arrow-down-line",
      trendText: `${Math.abs(m.successRateTrend)}%`,
      trendLabel: "较上周",
    },
    {
      key: "duration",
      label: "平均耗时",
      value: fmt(m.avgDuration, "s"),
      icon: "ri:timer-line",
      tone: "warning",
      trendClass: m.avgDurationTrend <= 0 ? "is-up" : "is-down",
      trendIcon: m.avgDurationTrend <= 0 ? "ri:arrow-down-line" : "ri:arrow-up-line",
      trendText: `${Math.abs(m.avgDurationTrend)}%`,
      trendLabel: "耗时变化",
    },
  ];
});

const trendMax = computed(() => {
  const arr = overview.value?.trends ?? [];
  if (!arr.length) return 1;
  return Math.max(...arr.map((t) => t.success + t.failed), 1);
});

function barHeight(value: number) {
  return Math.max(2, (value / trendMax.value) * 120);
}

const statusTotal = computed(() => {
  const d = overview.value?.statusDistribution;
  if (!d) return 0;
  return d.success + d.running + d.failed;
});

const statusSegments = computed(() => {
  const d = overview.value?.statusDistribution;
  const total = d ? d.success + d.running + d.failed : 0;
  if (!total) {
    return { success: null, running: null, failed: null } as {
      success: SegmentDesc | null;
      running: SegmentDesc | null;
      failed: SegmentDesc | null;
    };
  }
  const circumference = 2 * Math.PI * 48;
  const build = (value: number, offset: number): SegmentDesc => ({
    dasharray: `${(value / total) * circumference} ${circumference - (value / total) * circumference}`,
    dashoffset: offset,
  });
  const successLen = (d!.success / total) * circumference;
  const runningLen = (d!.running / total) * circumference;
  return {
    success: build(d!.success, 0),
    running: build(d!.running, -successLen),
    failed: build(d!.failed, -(successLen + runningLen)),
  };
});

function directionLabel(d: DashboardDirection) {
  switch (d) {
    case "forward":
      return "飞书 → 数据库";
    case "reverse":
      return "数据库 → 飞书";
    case "bidirectional":
      return "双向同步";
    default:
      return "—";
  }
}

function directionTagType(d: DashboardDirection): "primary" | "success" | "warning" {
  switch (d) {
    case "forward":
      return "primary";
    case "reverse":
      return "success";
    case "bidirectional":
      return "warning";
    default:
      return "primary";
  }
}

function statusLabel(s: DashboardStatus) {
  switch (s) {
    case "success":
      return "成功";
    case "running":
      return "运行中";
    case "failed":
      return "失败";
    default:
      return "—";
  }
}

function statusTagType(s: DashboardStatus): "success" | "primary" | "danger" {
  switch (s) {
    case "success":
      return "success";
    case "running":
      return "primary";
    case "failed":
      return "danger";
    default:
      return "success";
  }
}

function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function goNewTask() {
  router.push("/sync/task");
}

function goHistory() {
  router.push("/sync/history");
}

async function fetchOverview() {
  loading.value = true;
  try {
    const { data } = await getDashboardOverview();
    overview.value = data;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchOverview();
});
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--layout-content-gap);
}

.dashboard__welcome {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  color: #fff;
}

.dashboard__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.dashboard__desc {
  margin: 6px 0 0;
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.85);
}

.dashboard__quick {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  :deep(.el-button) {
    color: #fff;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }

  :deep(.el-button--primary) {
    background: #fff;
    color: var(--color-primary);
    border-color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.9);
    }
  }
}

.dashboard__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  transition: box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }
}

.metric-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.metric-card--primary .metric-card__icon {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.metric-card--success .metric-card__icon {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}
.metric-card--warning .metric-card__icon {
  background: color-mix(in srgb, var(--color-warning) 14%, transparent);
  color: var(--color-warning);
}
.metric-card--danger .metric-card__icon {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}

.metric-card__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.metric-card__value {
  margin: 4px 0;
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.metric-card__unit {
  margin-left: 2px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.metric-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
}

.metric-card__trend.is-up {
  color: var(--color-success);
}
.metric-card__trend.is-down {
  color: var(--color-danger);
}
.metric-card__trend.is-flat {
  color: var(--color-text-secondary);
}

.metric-card__trend-label {
  color: var(--color-text-placeholder);
  margin-left: 2px;
}

.dashboard__row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.trend-card,
.status-card,
.recent-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border-light);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-title--row {
  justify-content: space-between;
}

.card-title__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-chart__bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  height: 160px;
  padding: 8px 0;
}

.trend-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.trend-bar__stack {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 2px;
  width: 24px;
}

.trend-bar__seg {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height var(--transition-base);
}

.trend-bar__seg--success {
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
}

.trend-bar__seg--failed {
  background: linear-gradient(180deg, var(--color-danger) 0%, color-mix(in srgb, var(--color-danger) 75%, #000) 100%);
  border-radius: 4px 4px 0 0;
}

.trend-bar__label {
  font-size: 11px;
  color: var(--color-text-placeholder);
}

.trend-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.trend-legend__item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot--success {
  background: var(--color-primary);
}
.dot--failed {
  background: var(--color-danger);
}
.dot--running {
  background: var(--color-warning);
}

.status-donut {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 8px 0 16px;
}

.status-donut__svg {
  width: 140px;
  height: 140px;
  transform: rotate(-90deg);
}

.status-donut__track {
  fill: none;
  stroke: var(--color-bg-fill);
  stroke-width: 12;
}

.status-donut__seg {
  fill: none;
  stroke-width: 12;
  stroke-linecap: butt;
  transition: stroke-dasharray var(--transition-slow);
}

.status-donut__seg--success {
  stroke: var(--color-primary);
}
.status-donut__seg--running {
  stroke: var(--color-warning);
}
.status-donut__seg--failed {
  stroke: var(--color-danger);
}

.status-donut__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.status-donut__count {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-donut__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-list__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-fill);
  border-radius: var(--radius-md);
}

.status-list__label {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-main);
}

.status-list__value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.recent-card {
  :deep(.el-card__body) {
    padding: 0;
    overflow: hidden;
  }
}

.route-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--color-text-main);
}

.route-text__node {
  font-weight: 500;
}

.route-text__arrow {
  color: var(--color-text-placeholder);
}

.is-spinning {
  animation: spin 1.4s linear infinite;
  margin-right: 4px;
}

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1280px) {
  .dashboard__metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard__row {
    grid-template-columns: 1fr;
  }
}
</style>
