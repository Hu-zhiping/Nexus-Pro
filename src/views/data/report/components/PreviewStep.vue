<template>
  <el-card class="step-card" shadow="never">
    <template #header>
      <div class="step-card__title">
        <SvgIcon name="ri:file-check-line" size="18" />
        <span>预览确认</span>
      </div>
    </template>

    <el-alert type="info" :closable="false" show-icon class="preview-alert">
      <template #title>请核对以下配置，确认无误后点击「保存」或「立即执行」</template>
    </el-alert>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="任务名称">
        <span class="preview-value">{{ form.name || "—" }}</span>
      </el-descriptions-item>

      <el-descriptions-item label="同步方向">
        <el-tag :type="directionTagType" size="small">{{ directionLabel }}</el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="任务描述" :span="2">
        <span class="preview-value">{{ form.description || "—" }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <h4 class="preview-section-title">
      <SvgIcon name="ri:cloud-line" size="16" />
      <span>飞书多维表</span>
    </h4>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="App Token">{{ form.feishu.appToken || "—" }}</el-descriptions-item>
      <el-descriptions-item label="Table ID">{{ form.feishu.tableId || "—" }}</el-descriptions-item>
    </el-descriptions>

    <h4 class="preview-section-title">
      <SvgIcon name="ri:database-2-line" size="16" />
      <span>数据库</span>
    </h4>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="类型">{{ form.database.type.toUpperCase() }}</el-descriptions-item>
      <el-descriptions-item label="服务器">{{ form.database.host }}:{{ form.database.port }}</el-descriptions-item>
      <el-descriptions-item label="数据库">{{ form.database.database }}</el-descriptions-item>
      <el-descriptions-item label="数据表">{{ form.database.table || "—" }}</el-descriptions-item>
    </el-descriptions>

    <h4 class="preview-section-title">
      <SvgIcon name="ri:swap-box-line" size="16" />
      <span>字段映射（{{ enabledFieldCount }}/{{ form.fields.length }}）</span>
    </h4>
    <el-table :data="enabledFields" border size="small" empty-text="无已启用的字段映射">
      <el-table-column label="飞书字段" prop="source" min-width="140" />
      <el-table-column label="飞书类型" prop="sourceType" width="120" />
      <el-table-column label="数据库字段" prop="target" min-width="140" />
      <el-table-column label="数据库类型" prop="targetType" width="140" />
      <el-table-column label="必填" width="60" align="center">
        <template #default="{ row }">
          <SvgIcon v-if="row.required" name="ri:check-line" size="14" />
        </template>
      </el-table-column>
    </el-table>

    <h4 class="preview-section-title">
      <SvgIcon name="ri:time-line" size="16" />
      <span>调度</span>
    </h4>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="启用定时">
        <el-tag :type="form.schedule.enabled ? 'success' : 'info'" size="small">
          {{ form.schedule.enabled ? "已启用" : "未启用" }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="Cron 表达式">
        <code v-if="form.schedule.enabled">{{ form.schedule.cron }}</code>
        <span v-else class="preview-value">—</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

import SvgIcon from "@/components/SvgIcon/index.vue";
import type { TaskForm } from "@/api/sync";

const props = defineProps<{ form: TaskForm }>();

const directionLabel = computed(() => {
  switch (props.form.feishu.direction) {
    case "feishu-to-db":
      return "飞书 → 数据库";
    case "db-to-feishu":
      return "数据库 → 飞书";
    case "bidirectional":
      return "双向同步";
    default:
      return "—";
  }
});

const directionTagType = computed(() => {
  switch (props.form.feishu.direction) {
    case "bidirectional":
      return "warning";
    case "feishu-to-db":
      return "primary";
    default:
      return "success";
  }
});

const enabledFields = computed(() => props.form.fields.filter((f) => f.enabled));
const enabledFieldCount = computed(() => enabledFields.value.length);
</script>

<style scoped lang="scss">
.step-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border-light);
  }

  :deep(.el-card__body) {
    padding: 20px;
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

.preview-alert {
  margin-bottom: 20px;
}

.preview-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 24px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-value {
  color: var(--color-text-secondary);
}

code {
  padding: 2px 8px;
  background: var(--color-bg-fill);
  border-radius: 6px;
  font-family: "JetBrains Mono", "Consolas", monospace;
  font-size: 13px;
  color: var(--color-primary);
}
</style>
