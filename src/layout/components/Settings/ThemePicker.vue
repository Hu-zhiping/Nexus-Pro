<template>
  <div class="theme-picker">
    <!-- 主题模式 -->
    <div class="theme-picker__section">
      <div class="theme-picker__theme-switch">
        <el-switch
          v-model="isDarkMode"
          @change="toggleDarkMode"
          :active-value="true"
          :inactive-value="false"
        >
          <template #active-action>
            <el-icon><Moon /></el-icon>
          </template>
          <template #inactive-action>
            <el-icon><Sunny /></el-icon>
          </template>
        </el-switch>
        <span class="theme-picker__theme-label">{{ isDarkMode ? '暗色模式' : '亮色模式' }}</span>
      </div>
    </div>
    
    <!-- 预设颜色 -->
    <div class="theme-picker__colors">
      <div
        v-for="(color, index) in presetColors"
        :key="index"
        class="theme-picker__color-item"
        :class="{ 'is-active': currentColor === color }"
        :style="{ backgroundColor: color }"
        @click="changeThemeColor(color)"
      ></div>
    </div>
    
    <!-- 自定义颜色 -->
    <div class="theme-picker__custom">
      <el-color-picker
        v-model="customColor"
        :predefine="presetColors"
        @change="changeThemeColor"
        show-alpha
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Moon, Sunny } from '@element-plus/icons-vue';
import useAppStore from "@/store/modules/app";

const appStore = useAppStore();

// 预设颜色
const presetColors = [
  '#409EFF', // 默认蓝色
  '#67C23A', // 绿色
  '#E6A23C', // 黄色
  '#F56C6C', // 红色
  '#909399', // 灰色
  '#9370DB', // 紫色
  '#13C2C2', // 青色
  '#1890FF', // 亮蓝色
];

// 状态
const isDarkMode = ref(false);
const currentColor = ref('#409EFF');
const customColor = ref('#409EFF');

// 初始化
onMounted(() => {
  const savedTheme = localStorage.getItem('theme-mode');
  const savedColor = localStorage.getItem('theme-color');
  
  isDarkMode.value = savedTheme === 'dark';
  if (savedColor) {
    currentColor.value = savedColor;
    customColor.value = savedColor;
    applyThemeColor(savedColor);
  }
});

// 切换暗色模式
const toggleDarkMode = (value: boolean) => {
  document.documentElement.classList.toggle('dark', value);
  localStorage.setItem('theme-mode', value ? 'dark' : 'light');
};

// 更改主题颜色
const changeThemeColor = (color: string) => {
  currentColor.value = color;
  customColor.value = color;
  applyThemeColor(color);
  localStorage.setItem('theme-color', color);
};

// 应用主题颜色到CSS变量
const applyThemeColor = (color: string) => {
  const el = document.documentElement;
  
  // 设置主色
  el.style.setProperty('--el-color-primary', color);
  
  // 生成不同深浅的主题色
  for (let i = 1; i <= 9; i++) {
    const lightColor = lightenColor(color, i * 0.1);
    el.style.setProperty(`--el-color-primary-light-${i}`, lightColor);
  }
  
  // 设置暗色
  const darkColor = darkenColor(color, 0.1);
  el.style.setProperty('--el-color-primary-dark-2', darkColor);
};

// 辅助函数：使颜色变亮
const lightenColor = (color: string, amount: number): string => {
  try {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const lightenChannel = (c: number) => Math.round(c + (255 - c) * amount);
    
    const rr = Math.min(lightenChannel(r), 255).toString(16).padStart(2, '0');
    const gg = Math.min(lightenChannel(g), 255).toString(16).padStart(2, '0');
    const bb = Math.min(lightenChannel(b), 255).toString(16).padStart(2, '0');
    
    return `#${rr}${gg}${bb}`;
  } catch (e) {
    return color;
  }
};

// 辅助函数：使颜色变暗
const darkenColor = (color: string, amount: number): string => {
  try {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const darkenChannel = (c: number) => Math.round(c * (1 - amount));
    
    const rr = darkenChannel(r).toString(16).padStart(2, '0');
    const gg = darkenChannel(g).toString(16).padStart(2, '0');
    const bb = darkenChannel(b).toString(16).padStart(2, '0');
    
    return `#${rr}${gg}${bb}`;
  } catch (e) {
    return color;
  }
};
</script>

<style lang="scss" scoped>
.theme-picker {
  &__section {
    margin-bottom: 16px;
  }
  
  &__theme-switch {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  &__theme-label {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
  
  &__colors {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }
  
  &__color-item {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &.is-active {
      box-shadow: 0 0 0 2px var(--el-color-white), 0 0 0 4px var(--el-color-primary);
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: translate(-50%, -50%) rotate(45deg);
      }
    }
  }
  
  &__custom {
    display: flex;
    justify-content: flex-end;
  }
}
</style>