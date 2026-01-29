import { defineStore } from "pinia";

export type ThemeType = 'blue' | 'purple' | 'green' | 'orange' | 'red';
export type LayoutMode = 'vertical' | 'horizontal' | 'mix';
export type Language = 'zh-CN' | 'en';

export interface Tab {
  title: string;
  path: string;
  name?: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface LayoutSettings {
  // 布局模式
  layoutMode: LayoutMode;
  // 侧边栏
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  sidebarCollapsedWidth: number;
  // 标签页
  showTagsView: boolean;
  tagsViewHeight: number;
  // 面包屑
  showBreadcrumb: boolean;
  // 页脚
  showFooter: boolean;
  // 固定头部
  fixedHeader: boolean;
  // 主题
  theme: ThemeType;
  // 暗色模式
  isDark: boolean;
  // 语言
  language: Language;
  // 水印
  showWatermark: boolean;
  watermarkText: string;
  // 灰色模式
  grayMode: boolean;
  // 色弱模式
  colorWeak: boolean;
}

// 主题色配置 - 现代渐变配色
export const themeColors: Record<ThemeType, string> = {
  blue: '#3b82f6',      // 科技蓝
  purple: '#8b5cf6',    // 紫罗兰
  green: '#10b981',     // 翡翠绿
  orange: '#f97316',    // 活力橙
  red: '#ef4444',       // 玫瑰红
};

const defaultSettings: LayoutSettings = {
  layoutMode: 'vertical',
  sidebarCollapsed: false,
  sidebarWidth: 220,
  sidebarCollapsedWidth: 64,
  showTagsView: true,
  tagsViewHeight: 40,
  showBreadcrumb: true,
  showFooter: false,
  fixedHeader: true,
  theme: 'blue',
  isDark: false,
  language: 'zh-CN',
  showWatermark: false,
  watermarkText: 'Vue Admin',
  grayMode: false,
  colorWeak: false,
};

const useAppStore = defineStore("appStore", {
  state: () => ({
    // 侧边栏状态
    isCollapse: false,
    // 设置面板显示状态
    showSettings: false,
    // 移动端菜单显示状态
    mobileMenuVisible: false,
    // 标签页
    tabs: [] as Tab[],
    // 布局设置
    layoutSettings: { ...defaultSettings } as LayoutSettings,
  }),

  getters: {
    // 获取当前激活的标签页
    activeTab(): Tab | undefined {
      return this.tabs.find(tab => tab.path === window.location.pathname);
    },
    // 当前主题色
    primaryColor(): string {
      return themeColors[this.layoutSettings.theme];
    },
    // 侧边栏实际宽度
    sidebarActualWidth(): number {
      return this.isCollapse 
        ? this.layoutSettings.sidebarCollapsedWidth 
        : this.layoutSettings.sidebarWidth;
    },
  },

  actions: {
    // 切换侧边栏折叠状态
    toggleSidebar() {
      this.isCollapse = !this.isCollapse;
    },

    // 设置侧边栏折叠状态
    setSidebarCollapsed(collapsed: boolean) {
      this.isCollapse = collapsed;
    },

    // 打开设置面板
    openSettings() {
      this.showSettings = true;
    },

    // 关闭设置面板
    closeSettings() {
      this.showSettings = false;
    },

    // 切换移动端菜单
    toggleMobileMenu() {
      this.mobileMenuVisible = !this.mobileMenuVisible;
    },

    // ========== 标签页操作 ==========
    addTab(tab: Tab) {
      if (!tab.path || tab.path === '/') return;
      if (!this.tabs.some(t => t.path === tab.path)) {
        this.tabs.push(tab);
      }
    },

    removeTab(path: string) {
      const index = this.tabs.findIndex(t => t.path === path);
      if (index !== -1) {
        this.tabs.splice(index, 1);
      }
    },

    closeOtherTabs(path: string) {
      this.tabs = this.tabs.filter(tab => 
        tab.path === path || tab.path === '/dashboard'
      );
    },

    closeAllTabs() {
      this.tabs = this.tabs.filter(tab => tab.path === '/dashboard');
    },

    closeLeftTabs(path: string) {
      const index = this.tabs.findIndex(t => t.path === path);
      if (index > 0) {
        this.tabs = this.tabs.slice(index);
      }
    },

    closeRightTabs(path: string) {
      const index = this.tabs.findIndex(t => t.path === path);
      if (index !== -1 && index < this.tabs.length - 1) {
        this.tabs = this.tabs.slice(0, index + 1);
      }
    },

    // ========== 布局设置 ==========
    updateLayoutSettings(settings: Partial<LayoutSettings>) {
      this.layoutSettings = {
        ...this.layoutSettings,
        ...settings,
      };
      this.applySettings();
    },

    // 切换布局模式
    setLayoutMode(mode: LayoutMode) {
      this.layoutSettings.layoutMode = mode;
      this.applySettings();
    },

    // 切换主题
    setTheme(theme: ThemeType) {
      this.layoutSettings.theme = theme;
      this.applyThemeColor();
    },

    // 切换暗色模式
    toggleDarkMode(isDark?: boolean) {
      this.layoutSettings.isDark = isDark ?? !this.layoutSettings.isDark;
      this.applyDarkMode();
    },

    // 切换标签页显示
    toggleTagsView(show: boolean) {
      this.layoutSettings.showTagsView = show;
    },

    // 切换面包屑显示
    toggleBreadcrumb(show: boolean) {
      this.layoutSettings.showBreadcrumb = show;
    },

    // 切换页脚显示
    toggleFooter(show: boolean) {
      this.layoutSettings.showFooter = show;
    },

    // 切换水印
    toggleWatermark(show: boolean) {
      this.layoutSettings.showWatermark = show;
    },

    // 切换灰色模式
    toggleGrayMode(enable: boolean) {
      this.layoutSettings.grayMode = enable;
      this.applyGrayMode();
    },

    // 切换色弱模式
    toggleColorWeak(enable: boolean) {
      this.layoutSettings.colorWeak = enable;
      this.applyColorWeak();
    },

    // 设置语言
    setLanguage(lang: Language) {
      this.layoutSettings.language = lang;
      // 可以在这里添加 i18n 切换逻辑
    },

    // 重置所有设置
    resetSettings() {
      this.layoutSettings = { ...defaultSettings };
      this.isCollapse = false;
      this.applySettings();
    },

    // ========== 应用设置 ==========
    applySettings() {
      this.applyThemeColor();
      this.applyDarkMode();
      this.applyGrayMode();
      this.applyColorWeak();
      this.saveSettings();
    },

    applyThemeColor() {
      const color = themeColors[this.layoutSettings.theme];
      document.documentElement.style.setProperty('--color-primary', color);
      // 生成不同深度的颜色
      document.documentElement.style.setProperty('--el-color-primary', color);
      // 同步更新菜单激活颜色和背景
      document.documentElement.style.setProperty('--color-sidebar-text-active', color);
      document.documentElement.style.setProperty('--color-sidebar-active-bg', `${color}1a`); // 10% 透明度
    },

    applyDarkMode() {
      if (this.layoutSettings.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    applyGrayMode() {
      const html = document.documentElement;
      if (this.layoutSettings.grayMode) {
        html.style.filter = 'grayscale(100%)';
      } else {
        html.style.filter = '';
      }
    },

    applyColorWeak() {
      const html = document.documentElement;
      if (this.layoutSettings.colorWeak) {
        html.style.filter = 'invert(80%)';
      } else if (!this.layoutSettings.grayMode) {
        html.style.filter = '';
      }
    },

    // 保存设置到 localStorage
    saveSettings() {
      localStorage.setItem('layout-settings', JSON.stringify(this.layoutSettings));
    },

    // 从 localStorage 加载设置
    loadSettings() {
      const saved = localStorage.getItem('layout-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.layoutSettings = { ...defaultSettings, ...parsed };
          this.applySettings();
        } catch (e) {
          console.error('Failed to load settings:', e);
        }
      }
    },

    // 初始化
    init() {
      this.loadSettings();
      // 应用主题色
      this.applyThemeColor();
      // 监听窗口大小变化
      const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile && !this.isCollapse) {
          this.isCollapse = true;
        }
      };
      window.addEventListener('resize', handleResize);
      handleResize();
    },
  },

  persist: {
    key: 'app-store',
    paths: ['tabs', 'isCollapse', 'layoutSettings'],
  }
});

export default useAppStore;
