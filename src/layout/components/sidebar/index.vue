<template>
  <aside
class="sidebar" :class="{
    'is-collapse': appStore.isCollapse && !appStore.isMobile,
    'is-drawer': appStore.isMobile,
  }">
    <!-- Logo -->
    <Logo :collapse="appStore.isCollapse && !appStore.isMobile" />

    <!-- Menu -->
    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
class="sidebar-menu" :collapse="appStore.isCollapse && !appStore.isMobile" :default-active="activeMenu"
        :collapse-transition="false" unique-opened @select="handleSelect">
        <SidebarItem v-for="menu in menus" :key="menu.path" :item="menu" />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import useAppStore from "@/store/modules/app";
import useMenuStore from "@/store/modules/menu";

import Logo from "./Logo.vue";
import SidebarItem from "./SidebarItem.vue";

/* =========================================================
 * Store
 * ========================================================= */

const route = useRoute();
const router = useRouter();

const appStore = useAppStore();
const menuStore = useMenuStore();

/* =========================================================
 * Menu
 * ========================================================= */

const menus = computed(() => menuStore.sidebarMenus);

const activeMenu = computed(() => (route.meta.activeMenu as string) || route.path);

/* =========================================================
 * Navigation
 * ========================================================= */

function handleSelect(index: string) {
  if (index !== route.path) {
    router.push(index);
  }

  if (appStore.isMobile) {
    appStore.closeMobileSidebar();
  }
}
</script>

<style scoped lang="scss">
/* =========================================================
 * Sidebar
 * ========================================================= */

.sidebar {
  position: relative;

  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  width: var(--layout-sidebar-width);
  height: 100vh;

  overflow: hidden;

  background: var(--color-sidebar-bg);

  color: var(--color-sidebar-text);

  border-right: 1px solid var(--color-sidebar-border);

  transition:
    width var(--transition-slow),
    flex-basis var(--transition-slow),
    background-color var(--transition-base),
    border-color var(--transition-base);

  /* -------------------------------------------------------
   * Collapse
   * ------------------------------------------------------- */

  &.is-collapse {
    /* 组件是 flex 子项，仅改 width 会被 flex-basis 压制，需一并收缩 */
    flex-basis: var(--layout-sidebar-collapse-width);

    width: var(--layout-sidebar-collapse-width);
  }

  /* -------------------------------------------------------
   * Mobile Drawer
   * ------------------------------------------------------- */

  &.is-drawer {
    position: fixed;

    top: 0;
    left: 0;
    bottom: 0;

    z-index: 2001;

    width: var(--layout-sidebar-width);

    box-shadow: var(--shadow-lg);
  }
}

/* =========================================================
 * Scrollbar
 * ========================================================= */

.sidebar-scrollbar {
  flex: 1;

  min-height: 0;

  overflow: hidden;
}

/* =========================================================
 * Menu
 * ========================================================= */

.sidebar-menu {
  width: 100%;

  border-right: none;

  background: transparent;

  /* 宽度/内边距与侧栏收缩动画同速，避免折叠时菜单先于容器跳位 */
  transition:
    width var(--transition-slow),
    padding var(--transition-slow);

  /* Element Plus Menu Token */

  --el-menu-bg-color: transparent;

  --el-menu-text-color: var(--color-sidebar-text);

  --el-menu-hover-bg-color: var(--color-sidebar-hover);

  --el-menu-active-color: var(--color-sidebar-text-active);

  --el-menu-item-height: var(--component-menu-height);

  --el-menu-sub-item-height: var(--component-menu-height);
}

/* =========================================================
 * Menu Container
 * ========================================================= */

.sidebar-menu:not(.el-menu--collapse) {
  padding: var(--space-2) var(--space-3) var(--space-4);
}

/* =========================================================
 * Menu Item
 * ========================================================= */

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  position: relative;

  display: flex;
  align-items: center;

  height: var(--component-menu-height);

  line-height: var(--component-menu-height);

  margin-bottom: var(--space-1);

  padding: 0 var(--space-3);

  border-radius: var(--radius-md);

  color: var(--color-sidebar-text);

  font-size: var(--font-size-base);

  font-weight: var(--font-weight-medium);

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

/* =========================================================
 * Hover
 * ========================================================= */

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: var(--color-sidebar-hover);

  color: var(--color-sidebar-text-active);
}

/* =========================================================
 * Active
 * ========================================================= */

:deep(.el-menu-item.is-active) {
  background: var(--color-sidebar-active-bg);

  color: var(--color-sidebar-text-active);

  font-weight: var(--font-weight-semibold);
}

/* =========================================================
 * Active Indicator
 * ========================================================= */

:deep(.el-menu-item.is-active)::before {
  content: "";

  position: absolute;

  left: 0;

  top: 50%;

  width: 3px;

  height: 18px;

  transform: translateY(-50%);

  border-radius: 0 var(--radius-round) var(--radius-round) 0;

  background: var(--color-primary);
}

/* =========================================================
 * Sub Menu
 * ========================================================= */

:deep(.el-sub-menu) {
  margin-bottom: var(--space-1);
}

:deep(.el-sub-menu .el-menu) {
  background: transparent;
}

/* =========================================================
 * Sub Menu Item
 * ========================================================= */

:deep(.el-menu .el-menu--inline .el-menu-item) {
  padding-left: 52px !important;

  font-size: var(--font-size-sm);
}

/* =========================================================
 * Icon
 * ========================================================= */

:deep(.el-menu-item .svg-icon-container),
:deep(.el-sub-menu__title .svg-icon-container) {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;

  margin-right: var(--space-3);

  font-size: 18px;

  flex-shrink: 0;

  color: currentColor;
}

/* =========================================================
 * Element Plus Default Icon
 * ========================================================= */

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  width: 18px;
  height: 18px;

  margin-right: var(--space-3);

  font-size: 18px;

  flex-shrink: 0;
}

/* =========================================================
 * Collapse Menu
 * ========================================================= */

.sidebar-menu.el-menu--collapse {
  width: var(--layout-sidebar-collapse-width);
}

/* ---------------------------------------------------------
 * Collapse Icon
 * --------------------------------------------------------- */

.sidebar-menu.el-menu--collapse {

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    justify-content: center;

    padding: 0;
  }

  /* EP 折叠态把叶子项内容包进绝对定位的 .el-tooltip__trigger（自带 20px 内边距），
     不重置会导致叶子菜单图标与子菜单图标错位 3px */
  :deep(.el-menu-item .el-tooltip__trigger) {
    position: static;

    display: flex;

    align-items: center;
    justify-content: center;

    width: auto;

    padding: 0;
  }

  :deep(.el-menu-item .svg-icon-container),
  :deep(.el-sub-menu__title .svg-icon-container) {
    margin-right: 0;
  }

  :deep(.el-menu-item .el-icon),
  :deep(.el-sub-menu__title .el-icon) {
    margin-right: 0;
  }

  /* 折叠状态隐藏 Active 左侧指示条 */

  :deep(.el-menu-item.is-active)::before {
    display: none;
  }
}

/* =========================================================
 * Popup Menu
 * ========================================================= */

:global(.el-menu--popup) {
  min-width: 180px;

  padding: var(--space-2);

  border: 1px solid var(--color-border);

  border-radius: var(--radius-lg);

  background: var(--color-bg-card);

  box-shadow: var(--shadow-md);

  --el-menu-bg-color: var(--color-bg-card);

  --el-menu-text-color: var(--color-text-primary);

  --el-menu-hover-bg-color: var(--color-bg-hover);

  --el-menu-active-color: var(--color-primary);
}

/* Popup Menu Item */

:global(.el-menu--popup .el-menu-item),
:global(.el-menu--popup .el-sub-menu__title) {
  height: var(--component-menu-height);

  line-height: var(--component-menu-height);

  margin-bottom: var(--space-1);

  border-radius: var(--radius-md);
}

/* Popup Icon */

:global(.el-menu--popup .svg-icon-container),
:global(.el-menu--popup .el-icon) {
  width: 18px;
  height: 18px;

  margin-right: var(--space-3);

  font-size: 18px;
}

/* =========================================================
 * Scrollbar
 * ========================================================= */

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-scrollbar__bar.is-vertical) {
  right: 2px;
}

:deep(.el-scrollbar__thumb) {
  background: var(--color-sidebar-scrollbar);

  opacity: 0.5;
}
</style>
