<template>
  <div class="navbar-container">
    <!-- 左侧区域 -->
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <button 
        class="nav-btn collapse-btn" 
        @click="appStore.toggleSidebar()"
        :title="isCollapse ? '展开菜单' : '收起菜单'"
      >
        <SvgIcon 
          :name="isCollapse ? 'ri:menu-unfold-line' : 'ri:menu-fold-line'" 
          size="18"
        />
      </button>

      <!-- 面包屑 -->
      <Breadcrumb v-if="showBreadcrumb" />
    </div>

    <!-- 右侧区域 -->
    <div class="navbar-right">
      <!-- 搜索按钮 -->
      <button class="nav-btn" @click="openSearch" title="搜索">
        <SvgIcon name="ri:search-line" size="18" />
      </button>

      <!-- 全屏按钮 -->
      <button class="nav-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
        <SvgIcon 
          :name="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'" 
          size="18" 
        />
      </button>

      <!-- 消息通知 -->
      <el-popover
        placement="bottom"
        :width="320"
        trigger="click"
        popper-class="notification-popover"
      >
        <template #reference>
          <button class="nav-btn notification-btn" title="消息通知">
            <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
              <SvgIcon name="ri:notification-3-line" size="18" />
            </el-badge>
          </button>
        </template>
        <NotificationList />
      </el-popover>

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="handleLanguageChange">
        <button class="nav-btn" title="切换语言">
          <SvgIcon name="ri:global-line" size="18" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              command="zh-CN" 
              :class="{ 'is-active': currentLang === 'zh-CN' }"
            >
              <span class="lang-flag">🇨🇳</span> 简体中文
            </el-dropdown-item>
            <el-dropdown-item 
              command="en"
              :class="{ 'is-active': currentLang === 'en' }"
            >
              <span class="lang-flag">🇺🇸</span> English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换 -->
      <button class="nav-btn" @click="toggleDarkMode" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
        <SvgIcon 
          :name="isDark ? 'ri:sun-line' : 'ri:moon-line'" 
          size="18" 
        />
      </button>

      <!-- 设置按钮 -->
      <button class="nav-btn" @click="appStore.openSettings()" title="布局设置">
        <SvgIcon name="ri:settings-3-line" size="18" />
      </button>

      <!-- 用户头像 -->
      <el-dropdown trigger="click" @command="handleUserCommand">
        <div class="user-info">
          <el-avatar 
            :size="32" 
            :src="userAvatar"
            class="user-avatar"
          >
            <SvgIcon name="ri:user-line" size="20" />
          </el-avatar>
          <span v-if="!isMobile" class="user-name">{{ userName }}</span>
          <SvgIcon name="ri:arrow-down-s-line" size="14" class="user-arrow" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <SvgIcon name="ri:user-line" size="16" class="dropdown-icon" />
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <SvgIcon name="ri:settings-4-line" size="16" class="dropdown-icon" />
              个人设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <SvgIcon name="ri:logout-box-r-line" size="16" class="dropdown-icon" />
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 搜索弹窗 -->
    <SearchModal v-model:visible="searchVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useFullscreen } from '@vueuse/core';
import Breadcrumb from './BreadCrumb.vue';
import NotificationList from './NotificationList.vue';
import SearchModal from './SearchModal.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import useAppStore from '@/store/modules/app';
import useUserStore from '@/store/modules/user';

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

// 响应式状态
const isCollapse = computed(() => appStore.isCollapse);
const isDark = computed(() => appStore.layoutSettings.isDark);
const showBreadcrumb = computed(() => appStore.layoutSettings.showBreadcrumb);
const currentLang = computed(() => appStore.layoutSettings.language);
const userName = computed(() => userStore.userInfo?.username || 'Admin');
const userAvatar = computed(() => userStore.userInfo?.avatar || '');

// 检测移动端
const isMobile = computed(() => window.innerWidth < 768);

// 搜索弹窗
const searchVisible = ref(false);
const openSearch = () => {
  searchVisible.value = true;
};

// 未读消息数
const unreadCount = ref(3);

// 切换暗色模式
const toggleDarkMode = () => {
  appStore.toggleDarkMode();
  ElMessage.success(isDark.value ? '已切换到暗色模式' : '已切换到亮色模式');
};

// 切换语言
const handleLanguageChange = (lang: 'zh-CN' | 'en') => {
  appStore.setLanguage(lang);
  ElMessage.success(lang === 'zh-CN' ? '已切换到中文' : 'Switched to English');
};

// 用户菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/profile/settings');
      break;
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        userStore.logout();
        router.push('/login');
        ElMessage.success('退出登录成功');
      });
      break;
  }
};
</script>

<style lang="scss" scoped>
.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 24px;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: #f1f5f9;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0; // 防止按钮被压缩

  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
}

.collapse-btn {
  flex-shrink: 0; // 确保折叠按钮始终可见
}

.notification-btn {
  :deep(.el-badge) {
    line-height: 1;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
  padding: 6px 12px 6px 6px;
  background: #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }

  .user-avatar {
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .user-name {
    font-size: 14px;
    color: #334155;
    font-weight: 600;
  }

  .user-arrow {
    color: #94a3b8;
  }
}

.dropdown-icon {
  margin-right: 8px;
}

.lang-flag {
  margin-right: 8px;
}

// 暗色模式
:global(.dark) {
  .navbar-container {
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  .nav-btn {
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;

    &:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      color: #fff;
    }
  }

  .user-info {
    background: rgba(255, 255, 255, 0.05);

    &:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    }

    .user-name {
      color: #e2e8f0;
    }

    .user-arrow {
      color: #64748b;
    }
  }
}
</style>

<style>
.notification-popover {
  padding: 0 !important;
}
</style>
