<template>
  <el-card class="step-card" shadow="never">
    <template #header>
      <div class="step-card__title">
        <SvgIcon name="ri:cloud-line" size="18" />
        <span>源端配置 · 飞书多维表</span>
      </div>
    </template>

    <el-form ref="formRef" :model="model" :rules="rules" label-width="120px">
      <el-form-item label="App Token" prop="appToken">
        <el-input v-model="model.appToken" placeholder="飞书多维表的 Token" clearable>
          <template #append>
            <el-tooltip content="如何获取 App Token？" placement="top">
              <SvgIcon name="ri:question-line" size="16" />
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Table ID" prop="tableId">
        <el-input v-model="model.tableId" placeholder="数据表的 ID" clearable />
      </el-form-item>

      <el-form-item label="同步方向" prop="direction">
        <el-radio-group v-model="model.direction">
          <el-radio-button value="feishu-to-db">飞书 → 数据库</el-radio-button>
          <el-radio-button value="db-to-feishu">数据库 → 飞书</el-radio-button>
          <el-radio-button value="bidirectional">双向同步</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="连接测试">
        <el-button type="primary" plain :loading="testing" :disabled="!canTest" @click="handleTest">
          <SvgIcon name="ri:plug-line" size="16" />
          <span>{{ testing ? "测试中..." : "测试连接" }}</span>
        </el-button>

        <el-tag v-if="testStatus === 'success'" type="success" round>
          <SvgIcon name="ri:check-line" size="14" />
          <span>已连接 · {{ latency }}ms</span>
        </el-tag>
        <el-tag v-else-if="testStatus === 'failed'" type="danger" round>
          <SvgIcon name="ri:close-line" size="14" />
          <span>{{ errorMsg || "连接失败" }}</span>
        </el-tag>
        <span v-else class="test-hint">填写 App Token 与 Table ID 后可测试</span>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { testFeishuConnection } from "@/api/sync";

const model = defineModel<{
  appToken: string;
  tableId: string;
  direction: "feishu-to-db" | "db-to-feishu" | "bidirectional";
}>({ required: true });

const formRef = ref<FormInstance>();

const rules: FormRules = {
  appToken: [{ required: true, message: "请输入 App Token", trigger: "blur" }],
  tableId: [{ required: true, message: "请输入 Table ID", trigger: "blur" }],
};

const testing = ref(false);
const testStatus = ref<"idle" | "success" | "failed">("idle");
const latency = ref(0);
const errorMsg = ref("");

const canTest = computed(() => !!model.value.appToken && !!model.value.tableId);

async function handleTest() {
  if (!canTest.value) return;
  testing.value = true;
  testStatus.value = "idle";
  errorMsg.value = "";
  try {
    const { data } = await testFeishuConnection({
      appToken: model.value.appToken,
      tableId: model.value.tableId,
    });
    if (data.success) {
      testStatus.value = "success";
      latency.value = data.latency ?? 0;
      ElMessage.success(data.message);
    } else {
      testStatus.value = "failed";
      errorMsg.value = data.message;
      ElMessage.error(data.message);
    }
  } finally {
    testing.value = false;
  }
}

async function validate(): Promise<boolean> {
  if (!formRef.value) return true;
  try {
    await formRef.value.validate();
    return true;
  } catch {
    return false;
  }
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

.test-hint {
  font-size: 13px;
  color: var(--color-text-placeholder);
}

.el-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
