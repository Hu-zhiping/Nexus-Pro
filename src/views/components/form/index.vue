<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>基础表单</span>
          </template>

          <el-form :model="basicForm" label-width="80px">
            <el-form-item label="用户名">
              <el-input v-model="basicForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="basicForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="basicForm.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="爱好">
              <el-checkbox-group v-model="basicForm.hobbies">
                <el-checkbox label="reading">阅读</el-checkbox>
                <el-checkbox label="gaming">游戏</el-checkbox>
                <el-checkbox label="sports">运动</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="简介">
              <el-input
                v-model="basicForm.intro"
                type="textarea"
                :rows="3"
                placeholder="请输入个人简介"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">提交</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>高级表单</span>
          </template>

          <el-form :model="advancedForm" label-width="100px">
            <el-form-item label="活动名称">
              <el-input v-model="advancedForm.name" placeholder="请输入活动名称">
                <template #prefix>
                  <SvgIcon name="ri:calendar-event-line" size="16" />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="活动区域">
              <el-select v-model="advancedForm.region" placeholder="请选择活动区域" style="width: 100%">
                <el-option label="区域一" value="shanghai" />
                <el-option label="区域二" value="beijing" />
                <el-option label="区域三" value="guangzhou" />
              </el-select>
            </el-form-item>
            <el-form-item label="活动时间">
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
            <el-form-item label="活动性质">
              <el-checkbox-group v-model="advancedForm.type">
                <el-checkbox label="online">线上活动</el-checkbox>
                <el-checkbox label="offline">线下活动</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="资源">
              <el-radio-group v-model="advancedForm.resource">
                <el-radio label="sponsor">赞助</el-radio>
                <el-radio label="venue">场地</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="活动评分">
              <el-rate v-model="advancedForm.rate" show-score />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="advancedForm.color" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import SvgIcon from '@/components/SvgIcon/index.vue';

// 基础表单
const basicForm = reactive({
  username: '',
  email: '',
  gender: 'male',
  hobbies: [],
  intro: '',
});

// 高级表单
const advancedForm = reactive({
  name: '',
  region: '',
  date: [],
  delivery: false,
  type: [],
  resource: '',
  rate: 0,
  color: '#409EFF',
});

const handleSubmit = () => {
  ElMessage.success('提交成功');
};

const handleReset = () => {
  basicForm.username = '';
  basicForm.email = '';
  basicForm.gender = 'male';
  basicForm.hobbies = [];
  basicForm.intro = '';
};
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}
</style>
