<template>
  <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
    <el-breadcrumb-item v-for="(item, index) in crumbs" :key="index">
      <span class="breadcrumb-title">
        {{ item.title }}
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";

interface Crumb {
  title: string;
  icon?: string;
}

const route = useRoute();

const crumbs = computed<Crumb[]>(() =>
  route.matched
    .filter((record) => record.meta?.title && record.meta?.breadcrumb !== false && !record.meta?.hidden)
    .map((record) => ({
      title: record.meta.title as string,
      icon: record.meta.icon as string | undefined,
    })),
);
</script>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 240px;
  white-space: nowrap;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  cursor: default;
  transition: color var(--transition-fast);
}

.breadcrumb-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb :deep(.el-breadcrumb__separator) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-lg);
}

.breadcrumb :deep(.el-breadcrumb__separator .el-icon) {
  width: 12px;
  height: 12px;
  font-size: var(--font-size-xs);
}

.breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: var(--color-text-primary);
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 960px) {
  .breadcrumb {
    display: none;
  }
}
</style>
