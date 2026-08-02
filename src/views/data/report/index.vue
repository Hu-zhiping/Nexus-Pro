<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">数据报表</h2>
        <p class="page-desc">业务数据统计与可视化报表</p>
      </div>
    </div>

    <el-row :gutter="16" class="mb-4">
      <el-col v-for="item in statCards" :key="item.title" :span="6">
        <el-card class="stat-card" shadow="never" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <SvgIcon :name="item.icon" size="24" color="#fff" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">访问趋势</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:line-chart-line" size="48" />
            <p>访问趋势图表区域</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">用户分布</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:pie-chart-line" size="48" />
            <p>用户分布图表区域</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from "@/components/svg-icon/index.vue";

const statCards = [
  { title: "总访问量", value: "123,456", icon: "ri:eye-line", color: "var(--el-color-primary)" },
  { title: "用户数", value: "8,234", icon: "ri:user-line", color: "var(--el-color-success)" },
  { title: "订单数", value: "3,456", icon: "ri:shopping-cart-line", color: "var(--el-color-warning)" },
  { title: "收入", value: "¥89,234", icon: "ri:money-cny-circle-line", color: "var(--el-color-danger)" },
];
</script>

<style scoped lang="scss">
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    flex: 1;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 8px;
  }

  .stat-title {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--fill-light);
  border-radius: var(--radius-sm);

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}
</style>
