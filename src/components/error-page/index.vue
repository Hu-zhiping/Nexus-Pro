<template>
  <div class="error-page">
    <div class="error-code">{{ code }}</div>
    <h1 class="error-title">{{ title }}</h1>
    <p class="error-desc">{{ desc }}</p>
    <el-button type="primary" class="error-btn" @click="router.push('/')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

defineProps<{
  code: string | number;
  title: string;
  desc: string;
}>();

const router = useRouter();
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
  background: var(--bg-page);
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-title {
  margin: 24px 0 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.error-desc {
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.error-btn {
  margin-top: 32px;
  min-width: 120px;
}
</style>
