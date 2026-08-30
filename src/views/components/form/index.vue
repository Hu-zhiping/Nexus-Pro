<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">表单组件</h2>
        <p class="page-desc">常用表单组件示例，展示基础与高级表单用法</p>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">基础表单</span>
          </template>

          <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="80px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="basicForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="basicForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="basicForm.gender">
                <el-radio value="male">男</el-radio>
                <el-radio value="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="爱好">
              <el-checkbox-group v-model="basicForm.hobbies">
                <el-checkbox value="reading">阅读</el-checkbox>
                <el-checkbox value="gaming">游戏</el-checkbox>
                <el-checkbox value="sports">运动</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="简介">
              <el-input v-model="basicForm.intro" type="textarea" :rows="3" placeholder="请输入个人简介" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBasicSubmit">提交</el-button>
              <el-button @click="handleBasicReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">高级表单</span>
          </template>

          <el-form ref="advancedFormRef" :model="advancedForm" :rules="advancedRules" label-width="100px">
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="advancedForm.name" placeholder="请输入活动名称">
                <template #prefix>
                  <SvgIcon name="ri:calendar-event-line" size="16" />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="活动区域" prop="region">
              <el-select v-model="advancedForm.region" placeholder="请选择活动区域" style="width: 100%">
                <el-option label="区域一" value="shanghai" />
                <el-option label="区域二" value="beijing" />
                <el-option label="区域三" value="guangzhou" />
              </el-select>
            </el-form-item>
            <el-form-item label="活动时间" prop="date">
              <el-date-picker
                v-model="advancedForm.date"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="即时配送">
              <el-switch v-model="advancedForm.delivery" />
            </el-form-item>
            <el-form-item label="活动性质" prop="type">
              <el-checkbox-group v-model="advancedForm.type">
                <el-checkbox value="online">线上活动</el-checkbox>
                <el-checkbox value="offline">线下活动</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="资源" prop="resource">
              <el-radio-group v-model="advancedForm.resource">
                <el-radio value="sponsor">赞助</el-radio>
                <el-radio value="venue">场地</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="活动评分">
              <el-rate v-model="advancedForm.rate" show-score />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="advancedForm.color" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAdvancedSubmit">提交</el-button>
              <el-button @click="handleAdvancedReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import SvgIcon from "@/components/SvgIcon/index.vue";

const basicFormRef = ref<FormInstance>();
const advancedFormRef = ref<FormInstance>();

const basicForm = reactive({
  username: "",
  email: "",
  gender: "male",
  hobbies: [] as string[],
  intro: "",
});

const basicRules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
};

const advancedForm = reactive({
  name: "",
  region: "",
  date: [] as string[],
  delivery: false,
  type: [] as string[],
  resource: "",
  rate: 0,
  color: "#5d87ff",
});

const advancedRules: FormRules = {
  name: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
  region: [{ required: true, message: "请选择活动区域", trigger: "change" }],
  date: [{ required: true, message: "请选择活动时间", trigger: "change" }],
  type: [{ type: "array", required: true, message: "请至少选择一种活动性质", trigger: "change" }],
  resource: [{ required: true, message: "请选择资源", trigger: "change" }],
};

const handleBasicSubmit = () => {
  basicFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success("基础表单提交成功");
    }
  });
};

const handleBasicReset = () => {
  basicFormRef.value?.resetFields();
};

const handleAdvancedSubmit = () => {
  advancedFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success("高级表单提交成功");
    }
  });
};

const handleAdvancedReset = () => {
  advancedFormRef.value?.resetFields();
};
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--layout-content-gap);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.page-desc {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.page-container :deep(.el-card) {
  border-radius: var(--radius-lg);
}
</style>
