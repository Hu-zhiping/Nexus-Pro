<template>
  <el-drawer v-model="visible" title="布局设置" size="340px" class="settings-drawer" @closed="onClosed">
    <div class="settings-body">
      <div class="settings-section">
        <h3 class="section-title">
          <SvgIcon name="ri:palette-line" size="16" />
          主题色
        </h3>
        <div class="theme-colors">
          <div
            v-for="option in themeOptions"
            :key="option.key"
            class="color-option"
            :class="{ 'is-active': settings.theme === option.key }"
            @click="changeTheme(option.key)"
          >
            <div class="color-swatch" :style="{ background: option.gradient }">
              <SvgIcon v-if="settings.theme === option.key" name="ri:check-line" size="14" color="#fff" />
            </div>
            <span class="color-label">{{ option.name }}</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">
          <SvgIcon name="ri:layout-left-line" size="16" />
          菜单风格
        </h3>
        <el-segmented
          v-model="sidebarTheme"
          size="default"
          :options="sidebarThemeOptions"
          class="menu-theme-seg"
          @change="changeSidebarTheme"
        />
      </div>

      <div class="settings-section">
        <h3 class="section-title">
          <SvgIcon name="ri:eye-line" size="16" />
          界面显示
        </h3>
        <div class="switch-list">
          <div class="switch-row">
            <div class="switch-info">
              <SvgIcon name="ri:contrast-2-line" size="15" class="switch-icon" />
              <span>灰色模式</span>
            </div>
            <el-switch v-model="grayMode" @change="(val: any) => appStore.toggleGrayMode(val)" />
          </div>
          <div class="switch-row">
            <div class="switch-info">
              <SvgIcon name="ri:sun-cloudy-line" size="15" class="switch-icon" />
              <span>色弱模式</span>
            </div>
            <el-switch v-model="colorWeak" @change="(val: any) => appStore.toggleColorWeak(val)" />
          </div>
          <div class="switch-row">
            <div class="switch-info">
              <SvgIcon name="ri:price-tag-7-line" size="15" class="switch-icon" />
              <span>显示标签页</span>
            </div>
            <el-switch v-model="settings.showTagsView" @change="(val: any) => appStore.toggleTagsView(val)" />
          </div>
          <div class="switch-row">
            <div class="switch-info">
              <SvgIcon name="ri:breadcrumb-line" size="15" class="switch-icon" />
              <span>显示面包屑</span>
            </div>
            <el-switch v-model="settings.showBreadcrumb" @change="(val: any) => appStore.toggleBreadcrumb(val)" />
          </div>
          <div class="switch-row">
            <div class="switch-info">
              <SvgIcon name="ri:layout-bottom-line" size="15" class="switch-icon" />
              <span>显示页脚</span>
            </div>
            <el-switch v-model="settings.showFooter" @change="(val: any) => appStore.toggleFooter(val)" />
          </div>
          <div class="switch-row">
            <div class="switch-info">
              <SvgIcon name="ri:pin-line" size="15" class="switch-icon" />
              <span>固定头部</span>
            </div>
            <el-switch
              v-model="settings.fixedHeader"
              @change="(val: any) => appStore.updateLayoutSettings({ fixedHeader: val })"
            />
          </div>
          <div class="switch-row">
            <div class="switch-info">
              <SvgIcon name="ri:water-flash-line" size="15" class="switch-icon" />
              <span>显示水印</span>
            </div>
            <el-switch v-model="settings.showWatermark" @change="(val: any) => appStore.toggleWatermark(val)" />
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <el-button type="primary" @click="resetSettings">
          <SvgIcon name="ri:refresh-line" size="14" />
          重置所有设置
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import SvgIcon from "@/components/svg-icon/index.vue";
import useAppStore, { themeColors, type SidebarTheme, type ThemeType } from "@/store/modules/app";

const appStore = useAppStore();

const grayMode = ref(appStore.layoutSettings.grayMode);
const colorWeak = ref(appStore.layoutSettings.colorWeak);
const sidebarTheme = ref<SidebarTheme>(appStore.layoutSettings.sidebarTheme);

const sidebarThemeOptions = [
  { label: "深色", value: "dark" },
  { label: "浅色", value: "light" },
];

const visible = computed({
  get: () => appStore.showSettings,
  set: (val) => {
    if (!val) appStore.closeSettings();
  },
});

const settings = computed(() => appStore.layoutSettings);

const themeGradients: Record<ThemeType, string> = {
  indigo: "linear-gradient(135deg, #165dff, #457dff)",
  teal: "linear-gradient(135deg, #00a870, #33b98d)",
  violet: "linear-gradient(135deg, #722ed1, #8e58da)",
  rose: "linear-gradient(135deg, #f53f3f, #f76565)",
  amber: "linear-gradient(135deg, #fa8c16, #fba345)",
};

const themeNames: Record<ThemeType, string> = {
  indigo: "深蓝",
  teal: "翠绿",
  violet: "紫罗兰",
  rose: "绯红",
  amber: "琥珀",
};

const themeOptions = computed(() => {
  return (Object.entries(themeColors) as [ThemeType, string][]).map(([key]) => ({
    key,
    name: themeNames[key],
    gradient: themeGradients[key],
  }));
});

const changeTheme = (theme: ThemeType) => {
  appStore.setTheme(theme);
  ElMessage.success("主题已切换");
};

const changeSidebarTheme = (theme: SidebarTheme | string | number | boolean) => {
  appStore.setSidebarTheme(theme as SidebarTheme);
};

const resetSettings = () => {
  appStore.resetSettings();
  grayMode.value = false;
  colorWeak.value = false;
  ElMessage.success("已重置为默认设置");
};

const onClosed = () => {
  appStore.closeSettings();
};
</script>

<style scoped>
.settings-body {
  padding: 0;
}
.settings-section {
  margin-bottom: 28px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-lighter);
}
.section-title :deep(.svg-icon) {
  color: var(--color-primary);
}
.theme-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform var(--transition-fast);
}
.color-option:hover {
  transform: translateY(-2px);
}
.color-option.is-active .color-swatch {
  box-shadow:
    0 0 0 2px var(--bg-card),
    0 0 0 4px var(--color-primary);
  transform: scale(1.1);
}
.color-option.is-active .color-label {
  color: var(--color-primary);
  font-weight: 500;
}
.color-swatch {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  box-shadow: var(--el-box-shadow);
  transition: all var(--transition-base);
}
.color-label {
  font-size: 12px;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}
.switch-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}
.switch-row:hover {
  background: var(--bg-hover);
}
.switch-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.switch-icon {
  color: var(--text-secondary);
}
.switch-info span {
  font-size: 14px;
  color: var(--text-regular);
}
.settings-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-lighter);
}
.settings-footer .el-button {
  width: 100%;
  height: 38px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}
.settings-footer .el-button :deep(.svg-icon) {
  margin-right: 6px;
}
</style>
