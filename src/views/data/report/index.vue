<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statCards" :key="item.title">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
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

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>访问趋势</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:line-chart-line" size="64" color="#e0e0e0" />
            <p>访问趋势图表区域</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>用户分布</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:pie-chart-line" size="64" color="#e0e0e0" />
            <p>用户分布图表区域</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue';

const statCards = [
  { title: '总访问量', value: '123,456', icon: 'ri:eye-line', color: '#3b82f6' },
  { title: '用户数', value: '8,234', icon: 'ri:user-line', color: '#10b981' },
  { title: '订单数', value: '3,456', icon: 'ri:shopping-cart-line', color: '#f59e0b' },
  { title: '收入', value: '¥89,234', icon: 'ri:money-cny-circle-line', color: '#ef4444' },
];
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.stat-card {
  margin-bottom: 20px;

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
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
    color: var(--el-text-color-primary);
    line-height: 1;
    margin-bottom: 8px;
  }

  .stat-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.chart-row {
  margin-top: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: 8px;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}
</style>
