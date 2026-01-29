<template>
  <el-drawer
    v-model="visible"
    title="布局设置"
    size="320px"
    :with-header="true"
    class="settings-drawer"
    @closed="onClosed"
  >
    <div class="settings-container">
      <!-- 主题色 -->
      <div class="settings-section">
        <h3 class="section-title">主题色</h3>
        <div class="theme-colors">
          <div
            v-for="option in themeColorOptions"
            :key="option.key"
            class="color-item"
            :class="{ active: settings.theme === option.key }"
            @click="changeTheme(option.key)"
          >
            <div class="color-preview" :style="{ backgroundColor: option.color }">
              <SvgIcon v-if="settings.theme === option.key" name="ri:check-line" size="14" color="#fff" />
            </div>
            <span class="color-name">{{ themeNames[option.key] }}</span>
          </div>
        </div>
      </div>

      <!-- 布局模式 -->
      <div class="settings-section">
        <h3 class="section-title">布局模式</h3>
        <div class="layout-modes">
          <div
            v-for="mode in layoutModes"
            :key="mode.key"
            class="layout-item"
            :class="{ active: settings.layoutMode === mode.key }"
            @click="changeLayoutMode(mode.key)"
          >
            <div class="layout-preview" :class="mode.key">
              <div class="preview-sidebar"></div>
              <div class="preview-header"></div>
              <div class="preview-content"></div>
            </div>
            <span class="layout-name">{{ mode.name }}</span>
          </div>
        </div>
      </div>

      <!-- 界面显示 -->
      <div class="settings-section">
        <h3 class="section-title">界面显示</h3>
        <div class="switch-list">
          <div class="switch-item">
            <span>灰色模式</span>
            <el-switch v-model="grayMode" @change="(val) => toggleGrayMode(val as boolean)" />
          </div>
          <div class="switch-item">
            <span>色弱模式</span>
            <el-switch v-model="colorWeak" @change="(val) => toggleColorWeak(val as boolean)" />
          </div>
          <div class="switch-item">
            <span>显示标签页</span>
            <el-switch v-model="settings.showTagsView" @change="(val) => toggleTagsView(val as boolean)" />
          </div>
          <div class="switch-item">
            <span>显示面包屑</span>
            <el-switch v-model="settings.showBreadcrumb" @change="(val) => toggleBreadcrumb(val as boolean)" />
          </div>
          <div class="switch-item">
            <span>显示页脚</span>
            <el-switch v-model="settings.showFooter" @change="(val) => toggleFooter(val as boolean)" />
          </div>
          <div class="switch-item">
            <span>固定头部</span>
            <el-switch v-model="settings.fixedHeader" @change="(val) => toggleFixedHeader(val as boolean)" />
          </div>
          <div class="switch-item">
            <span>显示水印</span>
            <el-switch v-model="settings.showWatermark" @change="(val) => toggleWatermark(val as boolean)" />
          </div>
        </div>
      </div>

      <!-- 重置按钮 -->
      <div class="settings-footer">
        <el-button type="primary" :icon="Refresh" @click="resetSettings">
          重置所有设置
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import SvgIcon from '@/components/SvgIcon/index.vue';
import useAppStore, { themeColors, type ThemeType, type LayoutMode } from '@/store/modules/app';

const appStore = useAppStore();

// 本地状态
const grayMode = ref(appStore.layoutSettings.grayMode);
const colorWeak = ref(appStore.layoutSettings.colorWeak);

// 可见性
const visible = computed({
  get: () => appStore.showSettings,
  set: (val) => {
    if (!val) appStore.closeSettings();
  },
});

// 设置
const settings = computed(() => appStore.layoutSettings);

// 主题色选项
const themeColorOptions = computed(() => {
  return (Object.entries(themeColors) as [ThemeType, string][]).map(([key, color]) => ({
    key,
    color,
  }));
});

// 主题名称映射
const themeNames: Record<ThemeType, string> = {
  blue: '科技蓝',
  purple: '紫罗兰',
  green: '翡翠绿',
  orange: '活力橙',
  red: '玫瑰红',
};

// 布局模式选项
const layoutModes = [
  { key: 'vertical' as LayoutMode, name: '垂直' },
  { key: 'horizontal' as LayoutMode, name: '水平' },
  { key: 'mix' as LayoutMode, name: '两列菜单' },
];

// 监听设置变化
watch(() => appStore.layoutSettings, (newVal) => {
  grayMode.value = newVal.grayMode;
  colorWeak.value = newVal.colorWeak;
}, { deep: true });

// 切换主题
const changeTheme = (theme: ThemeType) => {
  appStore.setTheme(theme);
  ElMessage.success('主题已切换');
};

// 切换布局模式
const changeLayoutMode = (mode: LayoutMode) => {
  appStore.setLayoutMode(mode);
  ElMessage.success('布局模式已切换');
};

// 切换灰色模式
const toggleGrayMode = (val: boolean) => {
  appStore.toggleGrayMode(val);
};

// 切换色弱模式
const toggleColorWeak = (val: boolean) => {
  appStore.toggleColorWeak(val);
};

// 切换标签页显示
const toggleTagsView = (val: boolean) => {
  appStore.toggleTagsView(val);
};

// 切换面包屑显示
const toggleBreadcrumb = (val: boolean) => {
  appStore.toggleBreadcrumb(val);
};

// 切换页脚显示
const toggleFooter = (val: boolean) => {
  appStore.toggleFooter(val);
};

// 切换固定头部
const toggleFixedHeader = (val: boolean) => {
  appStore.updateLayoutSettings({ fixedHeader: val });
};

// 切换水印
const toggleWatermark = (val: boolean) => {
  appStore.toggleWatermark(val);
};

// 重置设置
const resetSettings = () => {
  appStore.resetSettings();
  ElMessage.success('已重置为默认设置');
};

// 关闭时的处理
const onClosed = () => {
  appStore.closeSettings();
};
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 0 4px;
}

.settings-section {
  margin-bottom: 24px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

// 主题色
.theme-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  &.active {
    .color-preview {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color-primary);
    }

    .color-name {
      color: var(--color-primary);
      font-weight: 600;
    }
  }

  .color-preview {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
  }

  .color-name {
    font-size: 12px;
    color: var(--color-text-secondary);
    transition: all 0.3s;
  }
}

// 布局模式
.layout-modes {
  display: flex;
  gap: 16px;
}

.layout-item {
  flex: 1;
  cursor: pointer;
  text-align: center;

  &.active {
    .layout-preview {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
    }

    .layout-name {
      color: var(--color-primary);
    }
  }
}

.layout-preview {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 10px;
  border: 2px solid var(--color-border-light);
  background: var(--color-bg-base);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;

  .preview-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 30%;
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  }

  .preview-header {
    position: absolute;
    right: 0;
    top: 0;
    left: 30%;
    height: 25%;
    background: #fff;
    border-bottom: 1px solid var(--color-border-light);
  }

  .preview-content {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 30%;
    top: 25%;
    background: #f1f5f9;
  }

  &.horizontal {
    .preview-sidebar {
      display: none;
    }

    .preview-header {
      left: 0;
      height: 30%;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    }

    .preview-content {
      left: 0;
      top: 30%;
    }
  }

  &.mix {
    .preview-sidebar {
      width: 15%;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    }

    &::before {
      content: '';
      position: absolute;
      left: 15%;
      top: 0;
      bottom: 0;
      width: 20%;
      background: #ffffff;
      border-right: 1px solid var(--color-border-light);
    }

    .preview-header {
      left: 35%;
    }

    .preview-content {
      left: 35%;
    }
  }
}

.layout-name {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text-regular);
}

// 开关列表
.switch-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 14px;
    color: var(--color-text-regular);
  }
}

// 底部按钮
.settings-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border-light);

  .el-button {
    width: 100%;
  }
}
</style>
