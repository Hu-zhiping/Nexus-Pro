<template>
  <template v-for="route in visibleChildren" :key="route.path">
    <!-- 单级菜单 -->
    <el-menu-item
      v-if="!hasChildren(route)"
      :index="resolvePath(route.path)"
    >
        <SvgIcon 
          v-if="route.meta?.icon" 
          :name="route.meta.icon as string" 
          class="menu-icon"
          size="16"
        />
        <span>{{ (route.meta?.title as string) || (route.name as string) }}</span>
    </el-menu-item>

    <!-- 多级菜单 -->
    <el-sub-menu v-else :index="resolvePath(route.path)">
      <template #title>
        <SvgIcon 
          v-if="route.meta?.icon" 
          :name="route.meta.icon as string" 
          class="menu-icon"
          size="16"
        />
        <span>{{ (route.meta?.title as string) || (route.name as string) }}</span>
      </template>
      <TopMenuItem :children="route.children || []" :base-path="resolvePath(route.path)" />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import SvgIcon from '@/components/SvgIcon/index.vue';

const props = defineProps({
  children: {
    type: Array as PropType<RouteRecordRaw[]>,
    required: true,
  },
  basePath: {
    type: String,
    required: true,
  },
});

// 过滤掉隐藏的菜单
const visibleChildren = computed(() => {
  return props.children.filter(route => !route.meta?.hidden);
});

// 判断是否有可见的子菜单
const hasChildren = (route: RouteRecordRaw) => {
  if (!route.children || route.children.length === 0) return false;
  return route.children.some(child => !child.meta?.hidden);
};

// 解析路径
const resolvePath = (routePath: string) => {
  if (routePath.startsWith('/')) {
    return routePath;
  }
  if (props.basePath.endsWith('/')) {
    return `${props.basePath}${routePath}`;
  }
  return `${props.basePath}/${routePath}`;
};
</script>

<script lang="ts">
import { computed } from 'vue';
export default {
  name: 'TopMenuItem',
};
</script>

<style scoped>
.menu-icon {
  margin-right: 6px;
}
</style>
