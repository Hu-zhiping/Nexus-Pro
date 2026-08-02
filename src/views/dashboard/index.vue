<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">数据概览</h2>
        <p class="page-desc">欢迎回来，{{ userName }}，今日系统运行正常</p>
      </div>
      <div class="page-actions">
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <el-button type="primary" :icon="Download">导出报表</el-button>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="16">
      <el-col v-for="item in statCards" :key="item.title" :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-trend">
                <el-tag :type="item.trend >= 0 ? 'success' : 'danger'" size="small" effect="light">
                  <SvgIcon
                    :name="item.trend >= 0 ? 'ri:arrow-up-line' : 'ri:arrow-down-line'"
                    size="12"
                    style="margin-right: 2px"
                  />
                  {{ Math.abs(item.trend) }}%
                </el-tag>
                <span class="stat-compare">较昨日</span>
              </div>
            </div>
            <div class="stat-icon" :class="item.iconType">
              <SvgIcon :name="item.icon" size="24" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间图表行 -->
    <el-row :gutter="16">
      <!-- 近7日访问趋势 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">近7日访问趋势</span>
              <el-tag type="info" size="small" effect="plain">周</el-tag>
            </div>
          </template>
          <div class="chart-box">
            <svg class="line-chart" viewBox="0 0 700 260" preserveAspectRatio="none">
              <line
                v-for="i in 4"
                :key="'grid-' + i"
                x1="40"
                :y2="i * 50"
                x2="680"
                :y1="i * 50"
                :style="{ stroke: 'var(--border-lighter)', strokeWidth: 1 }"
              />
              <path :d="areaPath" :style="{ fill: 'var(--el-color-primary-light-9)' }" />
              <polyline
                :points="linePoints"
                fill="none"
                :style="{ stroke: 'var(--color-primary)', strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }"
              />
              <circle
                v-for="(pt, idx) in chartPoints"
                :key="'pt-' + idx"
                :cx="pt.x"
                :cy="pt.y"
                r="4"
                :style="{ fill: 'var(--bg-card)', stroke: 'var(--color-primary)', strokeWidth: 2 }"
              />
            </svg>
            <div class="chart-labels">
              <span v-for="day in weekDays" :key="day">{{ day }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 订单来源分布 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单来源分布</span>
              <el-tag type="info" size="small" effect="plain">本月</el-tag>
            </div>
          </template>
          <div class="donut-wrap">
            <div class="donut-chart" :style="donutStyle">
              <div class="donut-center">
                <span class="donut-total">{{ orderTotal }}</span>
                <span class="donut-label">总订单</span>
              </div>
            </div>
            <div class="donut-legend">
              <div v-for="item in orderSources" :key="item.name" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-value">{{ item.value }}</span>
                <span class="legend-percent">{{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部表格：最新订单 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">最新订单</span>
          <el-button link type="primary" @click="$router.push('/data/report')">查看全部</el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="pagedOrders" border stripe row-key="id">
        <template #empty>
          <el-empty description="暂无订单数据" />
        </template>
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="customer" label="客户姓名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="140" align="right">
          <template #default="{ row }">
            <span class="order-amount">¥{{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" align="right">
          <template #default="{ row }">
            <span class="text-tertiary">{{ row.time }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="orderPage"
          v-model:page-size="orderPageSize"
          :total="orders.length"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Refresh, Download } from "@element-plus/icons-vue";
import SvgIcon from "@/components/svg-icon/index.vue";
import useUserStore from "@/store/modules/user";

const userStore = useUserStore();
const userName = computed(() => userStore.displayName || "Admin");
const loading = ref(false);

// 统计卡片
const statCards = [
  { title: "总用户数", value: "12,846", icon: "ri:user-line", iconType: "primary", trend: 12.5 },
  { title: "今日访问", value: "3,294", icon: "ri:eye-line", iconType: "success", trend: 8.2 },
  { title: "订单总数", value: "1,528", icon: "ri:shopping-cart-line", iconType: "warning", trend: -3.1 },
  { title: "营收总额", value: "¥98,420", icon: "ri:money-cny-circle-line", iconType: "danger", trend: 15.6 },
];

// 折线图
const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const visitData = [820, 932, 901, 1290, 1330, 1520, 1450];

const chartPoints = computed(() => {
  const max = Math.max(...visitData);
  const min = Math.min(...visitData);
  const range = max - min || 1;
  const stepX = 640 / (visitData.length - 1);
  return visitData.map((val, idx) => ({
    x: 40 + idx * stepX,
    y: 220 - ((val - min) / range) * 180,
  }));
});

const linePoints = computed(() => chartPoints.value.map((p) => `${p.x},${p.y}`).join(" "));

const areaPath = computed(() => {
  const pts = chartPoints.value;
  if (!pts.length) return "";
  const start = `M ${pts[0].x},220`;
  const line = pts.map((p) => `L ${p.x},${p.y}`).join(" ");
  const close = `L ${pts[pts.length - 1].x},220 Z`;
  return `${start} ${line} ${close}`;
});

// 环形图
const orderSources = [
  { name: "线上商城", value: 642, percent: 42, color: "var(--color-primary)" },
  { name: "线下门店", value: 458, percent: 30, color: "var(--el-color-success)" },
  { name: "分销渠道", value: 274, percent: 18, color: "var(--el-color-warning)" },
  { name: "其他渠道", value: 154, percent: 10, color: "var(--el-color-info)" },
];

const orderTotal = computed(() => orderSources.reduce((sum, s) => sum + s.value, 0));

const donutStyle = computed(() => {
  let acc = 0;
  const stops = orderSources.map((s) => {
    const start = acc;
    acc += s.percent;
    return `${s.color} ${start}% ${acc}%`;
  });
  return { background: `conic-gradient(${stops.join(", ")})` };
});

// 订单表格
interface OrderItem {
  id: number;
  orderNo: string;
  customer: string;
  amount: number;
  status: string;
  time: string;
}

const orders = ref<OrderItem[]>([
  { id: 1, orderNo: "DD20250718001", customer: "张伟", amount: 1280, status: "已完成", time: "2025-07-18 14:30" },
  { id: 2, orderNo: "DD20250718002", customer: "李娜", amount: 860, status: "待发货", time: "2025-07-18 13:15" },
  { id: 3, orderNo: "DD20250718003", customer: "王强", amount: 2340, status: "已发货", time: "2025-07-18 11:42" },
  { id: 4, orderNo: "DD20250718004", customer: "赵敏", amount: 580, status: "已取消", time: "2025-07-18 10:08" },
  { id: 5, orderNo: "DD20250718005", customer: "陈杰", amount: 3120, status: "已完成", time: "2025-07-18 09:30" },
  { id: 6, orderNo: "DD20250717006", customer: "刘洋", amount: 760, status: "待付款", time: "2025-07-17 18:22" },
  { id: 7, orderNo: "DD20250717007", customer: "周婷", amount: 1980, status: "已完成", time: "2025-07-17 16:45" },
  { id: 8, orderNo: "DD20250717008", customer: "吴磊", amount: 450, status: "已发货", time: "2025-07-17 15:10" },
  { id: 9, orderNo: "DD20250717009", customer: "郑爽", amount: 2680, status: "已完成", time: "2025-07-17 14:00" },
  { id: 10, orderNo: "DD20250717010", customer: "孙浩", amount: 920, status: "待发货", time: "2025-07-17 11:35" },
  { id: 11, orderNo: "DD20250716011", customer: "马丽", amount: 1560, status: "已完成", time: "2025-07-16 17:20" },
  { id: 12, orderNo: "DD20250716012", customer: "朱涛", amount: 680, status: "已取消", time: "2025-07-16 13:50" },
]);

const orderPage = ref(1);
const orderPageSize = ref(5);

const pagedOrders = computed(() => {
  const start = (orderPage.value - 1) * orderPageSize.value;
  return orders.value.slice(start, start + orderPageSize.value);
});

const getStatusType = (status: string): "success" | "warning" | "info" | "danger" => {
  const map: Record<string, "success" | "warning" | "info" | "danger"> = {
    已完成: "success",
    待发货: "warning",
    已发货: "info",
    待付款: "warning",
    已取消: "danger",
  };
  return map[status] || "info";
};

const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 600);
};
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 统计卡片 */
.stat-card {
  height: 100%;
  transition: box-shadow var(--transition-base);

  &:hover {
    box-shadow: var(--el-box-shadow) !important;
  }
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-compare {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.primary {
    background: var(--el-color-primary-light-9);
    color: var(--color-primary);
  }

  &.success {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }

  &.warning {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }

  &.danger {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }
}

/* 折线图 */
.chart-box {
  width: 100%;
}

.line-chart {
  width: 100%;
  height: 220px;
  display: block;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 12px 40px 0;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 环形图 */
.donut-wrap {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 8px 0;
}

.donut-chart {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-chart::before {
  content: "";
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--bg-card);
}

.donut-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donut-total {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.donut-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  color: var(--text-secondary);
  min-width: 72px;
}

.legend-value {
  color: var(--text-primary);
  font-weight: 500;
  margin-left: auto;
}

.legend-percent {
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

/* 订单表格 */
.order-amount {
  font-weight: 600;
  color: var(--text-primary);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .donut-wrap {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
