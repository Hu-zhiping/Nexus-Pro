<template>
  <el-breadcrumb separator="/" class="breadcrumb-container">
    <el-breadcrumb-item 
      v-for="(item, index) in breadcrumbs" 
      :key="item.path"
    >
      <span 
        v-if="index === breadcrumbs.length - 1 || !item.redirect"
        class="breadcrumb-text is-current"
      >
        {{ item.meta?.title || item.name }}
      </span>
      <a 
        v-else 
        class="breadcrumb-link"
        @click.prevent="handleLink(item)"
      >
        {{ item.meta?.title || item.name }}
      </a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteRecordRaw, RouteLocationMatched } from 'vue-router';

const route = useRoute();
const router = useRouter();
const breadcrumbs = ref<RouteLocationMatched[]>([]);

// 获取面包屑
const getBreadcrumbs = () => {
  let matched = route.matched.filter(item => item.meta?.title);
  
  // 如果没有匹配到任何面包屑，至少显示首页
  if (matched.length === 0 && route.path !== '/') {
    const homeRoute = {
      path: '/',
      meta: { title: '首页' },
    } as unknown as RouteLocationMatched;
    matched = [homeRoute, ...matched];
  }
  
  breadcrumbs.value = matched;
};

// 处理链接点击
const handleLink = (item: RouteRecordRaw) => {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect as string);
  } else {
    router.push(path);
  }
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    getBreadcrumbs();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: flex;
      align-items: center;
    }
  }
}

.breadcrumb-text {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;

  &.is-current {
    color: var(--color-text-primary);
  }
}

.breadcrumb-link {
  color: var(--color-text-secondary);
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }
}
</style>
