<template>
  <div class="sidebar-container">
    <!-- Logo 区域 -->
    <div class="sidebar-logo" @click="$router.push('/')">
      <div class="logo-icon-wrapper">
        <SvgIcon name="ri:hexagon-fill" size="32" class="logo-icon" />
      </div>
      <transition name="fade">
        <div v-if="!isCollapse" class="logo-text-wrapper">
          <span class="logo-text">Nexus Pro </span>
          <!-- <span class="logo-subtitle">Admin Pro</span> -->
        </div>
      </transition>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar class="sidebar-menu">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :background-color="menuBg"
        :text-color="menuTextColor"
        :active-text-color="menuActiveTextColor"
        router
        class="sidebar-el-menu"
      >
        <SidebarItem 
          v-for="route in menuRoutes" 
          :key="route.path" 
          :item="route" 
          :base-path="route.path" 
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SidebarItem from './SideBarItem.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import useAppStore from '@/store/modules/app';
import useMenuStore from '@/store/modules/menu';

const route = useRoute();
const appStore = useAppStore();
const menuStore = useMenuStore();

const isCollapse = computed(() => appStore.isCollapse);
const menuRoutes = computed(() => menuStore.visibleMenus);

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route;
  if (meta?.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});

// 菜单样式 - 使用深色玻璃拟态效果
const menuBg = computed(() => 'transparent');
const menuTextColor = computed(() => '#94a3b8');
const menuActiveTextColor = computed(() => '#fff');
</script>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

// Logo 区域
.sidebar-logo {
  display: flex;
  align-items: center;
  height: 72px;
  padding: 0 20px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
  }

  .logo-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 10px;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);

    .logo-icon {
      color: #fff;
    }
  }

  .logo-text-wrapper {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
    overflow: hidden;
  }

  .logo-text {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .logo-subtitle {
    color: #64748b;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }
}

// 菜单区域
.sidebar-menu {
  flex: 1;
  overflow: hidden;
  padding: 12px 0;

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}

.sidebar-el-menu {
  border-right: none;
  background: transparent;
  padding: 0 12px;

  :deep(.el-menu-item), :deep(.el-sub-menu__title) {
    height: 44px;
    line-height: 44px;
    margin: 4px 0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #fff !important;
    }

    &.is-active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%) !important;
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
    }
  }

  :deep(.el-sub-menu) {
    display: flex;
    justify-content: center;
    .el-sub-menu__title {
      color: #94a3b8;
    }

    &.is-active {
      > .el-sub-menu__title {
        color: #fff !important;
      }
    }

    .el-menu {
      background: transparent !important;
      padding-left: 8px;

      .el-menu-item {
        height: 40px;
        line-height: 40px;
        font-size: 13px;
        color: #64748b;

        &.is-active {
          color: #fff !important;
        }
      }
    }
  }

  :deep(.el-menu--inline) {
    background: transparent !important;
  }
}

// 折叠状态样式
.is-collapse {
  .sidebar-logo {
    justify-content: center;
    padding: 0;

    .logo-icon-wrapper {
      width: 36px;
      height: 36px;
    }
  }
}

// 过渡动画
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, width 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  width: 0;
}
</style>
