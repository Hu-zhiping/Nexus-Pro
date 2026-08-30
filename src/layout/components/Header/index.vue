<template>
  <header class="header-bar">
    <div class="header-left">
      <button
class="header-btn" type="button"
        :title="appStore.isMobile ? '打开菜单' : appStore.isCollapse ? '展开侧栏' : '折叠侧栏'"
        :aria-label="appStore.isMobile ? '打开菜单' : appStore.isCollapse ? '展开侧栏' : '折叠侧栏'"
        @click="appStore.toggleSidebar()">
        <SvgIcon
          :name="appStore.isMobile ? 'ri:menu-line' : appStore.isCollapse ? 'ri:menu-unfold-line' : 'ri:menu-fold-line'"
          :size="18" />
      </button>

      <!-- Breadcrumb -->
      <Breadcrumb v-if="appStore.layoutSettings.showBreadcrumb" />
    </div>

    <div class="header-actions">
      <div class="header-search">
        <el-input ref="searchRef" placeholder="搜索任务、数据源、日志" clearable @keydown.esc="searchRef?.blur?.()">
          <!-- Search Icon -->
          <template #prefix>
            <SvgIcon name="ri:search-line" :size="16" />
          </template>

          <!-- Shortcut -->
          <template #suffix>
            <span class="search-shortcut" title="聚焦搜索框">
              <kbd>Ctrl</kbd>

              <span class="shortcut-plus"> + </span>

              <kbd>K</kbd>
            </span>
          </template>
        </el-input>
      </div>

      <div class="header-right">
        <!-- 全屏 -->
        <FullScreen />

        <!-- 深浅色 -->
        <ThemeToggle />

        <!-- 语言 -->
        <LanguageSelect />

        <!-- 通知 -->
        <Notification />

        <!-- 系统设置 -->
        <button class="header-btn" type="button" title="布局设置" aria-label="布局设置" @click="appStore.openSettings()">
          <SvgIcon name="ri:settings-3-line" :size="18" />
        </button>

        <!-- 用户 -->
        <UserDropdown />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import useAppStore from "@/store/modules/app";
import SvgIcon from "@/components/SvgIcon/index.vue";
import Breadcrumb from "./Breadcrumb.vue";
import FullScreen from "./FullScreen.vue";
import LanguageSelect from "./LanguageSelect.vue";
import Notification from "./Notification.vue";
import ThemeToggle from "./ThemeToggle.vue";
import UserDropdown from "./UserDropdown.vue";

const appStore = useAppStore();
const searchRef = ref<{
  focus: () => void;
  blur: () => void;
} | null>(null);

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();

    searchRef.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleGlobalKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleGlobalKeydown);
});
</script>

<style scoped lang="scss">
.header-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--layout-header-height);
  flex-shrink: 0;
  padding: 0 var(--space-5);
  gap: var(--space-4);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    color var(--transition-base);
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  gap: var(--space-2);
}

.header-left :deep(.breadcrumb) {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
  gap: var(--space-3);
}

.header-search {
  width: 420px;
  min-width: 180px;
  max-width: 420px;
  flex: 0 0 420px;
}

.header-search :deep(.el-input__wrapper) {
  height: var(--component-input-height);
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-bg-hover);
  border: 1px solid transparent;
  box-shadow: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.header-search :deep(.el-input__wrapper:hover) {
  background: var(--color-bg-card);
  border-color: var(--color-border);
}

.header-search :deep(.el-input__wrapper.is-focus) {
  background: var(--color-bg-card);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.header-search :deep(.el-input__inner) {
  height: 100%;
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
}

.header-search :deep(.el-input__inner::placeholder) {
  color: var(--color-text-tertiary);
}

.header-search :deep(.el-input__prefix) {
  color: var(--color-text-tertiary);
}

.header-search :deep(.el-input__suffix) {
  display: flex;
  align-items: center;
}

.search-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 100%;
  line-height: 1;
  user-select: none;
  white-space: nowrap;
}

.shortcut-plus {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1;
}

.search-shortcut kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 18px;
  padding: 0 5px;
  box-sizing: border-box;
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-bottom-width: 2px;
  border-radius: var(--radius-sm);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--space-1);
  white-space: nowrap;
}

.header-right :deep(.el-dropdown) {
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .header-left :deep(.breadcrumb) {
    display: none;
  }

  .header-search {
    width: 320px;
    flex-basis: 320px;
    max-width: 320px;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 0 var(--space-4);
  }

  .header-search {
    display: none;
  }

  .header-actions {
    gap: var(--space-1);
  }
}

@media (max-width: 480px) {
  .header-bar {
    padding: 0 var(--space-3);
    gap: var(--space-2);
  }

  .header-actions {
    gap: 0;
  }
}
</style>
