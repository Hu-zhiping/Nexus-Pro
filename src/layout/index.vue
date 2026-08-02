<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside
      id="app-sidebar"
      :class="{
        collapsed: isCollapse,
        mobile: isMobile,
        'mobile-hidden': isMobile && isCollapse,
      }"
    >
      <Sidebar />
    </aside>

    <!-- 移动端遮罩 -->
    <Transition name="fade">
      <div v-if="isMobile && !isCollapse" class="layout-overlay" @click="appStore.toggleSidebar()" />
    </Transition>

    <!-- 主区域 -->
    <main id="app-main">
      <!-- 顶栏（sticky） -->
      <div id="app-header">
        <Navbar />
        <TagsView v-if="showTagsView" />
      </div>

      <!-- 内容区：四周 20px 留白 -->
      <div id="app-content">
        <AppMain />
      </div>
    </main>

    <Watermark v-if="showWatermark" :text="watermarkText" />
    <Settings />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Sidebar from "./components/sidebar/index.vue";
import Navbar from "./components/nav-bar/index.vue";
import TagsView from "./components/tags-view/index.vue";
import Settings from "./components/settings/index.vue";
import AppMain from "./components/app-main/AppMain.vue";
import Watermark from "./components/watermark/index.vue";
import useAppStore from "@/store/modules/app";

const appStore = useAppStore();
const isMobile = ref(false);

const isCollapse = computed(() => appStore.isCollapse);
const showTagsView = computed(() => appStore.layoutSettings.showTagsView);
const showWatermark = computed(() => appStore.layoutSettings.showWatermark);
const watermarkText = computed(() => appStore.layoutSettings.watermarkText);

let resizeHandler: () => void;

onMounted(() => {
  resizeHandler = () => {
    const prev = isMobile.value;
    isMobile.value = window.innerWidth < 768;
    if (isMobile.value && !appStore.isCollapse) appStore.setSidebarCollapsed(true);
    if (prev && !isMobile.value && appStore.isCollapse) appStore.setSidebarCollapsed(false);
  };
  window.addEventListener("resize", resizeHandler);
  resizeHandler();
});

onUnmounted(() => window.removeEventListener("resize", resizeHandler));
</script>

<style scoped>
/* ===== 根布局：flex 横向 ===== */
.app-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-page);
}

/* ===== 侧边栏（深色，背景由 sidebar 组件控制） ===== */
#app-sidebar {
  position: relative;
  z-index: 200;
  width: var(--sidebar-width);
  height: 100vh;
  flex-shrink: 0;
  overflow: hidden;
  transition:
    width var(--transition-slow),
    transform var(--transition-slow);
}

#app-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

#app-sidebar.mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 300;
  box-shadow: var(--shadow-md);
}

#app-sidebar.mobile-hidden {
  transform: translateX(-100%);
}

.layout-overlay {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(0, 0, 0, 0.45);
}

/* ===== 主区域：flex 纵向 ===== */
#app-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

/* ===== 顶栏：sticky ===== */
#app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
}

/* ===== 内容区：四周 20px 留白 ===== */
#app-content {
  flex: 1;
  padding: var(--page-padding);
  overflow: auto;
  background: var(--bg-page);
}
</style>
