<template>
  <div class="layout-sidebar" :class="{ 'sidebar-light': sidebarTheme === 'light' }">
    <!-- Logo 区域 -->
    <div class="sidebar-header">
      <div class="logo-box">
        <SvgIcon name="ri:hexagon-fill" size="20" />
      </div>
      <Transition name="fade">
        <span v-if="!isCollapse" class="logo-text">Nexus Pro</span>
      </Transition>
    </div>

    <!-- 菜单 -->
    <el-scrollbar class="sidebar-body">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        unique-opened
        router
        class="side-menu"
      >
        <SidebarItem v-for="route in menuRoutes" :key="route.path" :item="route" />
      </el-menu>
    </el-scrollbar>

    <!-- 折叠按钮 -->
    <div class="sidebar-footer" @click="appStore.toggleSidebar()">
      <SvgIcon :name="isCollapse ? 'ri:menu-unfold-line' : 'ri:menu-fold-line'" size="16" />
      <Transition name="fade">
        <span v-if="!isCollapse" class="footer-text">收起菜单</span>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import SidebarItem from "./SidebarItem.vue";
import SvgIcon from "@/components/svg-icon/index.vue";
import useAppStore from "@/store/modules/app";
import useMenuStore from "@/store/modules/menu";

const route = useRoute();
const appStore = useAppStore();
const menuStore = useMenuStore();

const isCollapse = computed(() => appStore.isCollapse);
const sidebarTheme = computed(() => appStore.layoutSettings.sidebarTheme);
const menuRoutes = computed(() => menuStore.sidebarMenus);

const activeMenu = computed(() => {
  const { meta, path } = route;
  return (meta?.activeMenu as string) || path;
});
</script>

<style scoped>
.layout-sidebar {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--menu-bg);
}

/* ===== Logo 区域 ===== */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--header-height);
  padding: 0 16px;
  flex-shrink: 0;
}

.logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--menu-text-active);
  white-space: nowrap;
}

/* ===== 菜单滚动区 ===== */
.sidebar-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px 0;
}

.sidebar-body :deep(.el-scrollbar__bar.is-horizontal) {
  display: none !important;
}

.sidebar-body :deep(.el-scrollbar__thumb) {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* ===== 折叠按钮 ===== */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  flex-shrink: 0;
  color: var(--menu-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-footer:hover {
  color: var(--menu-text-active);
}

.footer-text {
  font-size: 14px;
  white-space: nowrap;
}

/* ===== 浅色侧边栏（布局设置-菜单风格） ===== */
.layout-sidebar.sidebar-light {
  --menu-bg: #ffffff;
  --menu-text: #4e5969;
  --menu-text-hover: #1d2129;
  --menu-text-active: #ffffff;
  --menu-hover-bg: #f2f3f5;
  --menu-active-bg: var(--color-primary);
  /* 与右侧白色 header/内容区分 */
  border-right: 1px solid var(--border-color);
}

.layout-sidebar.sidebar-light .logo-text {
  color: var(--menu-text-hover);
}

.layout-sidebar.sidebar-light .sidebar-footer:hover {
  color: var(--menu-text-hover);
}

.layout-sidebar.sidebar-light :deep(.el-scrollbar__thumb) {
  background: rgba(0, 0, 0, 0.15) !important;
}
</style>

<!-- 全局：深色侧边栏菜单样式 -->
<style>
/* 菜单基础变量：覆盖 EP 默认值 */
.side-menu {
  --el-menu-bg-color: transparent;
  --el-menu-border-color: transparent;
  --el-menu-text-color: var(--menu-text);
  --el-menu-hover-bg-color: transparent;
  --el-menu-hover-text-color: var(--menu-text-hover);
  --el-menu-active-color: var(--menu-text-active);
  --el-menu-item-height: 40px;
  --el-menu-sub-item-height: 40px;
  --el-menu-item-font-size: 14px;
  --el-menu-base-level-padding: 16px;
  --el-menu-level-padding: 16px;
  --el-menu-icon-margin-right: 12px;
}

/* 菜单项 */
.side-menu .el-menu-item,
.side-menu .el-sub-menu__title {
  height: 40px;
  line-height: 40px;
  margin: 2px 10px;
  padding: 0 12px !important;
  border-radius: var(--radius-md) !important;
  color: var(--menu-text) !important;
  transition: all 0.15s;
}

/* 自定义图标对齐 */
.side-menu .el-menu-item .svg-icon-container,
.side-menu .el-sub-menu__title .svg-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

/* 折叠态：菜单占满侧边栏，激活背景与图标居中 */
.side-menu.el-menu--collapse {
  /* 菜单宽度 = icon(32) + base-padding(16)*2 = 64px，与侧边栏等宽 */
  --el-menu-icon-width: 32px;
}

.side-menu.el-menu--collapse .el-menu-item,
.side-menu.el-menu--collapse .el-sub-menu__title {
  margin: 2px 8px;
  padding: 0 !important;
  justify-content: center;
}

.side-menu.el-menu--collapse .el-menu-item .el-menu-tooltip__trigger,
.side-menu.el-menu--collapse .el-sub-menu__title .el-menu-tooltip__trigger {
  padding: 0 !important;
  justify-content: center;
}

.side-menu.el-menu--collapse .el-menu-item .svg-icon-container,
.side-menu.el-menu--collapse .el-sub-menu__title .svg-icon-container {
  margin-right: 0;
}

/* hover：仅文字变亮，无背景 */
.side-menu .el-menu-item:hover,
.side-menu .el-sub-menu__title:hover {
  color: var(--menu-text-hover) !important;
}

/* 激活态：主色实心填充（图片风格） */
.side-menu .el-menu-item.is-active {
  background-color: var(--menu-active-bg) !important;
  color: var(--menu-text-active) !important;
  font-weight: 500;
}

.side-menu .el-menu-item.is-active .svg-icon-container,
.side-menu .el-menu-item.is-active i {
  color: var(--menu-text-active) !important;
}

/* 子菜单箭头 */
.side-menu .el-sub-menu__icon-arrow {
  font-size: 12px;
  color: var(--menu-text) !important;
}

.side-menu .el-sub-menu.is-opened > .el-sub-menu__title {
  color: var(--menu-text-hover) !important;
  font-weight: 500;
}

.side-menu .el-sub-menu.is-opened > .el-sub-menu__title .el-sub-menu__icon-arrow {
  color: var(--menu-text-hover) !important;
}

/* 子菜单项：略小字号 */
.side-menu .el-sub-menu .el-menu-item {
  height: 38px !important;
  line-height: 38px !important;
  font-size: 14px;
}

/* === 折叠弹层（白底） === */
/* 仅外层 popper 保留边框/圆角/内边距 */
.el-popper.side-popper {
  padding: 6px !important;
  background: var(--bg-card) !important;
  border: 1px solid var(--border-lighter) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-md) !important;
}

/* 中间容器层：去掉与 popper-class 重复的内部边框，只透出外层圆角 */
.el-menu--popup-container.side-popper {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.side-popper .el-menu {
  background: transparent !important;
  border-right: none !important;
  padding: 0 !important;
  min-width: 160px !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.side-popper .el-menu-item {
  height: 36px;
  margin: 2px;
  border-radius: var(--radius-sm);
  color: var(--text-regular) !important;
}

.side-popper .el-menu-item:hover {
  background-color: var(--bg-hover) !important;
  color: var(--text-primary) !important;
}

.side-popper .el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--color-primary) !important;
  font-weight: 500;
}
</style>
