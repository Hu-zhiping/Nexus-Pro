<template>
  <div 
    class="layout-container" 
    :class="layoutClasses"
    :style="layoutStyles"
  >
    <!-- 侧边栏 - 垂直布局/混合布局 -->
    <aside 
      v-if="showSidebar" 
      class="layout-sidebar"
      :class="{ 'is-collapse': isCollapse, 'is-mobile': isMobile }"
      :style="sidebarStyle"
    >
      <Sidebar />
    </aside>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !isCollapse" 
      class="mobile-mask"
      @click="appStore.toggleSidebar()"
    />

    <!-- 主体区域 -->
    <div class="layout-main">
      <!-- 顶部导航栏 -->
      <header 
        class="layout-header"
        :class="{ 'is-fixed': fixedHeader }"
        :style="headerStyle"
      >
        <!-- 顶部菜单模式 -->
        <div v-if="isTopMenu" class="top-menu-wrapper">
          <div class="top-menu-logo">
            <div class="logo-icon-wrapper">
              <SvgIcon name="ri:hexagon-fill" size="28" class="logo-icon" />
            </div>
            <div class="logo-text-wrapper">
              <span class="logo-text">Vue Admin</span>
              <span class="logo-subtitle">Admin Pro</span>
            </div>
          </div>
          <TopMenu />
        </div>
        
        <!-- 导航栏 -->
        <Navbar />
        
        <!-- 标签页 -->
        <TagsView v-if="showTagsView" />
      </header>

      <!-- 内容区域 -->
      <main class="layout-content" :style="contentStyle">
        <AppMain />
      </main>

      <!-- 页脚 -->
      <footer v-if="showFooter" class="layout-footer">
        <span>Vue Admin Pro © 2024</span>
      </footer>
    </div>

    <!-- 设置面板 -->
    <Settings />

    <!-- 水印 -->
    <Watermark 
      v-if="showWatermark" 
      :text="watermarkText"
      :font-size="14"
      :gap-x="200"
      :gap-y="200"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Sidebar from './components/Sidebar/index.vue';
import TopMenu from './components/TopMenu/index.vue';
import Navbar from './components/Navbar/index.vue';
import TagsView from './components/TagsView/index.vue';
import Settings from './components/Settings/index.vue';
import AppMain from './components/AppMain/index.vue';
import Watermark from './components/Watermark/index.vue';
import useAppStore from '@/store/modules/app';

const appStore = useAppStore();
const isMobile = ref(false);

// 响应式状态
const isCollapse = computed(() => appStore.isCollapse);
const layoutMode = computed(() => appStore.layoutSettings.layoutMode);
const fixedHeader = computed(() => appStore.layoutSettings.fixedHeader);
const showTagsView = computed(() => appStore.layoutSettings.showTagsView);
const showFooter = computed(() => appStore.layoutSettings.showFooter);
const showWatermark = computed(() => appStore.layoutSettings.showWatermark);
const watermarkText = computed(() => appStore.layoutSettings.watermarkText);

// 布局模式判断
const isTopMenu = computed(() => layoutMode.value === 'horizontal');

const showSidebar = computed(() => layoutMode.value !== 'horizontal');

// 侧边栏样式
const sidebarStyle = computed(() => {
  const width = isCollapse.value ? 64 : appStore.layoutSettings.sidebarWidth;
  return {
    width: `${width}px`,
    flex: `0 0 ${width}px`,
  } as const;
});

// 头部样式
const headerStyle = computed(() => {
  if (!fixedHeader.value) return {};
  const width = showSidebar.value && !isCollapse.value 
    ? `calc(100% - ${appStore.layoutSettings.sidebarWidth}px)` 
    : '100%';
  return {
    width: isMobile.value ? '100%' : width,
    // position: 'fixed' as const,
    top: '0',
    right: '0',
    zIndex: '100',
  };
});

// 内容区域样式
const contentStyle = computed(() => {
  if (!fixedHeader.value) return {};
  const headerHeight = showTagsView.value ? 104 : 64;
  return {
    paddingTop: `${headerHeight}px`
  };
});

// 布局类名
const layoutClasses = computed(() => {
  return {
    [`layout-mode-${layoutMode.value}`]: true,
    'has-tags-view': showTagsView.value,
    'is-dark': appStore.layoutSettings.isDark,
    'is-mobile': isMobile.value,
  };
});

// 布局样式
const layoutStyles = computed(() => {
  return {
    '--sidebar-width': `${appStore.layoutSettings.sidebarWidth}px`,
    '--sidebar-collapsed-width': `${appStore.layoutSettings.sidebarCollapsedWidth}px`,
    '--primary-color': appStore.primaryColor,
  };
});

// 初始化
onMounted(() => {
  appStore.init();
  
  // 检测移动端
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    if (isMobile.value && !appStore.isCollapse) {
      appStore.setSidebarCollapsed(true);
    }
  };
  
  window.addEventListener('resize', checkMobile);
  checkMobile();
});
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
}

// 侧边栏
.layout-sidebar {
  height: 100%;
  background-color: #001529;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  z-index: 200;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  &.is-collapse {
    .logo-text {
      display: none;
    }
  }

  &.is-mobile {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 300;
    
    &.is-collapse {
      transform: translateX(-100%);
    }
  }
}

// 移动端遮罩层
.mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 250;
}

// 主体区域
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

// 顶部导航栏
.layout-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;

  &.is-fixed {
    & + .layout-content {
      padding-top: 64px;
    }
  }
}

// 顶部菜单模式
.top-menu-wrapper {
  display: flex;
  align-items: center;
  height: 72px;
  padding: 0 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .top-menu-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 48px;

    .logo-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);

      .logo-icon {
        color: #fff;
      }
    }

    .logo-text-wrapper {
      display: flex;
      flex-direction: column;
    }

    .logo-text {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-subtitle {
      color: #64748b;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}

// 内容区域
.layout-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background-color: var(--color-bg-base);
}

// 页脚
.layout-footer {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-top: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
  font-size: 13px;
}

// 暗色模式适配
.is-dark {
  .layout-header {
    background-color: #141414;
    border-bottom: 1px solid #303030;
  }

  .layout-content {
    background-color: #0a0a0a;
  }

  .layout-footer {
    background-color: #141414;
    border-top-color: #303030;
  }
}
</style>
