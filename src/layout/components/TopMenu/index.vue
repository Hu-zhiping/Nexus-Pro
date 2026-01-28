<template>
  <div class="top-menu-container">
    <el-menu
      :default-active="activeMenu"
      mode="horizontal"
      background-color="transparent"
      text-color="#bfcbd9"
      active-text-color="#fff"
      router
      class="top-menu"
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <!-- 单级菜单 -->
        <el-menu-item
          v-if="!hasChildren(route)"
          :index="route.path"
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
        <el-sub-menu v-else :index="route.path" popper-class="top-submenu">
          <template #title>
          <SvgIcon 
            v-if="route.meta?.icon" 
            :name="route.meta.icon as string" 
            class="menu-icon"
            size="16"
          />
          <span>{{ (route.meta?.title as string) || (route.name as string) }}</span>
          </template>
          <TopMenuItem :children="route.children || []" :base-path="route.path" />
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import SvgIcon from '@/components/SvgIcon/index.vue';
import TopMenuItem from './TopMenuItem.vue';
import useMenuStore from '@/store/modules/menu';

const route = useRoute();
const menuStore = useMenuStore();

const menuRoutes = computed(() => menuStore.visibleMenus);
const activeMenu = computed(() => route.path);

// 判断是否有可见的子菜单
const hasChildren = (route: RouteRecordRaw) => {
  if (!route.children || route.children.length === 0) return false;
  return route.children.some(child => !child.meta?.hidden);
};
</script>

<style lang="scss" scoped>
.top-menu-container {
  flex: 1;
  overflow: hidden;
}

.top-menu {
  border-bottom: none;

  :deep(.el-menu-item), :deep(.el-sub-menu__title) {
    height: 64px;
    line-height: 64px;
    font-size: 14px;
    padding: 0 20px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }

    &.is-active {
      background-color: var(--color-primary) !important;
    }
  }

  :deep(.el-sub-menu) {
    &.is-active {
      .el-sub-menu__title {
        border-bottom: none;
      }
    }
  }

  .menu-icon {
    margin-right: 6px;
  }
}
</style>

<style>
.top-submenu {
  .el-menu {
    background-color: #001529 !important;
    border: none;
    min-width: 160px;
  }

  .el-menu-item {
    height: 40px;
    line-height: 40px;
    color: #bfcbd9 !important;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }

    &.is-active {
      color: #fff !important;
      background-color: var(--color-primary) !important;
    }
  }
}
</style>
