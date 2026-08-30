<template>
  <el-card class="step-card" shadow="never">
    <template #header>
      <div class="step-card__title">
        <SvgIcon name="ri:time-line" size="18" />
        <span>调度配置</span>
      </div>
    </template>

    <el-form label-width="120px">
      <el-form-item label="启用定时">
        <el-switch v-model="model.enabled" />
        <span class="form-hint">{{ model.enabled ? "将按 Cron 表达式自动执行" : "仅保存任务，不自动运行" }}</span>
      </el-form-item>

      <template v-if="model.enabled">
        <el-form-item label="常用预设">
          <el-radio-group v-model="preset" @change="applyPreset">
            <el-radio-button value="hourly">每小时</el-radio-button>
            <el-radio-button value="daily">每日 00:00</el-radio-button>
            <el-radio-button value="daily2">每日 02:00</el-radio-button>
            <el-radio-button value="weekly">每周一</el-radio-button>
            <el-radio-button value="workday">工作日 09:00</el-radio-button>
            <el-radio-button value="custom">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Cron 表达式">
          <el-input v-model="model.cron" placeholder="如：0 0 2 * * ?" class="cron-input" @input="onCronInput">
            <template #append>
              <el-button :loading="parsing" @click="parseCronExpr">
                <SvgIcon name="ri:eye-line" size="16" />
                <span>解析</span>
              </el-button>
            </template>
          </el-input>

          <!-- 解析预览：不要用嵌套 el-form-item（自带 18px 下边距，且非官方用法） -->
          <div v-if="parsed" class="cron-preview">
            <div class="cron-desc">
              <SvgIcon name="ri:calendar-check-line" size="16" />
              <span>{{ parsed.description }}</span>
            </div>
            <div v-if="parsed.nextRuns.length" class="cron-next">
              <span class="cron-next__label">下次执行：</span>
              <span v-for="(time, i) in parsed.nextRuns" :key="i" class="cron-next__item">{{ time }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="失败重试">
          <el-switch v-model="retry" />
          <span class="form-hint">同步失败时自动重试 3 次</span>
        </el-form-item>

        <el-form-item label="超时设置">
          <el-input-number v-model="timeout" :min="1" :max="120" controls-position="right" />
          <span class="form-hint">分钟（超时自动终止）</span>
        </el-form-item>
      </template>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { parseCron } from "@/api/sync";
import type { CronParseResult } from "@/api/sync";

const model = defineModel<{
  enabled: boolean;
  cron: string;
}>({ required: true });

const preset = ref<"hourly" | "daily" | "daily2" | "weekly" | "workday" | "custom">("daily2");
const retry = ref(true);
const timeout = ref(30);

const parsing = ref(false);
const parsed = ref<CronParseResult | null>(null);

const presetMap: Record<string, string> = {
  hourly: "0 0 * * * ?",
  daily: "0 0 0 * * ?",
  daily2: "0 0 2 * * ?",
  weekly: "0 0 0 * * 1",
  workday: "0 0 9 * * 1-5",
};

function applyPreset(value: string | number | boolean | undefined) {
  const key = String(value);
  if (key === "custom") {
    parsed.value = null;
    return;
  }
  const expr = presetMap[key];
  if (expr) {
    model.value.cron = expr;
    parseCronExpr();
  }
}

function onCronInput() {
  preset.value = "custom";
  parsed.value = null;
}

async function parseCronExpr() {
  if (!model.value.cron.trim()) {
    ElMessage.warning("请输入 Cron 表达式");
    return;
  }
  parsing.value = true;
  try {
    const { data } = await parseCron(model.value.cron);
    parsed.value = data;
  } finally {
    parsing.value = false;
  }
}

watch(
  () => model.value.enabled,
  (enabled) => {
    if (enabled && !parsed.value && model.value.cron) {
      parseCronExpr();
    }
  },
  { immediate: true },
);

async function validate(): Promise<boolean> {
  if (!model.value.enabled) return true;
  if (!model.value.cron.trim()) {
    ElMessage.warning("启用定时后，请填写 Cron 表达式");
    return false;
  }
  return true;
}

defineExpose({ validate });
</script>

<style scoped lang="scss">
.step-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border-light);
  }

  :deep(.el-card__body) {
    padding: 24px 20px 8px;
  }
}

.step-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.cron-input {
  max-width: 320px;
}

.cron-preview {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--color-bg-fill);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.cron-desc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.cron-next {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.cron-next__label {
  color: var(--color-text-placeholder);
}

.cron-next__item {
  padding: 2px 8px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 6px;
}
</style>
