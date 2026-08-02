<template>
  <div class="navbar">
    <div class="nav-left">
      <button class="nav-btn" :title="isCollapse ? '展开菜单' : '收起菜单'" @click="appStore.toggleSidebar()">
        <SvgIcon :name="isCollapse ? 'ri:menu-unfold-line' : 'ri:menu-fold-line'" size="18" />
      </button>
      <Breadcrumb v-if="showBreadcrumb" />
    </div>
    <div class="nav-right">
      <button class="nav-btn" title="搜索" @click="openSearch">
        <SvgIcon name="ri:search-line" size="18" />
      </button>
      <button class="nav-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
        <SvgIcon :name="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'" size="18" />
      </button>
      <el-popover placement="bottom-end" :width="360" trigger="click" popper-class="notify-pop" :offset="10">
        <template #reference>
          <button class="nav-btn" title="消息通知">
            <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
              <SvgIcon name="ri:notification-3-line" size="18" />
            </el-badge>
          </button>
        </template>
        <NotificationList />
      </el-popover>
      <button class="nav-btn" :title="isDark ? '切换亮色' : '切换暗色'" @click="toggleDark">
        <SvgIcon :name="isDark ? 'ri:sun-line' : 'ri:moon-line'" size="18" />
      </button>
      <button class="nav-btn" title="布局设置" @click="appStore.openSettings()">
        <SvgIcon name="ri:settings-3-line" size="18" />
      </button>
      <div class="nav-sep" />
      <el-dropdown trigger="click" @command="handleUserCommand">
        <div class="user-trigger">
          <el-avatar :size="28" :src="userAvatar" class="user-avatar">
            <SvgIcon name="ri:user-line" size="14" />
          </el-avatar>
          <span class="user-name">{{ userName }}</span>
          <SvgIcon name="ri:arrow-down-s-line" size="12" class="user-arrow" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="dd-header">
              <el-avatar :size="36" :src="userAvatar">
                <SvgIcon name="ri:user-line" size="20" />
              </el-avatar>
              <div class="dd-info">
                <span class="dd-name">{{ userName }}</span>
                <span class="dd-email">admin@example.com</span>
              </div>
            </div>
            <el-dropdown-item command="profile">
              <SvgIcon name="ri:user-line" size="14" class="dd-icon" /> 个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <SvgIcon name="ri:settings-4-line" size="14" class="dd-icon" /> 个人设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <SvgIcon name="ri:logout-box-r-line" size="14" class="dd-icon" /> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <SearchModal v-model:visible="searchVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useFullscreen } from "@vueuse/core";
import Breadcrumb from "./BreadCrumb.vue";
import NotificationList from "./NotificationList.vue";
import SearchModal from "./SearchModal.vue";
import SvgIcon from "@/components/svg-icon/index.vue";
import useAppStore from "@/store/modules/app";
import useUserStore from "@/store/modules/user";

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

const isCollapse = computed(() => appStore.isCollapse);
const isDark = computed(() => appStore.layoutSettings.isDark);
const showBreadcrumb = computed(() => appStore.layoutSettings.showBreadcrumb);
const userName = computed(() => userStore.profile.username || "Admin");
const userAvatar = computed(() => userStore.profile.avatar || "");

const searchVisible = ref(false);
const unreadCount = ref(3);

const openSearch = () => {
  searchVisible.value = true;
};
const toggleDark = () => {
  appStore.toggleDarkMode();
  ElMessage.success(isDark.value ? "已切换到暗色模式" : "已切换到亮色模式");
};
const handleUserCommand = (command: string) => {
  switch (command) {
    case "profile":
      router.push("/profile");
      break;
    case "settings":
      router.push("/profile/settings");
      break;
    case "logout":
      ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        userStore.signOut();
        router.push("/login");
        ElMessage.success("退出登录成功");
      });
      break;
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--page-padding);
  background: var(--bg-card);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--text-regular);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-btn :deep(.el-badge__content) {
  border: none;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
}

.nav-sep {
  width: 1px;
  height: 16px;
  margin: 0 8px;
  background: var(--border-color);
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 8px 3px 3px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.user-trigger:hover {
  background: var(--bg-hover);
}

.user-trigger:hover .user-arrow {
  transform: rotate(180deg);
}

.user-avatar {
  flex-shrink: 0;
  background: var(--el-color-primary-light-9);
  color: var(--color-primary);
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
}

.user-arrow {
  color: var(--text-regular);
  transition: transform var(--transition-base);
}

.dd-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 4px;
}

.dd-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dd-name {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-primary);
}

.dd-email {
  font-size: 12px;
  color: var(--text-secondary);
}

.dd-icon {
  margin-right: 8px;
  color: var(--text-secondary);
}
</style>

<style>
.notify-pop {
  padding: 0 !important;
  border-radius: var(--radius-lg) !important;
}
</style>
