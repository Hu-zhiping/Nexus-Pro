<template>
  <div
class="layout" :class="{
    'is-mobile': appStore.isMobile,
    'is-sidebar-collapsed': appStore.isCollapse,
  }">
    <!-- 桌面端侧边栏 -->
    <Sidebar v-if="!appStore.isMobile" class="layout__sidebar" />

    <!-- 移动端侧边栏 -->
    <template v-else>
      <Transition name="drawer-fade">
        <div v-if="appStore.mobileSidebarOpen" class="layout__backdrop" @click="appStore.closeMobileSidebar()" />
      </Transition>

      <Transition name="drawer-slide">
        <Sidebar v-if="appStore.mobileSidebarOpen" class="layout__sidebar is-drawer" />
      </Transition>
    </template>

    <!-- 主区域 -->
    <main class="layout__main">
      <!-- 顶部栏 -->
      <header class="layout__header">
        <Header />
      </header>

      <!-- 标签页 -->
      <nav v-if="appStore.layoutSettings.showTagsView" class="layout__tabs">
        <TagsView />
      </nav>

      <!-- 内容区域 -->
      <section class="layout__content">
        <AppMain />
      </section>
    </main>

    <!-- 设置抽屉 -->
    <SettingsDrawer v-model="appStore.showSettings" />
  </div>
</template>

<script setup lang="ts">
import useAppStore from "@/store/modules/app";

import AppMain from "./components/AppMain/index.vue";
import Header from "./components/Header/index.vue";
import SettingsDrawer from "./components/SettingsDrawer/index.vue";
import Sidebar from "./components/Sidebar/index.vue";
import TagsView from "./components/TagsView/index.vue";

const appStore = useAppStore();
</script>

<style scoped lang="scss">
.layout {
  position: relative;

  display: flex;

  width: 100%;
  height: 100vh;

  overflow: hidden;

  background: var(--color-bg-page);
  color: var(--color-text-primary);

  font-family: var(--font-family-base);

  transition:
    background-color var(--transition-base),
    color var(--transition-base);
}

/* =========================================================
 * Sidebar
 * ========================================================= */

.layout__sidebar {
  position: relative;

  flex: 0 0 var(--layout-sidebar-width);

  width: var(--layout-sidebar-width);
  height: 100vh;

  z-index: 200;

  transition:
    width var(--transition-slow),
    flex-basis var(--transition-slow);
}

/* =========================================================
 * Main
 * ========================================================= */

.layout__main {
  position: relative;

  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
  min-height: 0;

  overflow: hidden;

  background: var(--color-bg-page);

  transition: background-color var(--transition-base);
}

/* =========================================================
 * Header
 * ========================================================= */

.layout__header {
  position: relative;

  flex: 0 0 var(--layout-header-height);

  height: var(--layout-header-height);

  z-index: 100;

  background: var(--color-bg-card);

  border-bottom: 1px solid var(--color-border-light);

  transition:
    background-color var(--transition-base),
    border-color var(--transition-base);
}

/* =========================================================
 * Tabs
 * ========================================================= */

.layout__tabs {
  position: relative;

  flex: 0 0 var(--layout-tabs-height);

  height: var(--layout-tabs-height);

  z-index: 90;

  background: var(--color-bg-card);

  border-bottom: 1px solid var(--color-border-light);

  overflow: hidden;

  transition:
    background-color var(--transition-base),
    border-color var(--transition-base);
}

/* =========================================================
 * Content
 * ========================================================= */

.layout__content {
  position: relative;

  flex: 1;

  min-width: 0;
  min-height: 0;

  overflow: auto;

  background: var(--color-bg-page);

  transition: background-color var(--transition-base);

  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

/* =========================================================
 * Sidebar Collapsed
 * ========================================================= */

.layout.is-sidebar-collapsed {
  .layout__sidebar {
    flex-basis: var(--layout-sidebar-collapse-width);

    width: var(--layout-sidebar-collapse-width);
  }
}

/* =========================================================
 * Mobile
 * ========================================================= */

.layout.is-mobile {
  .layout__main {
    width: 100%;
  }
}

/* =========================================================
 * Mobile Sidebar
 * ========================================================= */

.layout__sidebar.is-drawer {
  position: fixed;

  top: 0;
  left: 0;
  bottom: 0;

  z-index: 2000;

  width: var(--layout-sidebar-width);

  flex: none;

  box-shadow: var(--shadow-lg);
}

/* =========================================================
 * Backdrop
 * ========================================================= */

.layout__backdrop {
  position: fixed;

  inset: 0;

  z-index: 1999;

  background: var(--color-bg-overlay);

  backdrop-filter: blur(2px);

  -webkit-backdrop-filter: blur(2px);
}

/* =========================================================
 * Drawer Animation
 * ========================================================= */

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity var(--transition-base);
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform var(--transition-slow);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

/* =========================================================
 * Scrollbar
 * ========================================================= */

.layout__content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.layout__content::-webkit-scrollbar-track {
  background: transparent;
}

.layout__content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-round);
}

.layout__content::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}

/* =========================================================
 * Reduced Motion
 * ========================================================= */

@media (prefers-reduced-motion: reduce) {

  .layout,
  .layout__main,
  .layout__header,
  .layout__tabs,
  .layout__content,
  .layout__sidebar {
    transition: none !important;
  }
}
</style>
