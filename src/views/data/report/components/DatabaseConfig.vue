<template>
  <el-card class="step-card" shadow="never">
    <template #header>
      <div class="step-card__title">
        <SvgIcon name="ri:database-2-line" size="18" />
        <span>目标配置 · 数据库</span>
      </div>
    </template>

    <el-form ref="formRef" :model="model" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="数据库类型" prop="type">
            <el-select v-model="model.type" @change="handleTypeChange">
              <el-option label="MySQL" value="mysql" />
              <el-option label="PostgreSQL" value="postgresql" />
              <el-option label="SQL Server" value="sqlserver" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="服务器端口" prop="port">
            <el-input-number v-model="model.port" :min="1" :max="65535" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="服务器地址" prop="host">
        <el-input v-model="model.host" placeholder="如：localhost 或 10.0.0.1" clearable />
      </el-form-item>

      <el-form-item label="数据库名" prop="database">
        <el-input v-model="model.database" placeholder="数据库名称" clearable />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="model.username" placeholder="数据库账号" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="密码" prop="password">
            <el-input v-model="model.password" type="password" show-password placeholder="数据库密码" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="数据表" prop="table">
        <el-input v-model="model.table" placeholder="目标表名（如：orders）" clearable />
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
        <span v-else class="test-hint">填写地址、库名、账号后可测试</span>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { testDatabaseConnection } from "@/api/sync";
import type { DatabaseType } from "@/api/sync";

const model = defineModel<{
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  table: string;
}>({ required: true });

const formRef = ref<FormInstance>();

const rules: FormRules = {
  type: [{ required: true, message: "请选择数据库类型", trigger: "change" }],
  host: [{ required: true, message: "请输入服务器地址", trigger: "blur" }],
  database: [{ required: true, message: "请输入数据库名", trigger: "blur" }],
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  table: [{ required: true, message: "请输入目标数据表", trigger: "blur" }],
};

const defaultPorts: Record<DatabaseType, number> = {
  mysql: 3306,
  postgresql: 5432,
  sqlserver: 1433,
};

function handleTypeChange(type: DatabaseType) {
  model.value.port = defaultPorts[type];
}

const testing = ref(false);
const testStatus = ref<"idle" | "success" | "failed">("idle");
const latency = ref(0);
const errorMsg = ref("");

const canTest = computed(
  () => !!model.value.host && !!model.value.database && !!model.value.username,
);

async function handleTest() {
  if (!canTest.value) return;
  testing.value = true;
  testStatus.value = "idle";
  errorMsg.value = "";
  try {
    const { data } = await testDatabaseConnection({ ...model.value });
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
