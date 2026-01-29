<template>
  <div class="mix-sidebar-container">
    <!-- 第一列：一级菜单 -->
    <div class="mix-sidebar-primary">
      <div class="mix-logo" @click="$router.push('/')">
        <SvgIcon name="ri:hexagon-fill" size="28" class="logo-icon" />
      </div>
      <div class="mix-menu-list">
        <div
          v-for="menu in topMenus"
          :key="menu.path"
          class="mix-menu-item"
          :class="{ active: activeTopMenu === menu.path }"
          @click="handleTopMenuClick(menu)"
        >
          <SvgIcon
            v-if="menu.meta?.icon"
            :name="menu.meta.icon as string"
            size="20"
            class="menu-icon"
          />
          <span class="menu-title">{{ menu.meta?.title }}</span>
        </div>
      </div>
    </div>

    <!-- 第二列：二级菜单 -->
    <div class="mix-sidebar-secondary">
      <div class="submenu-header">
        <span class="submenu-title">{{ activeTopMenuTitle }}</span>
      </div>
      <el-scrollbar class="submenu-content">
        <el-menu
          :default-active="activeSubMenu"
          background-color="transparent"
          text-color="var(--color-sidebar-text)"
          active-text-color="var(--color-sidebar-text-active)"
          router
          class="mix-el-menu"
        >
          <SidebarItem
            v-for="route in subMenus"
            :key="route.path"
            :item="route"
            :base-path="activeTopMenu"
          />
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MixSidebar'
};
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import SvgIcon from '@/components/SvgIcon/index.vue';
import SidebarItem from '../Sidebar/SideBarItem.vue';
import useMenuStore from '@/store/modules/menu';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

// 获取所有可见菜单
const allMenus = computed(() => menuStore.visibleMenus);

// 一级菜单（有子菜单的路由）
const topMenus = computed(() => {
  return allMenus.value.filter(menu => menu.children && menu.children.length > 0);
});

// 当前激活的一级菜单
const activeTopMenu = ref('');
const activeTopMenuTitle = computed(() => {
  const menu = topMenus.value.find(m => m.path === activeTopMenu.value);
  return menu?.meta?.title || '';
});

// 当前激活的二级菜单
const activeSubMenu = computed(() => route.path);

// 二级菜单列表
const subMenus = computed(() => {
  const menu = topMenus.value.find(m => m.path === activeTopMenu.value);
  return menu?.children || [];
});

// 根据当前路由确定激活的一级菜单
const updateActiveTopMenu = () => {
  const matched = route.matched;
  if (matched.length > 0) {
    const topPath = '/' + matched[0].path.split('/')[1];
    if (topMenus.value.some(m => m.path === topPath)) {
      activeTopMenu.value = topPath;
    } else if (topMenus.value.length > 0) {
      activeTopMenu.value = topMenus.value[0].path;
    }
  }
};

// 点击一级菜单
const handleTopMenuClick = (menu: RouteRecordRaw) => {
  activeTopMenu.value = menu.path;
  // 如果有默认子路由，跳转到第一个子路由
  if (menu.children && menu.children.length > 0) {
    const firstChild = menu.children[0];
    if (firstChild.path && !firstChild.meta?.hidden) {
      // 构建完整路径
      const childPath = firstChild.path.startsWith('/') 
        ? firstChild.path 
        : `${menu.path}/${firstChild.path}`;
      router.push(childPath);
    }
  }
};

// 监听路由变化
watch(() => route.path, updateActiveTopMenu, { immediate: true });
watch(topMenus, updateActiveTopMenu, { immediate: true });
</script>

<style lang="scss" scoped>
.mix-sidebar-container {
  display: flex;
  height: 100%;
}

// 第一列：一级菜单
.mix-sidebar-primary {
  width: 80px;
  height: 100%;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.mix-logo {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light, #60a5fa) 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);

  .logo-icon {
    color: #fff;
  }
}

.mix-menu-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0 8px;
}

.mix-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  color: #94a3b8;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  &.active {
    background: rgba(59, 130, 246, 0.15);
    color: var(--color-primary);
  }

  .menu-icon {
    flex-shrink: 0;
  }

  .menu-title {
    font-size: 11px;
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 第二列：二级菜单
.mix-sidebar-secondary {
  width: 180px;
  height: 100%;
  background: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-sidebar-border);
  display: flex;
  flex-direction: column;
}

.submenu-header {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--color-sidebar-border);
  background: var(--color-sidebar-bg);
}

.submenu-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.submenu-content {
  flex: 1;
  overflow: hidden;
  padding: 12px 0;
}

.mix-el-menu {
  border-right: none;
  background: transparent;
  padding: 0 12px;
}
</style>
