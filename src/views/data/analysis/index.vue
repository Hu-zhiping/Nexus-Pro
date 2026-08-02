<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">数据分析</h2>
        <p class="page-desc">核心业务指标与趋势分析</p>
      </div>
      <div class="page-actions">
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="year">本年</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-card shadow="never" class="mb-4">
      <el-row :gutter="20">
        <el-col v-for="item in analysisData" :key="item.title" :span="8">
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

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">转化率分析</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:bar-chart-2-line" size="48" />
            <p>转化率分析图表区域</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">留存率分析</span>
          </template>
          <div class="chart-placeholder">
            <SvgIcon name="ri:area-chart-line" size="48" />
            <p>留存率分析图表区域</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SvgIcon from "@/components/svg-icon/index.vue";

const timeRange = ref("month");

const analysisData = [
  { title: "总转化率", value: "12.5%", trend: 2.3 },
  { title: "平均停留时长", value: "8分32秒", trend: -1.2 },
  { title: "跳出率", value: "34.2%", trend: -5.6 },
];
</script>

<style scoped lang="scss">
.analysis-item {
  padding: 24px;
  text-align: center;
  border-right: 1px solid var(--border-lighter);

  &:last-child {
    border-right: none;
  }

  .analysis-title {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .analysis-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
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
      color: var(--text-secondary);
      margin-left: 4px;
    }
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
