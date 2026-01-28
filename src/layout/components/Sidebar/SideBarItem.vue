<template>
  <!-- 有子菜单的情况 -->
  <el-sub-menu v-if="hasChildren" :index="resolvePath(item.path as string)" popper-class="sidebar-submenu">
    <template #title>
      <div class="menu-item-content">
        <SvgIcon v-if="item.meta?.icon" :name="item.meta.icon as string" class="menu-icon" size="18" />
        <span class="menu-title" v-if="!appStore.isCollapse">{{ (item.meta?.title as string) || (item.name as string)
        }}</span>
      </div>
    </template>

    <!-- 递归渲染子菜单 -->
    <SidebarItem v-for="child in item.children" :key="child.path" :item="child"
      :base-path="resolvePath(item.path as string)" />
  </el-sub-menu>

  <!-- 无子菜单的情况 -->
  <el-menu-item v-else :index="resolvePath(item.path as string)" :disabled="item.meta?.disabled as boolean | undefined">
    <div class="menu-item-content">
      <SvgIcon v-if="item.meta?.icon" :name="item.meta.icon as string" class="menu-icon" size="18" />
      <span class="menu-title">{{ (item.meta?.title as string) || (item.name as string) }}</span>
    </div>
  </el-menu-item>
</template>

<script lang="ts">
// 使用传统 script 块定义组件名，确保递归调用正常工作
export default {
  name: 'SidebarItem'
};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import SvgIcon from '@/components/SvgIcon/index.vue';
import useAppStore from '@/store/modules/app';

const appStore = useAppStore();

const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },
  basePath: {
    type: String,
    default: '',
  },
});

// 判断是否有子菜单
const hasChildren = computed(() => {
  const children = props.item.children;
  if (!children || children.length === 0) return false;

  // 过滤掉隐藏的子菜单
  const visibleChildren = children.filter(child => !child.meta?.hidden);
  return visibleChildren.length > 0;
});

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

<style lang="scss" scoped>
.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 4px;
}

.menu-icon {
  margin-right: 10px;
  flex-shrink: 0;
  opacity: 0.8;
  transition: all 0.3s;
}

.menu-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 子菜单样式
:deep(.sidebar-submenu) {
  .el-menu {
    background: transparent !important;
  }

  .el-menu-item,
  .el-sub-menu__title {
    height: 40px;
    line-height: 40px;
    color: #64748b;
    border-radius: 6px;
    margin: 2px 0;

    &:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #fff !important;
    }

    &.is-active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%) !important;
      color: #fff !important;
    }
  }
}
</style>
