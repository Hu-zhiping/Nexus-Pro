<template>
  <el-card class="step-card" shadow="never">
    <template #header>
      <div class="step-card__title">
        <SvgIcon name="ri:information-line" size="18" />
        <span>基础信息</span>
      </div>
    </template>

    <el-form ref="formRef" :model="model" :rules="rules" label-width="100px">
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="model.name" placeholder="如：飞书订单同步到 MySQL" maxlength="40" show-word-limit />
      </el-form-item>

      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="model.description"
          type="textarea"
          :rows="3"
          placeholder="可选，简要描述本任务的用途、数据范围或注意事项"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="任务标签">
        <el-select v-model="tags" multiple filterable allow-create default-first-option placeholder="回车添加标签" style="width: 100%">
          <el-option label="生产环境" value="prod" />
          <el-option label="测试环境" value="test" />
          <el-option label="每小时" value="hourly" />
          <el-option label="每日" value="daily" />
        </el-select>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";

const model = defineModel<{
  name: string;
  description: string;
}>({ required: true });

const tags = ref<string[]>([]);

const formRef = ref<FormInstance>();

const rules: FormRules = {
  name: [
    { required: true, message: "请输入任务名称", trigger: "blur" },
    { min: 2, max: 40, message: "长度在 2-40 个字符", trigger: "blur" },
  ],
};

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
</style>
