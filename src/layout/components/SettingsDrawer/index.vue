<template>
  <el-drawer v-model="visible" title="布局设置" size="320px" :with-header="false" append-to-body>
    <div class="settings-panel">
      <div class="settings-header">
        <h3 class="settings-title">布局设置</h3>
        <button class="settings-close" @click="visible = false">
          <SvgIcon name="ri:close-line" size="18" />
        </button>
      </div>

      <div class="settings-body">
        <!-- 主题色 -->
        <section class="settings-section">
          <div class="section-label">主题色</div>
          <div class="theme-colors">
            <button
              v-for="(color, key) in themeColors"
              :key="key"
              class="theme-color"
              :class="{ 'is-active': appStore.layoutSettings.theme === key }"
              :style="{ background: color }"
              :title="themeLabels[key]"
              @click="appStore.setTheme(key)"
            >
              <SvgIcon v-if="appStore.layoutSettings.theme === key" name="ri:check-line" size="16" />
            </button>
          </div>
        </section>

        <!-- 侧边栏配色 -->
        <section class="settings-section">
          <div class="section-label">侧边栏配色</div>
          <div class="sidebar-themes">
            <button
v-for="option in sidebarThemeOptions" :key="option.value" type="button" class="sidebar-theme-option"
              :class="{ 'is-active': appStore.layoutSettings.sidebarTheme === option.value }"
              @click="appStore.setSidebarTheme(option.value)">
              <span class="sidebar-theme-preview" :class="`preview-${option.value}`">
                <i class="preview-rail" />
                <i class="preview-main" />
              </span>
              <span class="sidebar-theme-name">{{ option.label }}</span>
            </button>
          </div>
        </section>

        <!-- 显示设置 -->
        <section class="settings-section">
          <div class="section-label">界面显示</div>
          <div class="switch-list">
            <div class="switch-row">
              <div class="switch-info">
                <span class="switch-label">深色模式</span>
                <span class="switch-desc">切换到暗色背景</span>
              </div>
              <el-switch :model-value="appStore.layoutSettings.isDark" @change="(v: string | number | boolean) => appStore.toggleDarkMode(Boolean(v))" />
            </div>
            <div class="switch-row">
              <div class="switch-info">
                <span class="switch-label">显示标签栏</span>
                <span class="switch-desc">顶部多标签页切换</span>
              </div>
              <el-switch :model-value="appStore.layoutSettings.showTagsView" @change="(v: string | number | boolean) => appStore.toggleTagsView(Boolean(v))" />
            </div>
            <div class="switch-row">
              <div class="switch-info">
                <span class="switch-label">显示面包屑</span>
                <span class="switch-desc">顶部路由面包屑导航</span>
              </div>
              <el-switch :model-value="appStore.layoutSettings.showBreadcrumb" @change="(v: string | number | boolean) => appStore.toggleBreadcrumb(Boolean(v))" />
            </div>
          </div>
        </section>

        <!-- 视觉辅助 -->
        <section class="settings-section">
          <div class="section-label">视觉辅助</div>
          <div class="switch-list">
            <div class="switch-row">
              <div class="switch-info">
                <span class="switch-label">灰色模式</span>
                <span class="switch-desc">页面整体灰度显示</span>
              </div>
              <el-switch :model-value="appStore.layoutSettings.grayMode" @change="(v: string | number | boolean) => appStore.toggleGrayMode(Boolean(v))" />
            </div>
            <div class="switch-row">
              <div class="switch-info">
                <span class="switch-label">色弱模式</span>
                <span class="switch-desc">高对比度反色显示</span>
              </div>
              <el-switch :model-value="appStore.layoutSettings.colorWeak" @change="(v: string | number | boolean) => appStore.toggleColorWeak(Boolean(v))" />
            </div>
          </div>
        </section>

        <!-- 重置 -->
        <div class="settings-footer">
          <el-button @click="handleReset">恢复默认</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";

import useAppStore, { themeColors, type SidebarTheme, type ThemeType } from "@/store/modules/app";
import SvgIcon from "@/components/SvgIcon/index.vue";

const appStore = useAppStore();

const sidebarThemeOptions: Array<{ value: SidebarTheme; label: string }> = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
];

const visible = computed({
  get: () => appStore.showSettings,
  set: (v: boolean) => (v ? appStore.openSettings() : appStore.closeSettings()),
});

const themeLabels: Record<ThemeType, string> = {
  periwinkle: "蓝紫",
  purple: "浅紫",
  blue: "亮蓝",
  green: "嫩绿",
  cyan: "青蓝",
  orange: "活力橙",
  pink: "玫粉",
};

function handleReset() {
  appStore.resetSettings();
}
</script>

<style scoped lang="scss">
.settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.settings-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.settings-close {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.theme-colors {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.theme-color {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-round);
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: var(--transition-fast);
  position: relative;

  &:hover {
    transform: scale(1.08);
  }

  &.is-active {
    border-color: var(--color-bg-card);
    box-shadow: 0 0 0 2px var(--color-primary);
  }
}

.sidebar-themes {
  display: flex;
  gap: 12px;
}

.sidebar-theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
  }

  &.is-active {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
  }
}

.sidebar-theme-preview {
  display: flex;
  width: 100%;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
  overflow: hidden;

  .preview-rail,
  .preview-main {
    display: block;
  }

  .preview-rail {
    width: 24%;
    flex-shrink: 0;
  }

  .preview-main {
    flex: 1;
  }

  &.preview-light .preview-rail {
    background: #f1f3f6;
    border-right: 1px solid #e5e7eb;
  }

  &.preview-light .preview-main {
    background: #ffffff;
  }

  &.preview-dark .preview-rail {
    /* 与 theme.css 深色侧栏一致：固定石墨碳黑，不随主题色变化 */
    background: linear-gradient(180deg, #1b1c1f, #131417);
  }

  &.preview-dark .preview-main {
    background: #f5f6f8;
  }
}

.sidebar-theme-name {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.sidebar-theme-option.is-active .sidebar-theme-name {
  color: var(--color-primary);
  font-weight: 500;
}

.switch-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }
}

.switch-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.switch-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.switch-desc {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.settings-footer {
  padding-top: 8px;
  border-top: 1px solid var(--color-border-light);

  :deep(.el-button) {
    width: 100%;
  }
}
</style>
