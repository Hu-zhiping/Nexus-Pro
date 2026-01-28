<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据分析概览</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :span="8" v-for="item in analysisData" :key="item.title">
              <div class="analysis-item">
                <div class="analysis-title">{{ item.title }}</div>
                <div class="analysis-value">{{ item.value }}</div>
                <div class="analysis-trend" :class="item.trend > 0 ? 'up' : 'down'">
                  <SvgIcon :name="item.trend > 0 ? 'ri:arrow-up-line' : 'ri:arrow-down-line'" size="14" />
                  <span>{{ Math.abs(item.trend) }}%</span>
                  <span class="compare">较上期</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>转化率分析</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:bar-chart-2-line" size="64" color="#e0e0e0" />
            <p>转化率分析图表区域</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>留存率分析</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:area-chart-line" size="64" color="#e0e0e0" />
            <p>留存率分析图表区域</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

const timeRange = ref('month');

const analysisData = [
  { title: '总转化率', value: '12.5%', trend: 2.3 },
  { title: '平均停留时长', value: '8分32秒', trend: -1.2 },
  { title: '跳出率', value: '34.2%', trend: -5.6 },
];
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-item {
  padding: 24px;
  text-align: center;
  border-right: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-right: none;
  }

  .analysis-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
  }

  .analysis-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }

  .analysis-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 13px;

    &.up {
      color: var(--el-color-success);
    }

    &.down {
      color: var(--el-color-danger);
    }

    .compare {
      color: var(--el-text-color-secondary);
      margin-left: 4px;
    }
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
