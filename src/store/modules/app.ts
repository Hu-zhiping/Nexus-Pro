import { defineStore } from "pinia";

export type ThemeType = "teal" | "indigo" | "violet" | "rose" | "amber";
export type LayoutMode = "vertical";
export type Language = "zh-CN" | "en";
export type SidebarTheme = "dark" | "light";

export interface Tab {
  title: string;
  path: string;
  name?: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface LayoutSettings {
  layoutMode: LayoutMode;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  sidebarCollapsedWidth: number;
  showTagsView: boolean;
  showBreadcrumb: boolean;
  showFooter: boolean;
  fixedHeader: boolean;
  theme: ThemeType;
  sidebarTheme: SidebarTheme;
  isDark: boolean;
  language: Language;
  showWatermark: boolean;
  watermarkText: string;
  grayMode: boolean;
  colorWeak: boolean;
}

/* 主题色映射（企业级深饱和色板） */
export const themeColors: Record<ThemeType, string> = {
  indigo: "#165dff", // 深蓝（Arco 蓝，与 --color-primary 一致）
  teal: "#00a870", // 翠绿（TDesign 翡翠绿）
  violet: "#722ed1", // 紫罗兰（Ant 深紫）
  rose: "#f53f3f", // 绯红（Arco 红，与 --color-danger 一致）
  amber: "#fa8c16", // 琥珀（Ant 金橙）
};

const defaultSettings: LayoutSettings = {
  layoutMode: "vertical",
  sidebarCollapsed: false,
  sidebarWidth: 230,
  sidebarCollapsedWidth: 64,
  showTagsView: true,
  showBreadcrumb: true,
  showFooter: false,
  fixedHeader: true,
  theme: "indigo",
  sidebarTheme: "dark",
  isDark: false,
  language: "zh-CN",
  showWatermark: false,
  watermarkText: "Nexus Pro",
  grayMode: false,
  colorWeak: false,
};

const useAppStore = defineStore("appStore", {
  state: () => ({
    isCollapse: false,
    showSettings: false,
    tabs: [] as Tab[],
    layoutSettings: { ...defaultSettings },
  }),

  getters: {
    primaryColor(): string {
      return themeColors[this.layoutSettings.theme];
    },

    sidebarActualWidth(): number {
      return this.isCollapse ? this.layoutSettings.sidebarCollapsedWidth : this.layoutSettings.sidebarWidth;
    },
  },

  actions: {
    toggleSidebar() {
      this.isCollapse = !this.isCollapse;
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.isCollapse = collapsed;
    },

    openSettings() {
      this.showSettings = true;
    },

    closeSettings() {
      this.showSettings = false;
    },

    // Tabs
    addTab(tab: Tab) {
      if (!tab.path || tab.path === "/") return;
      if (!this.tabs.some((t) => t.path === tab.path)) {
        this.tabs.push(tab);
      }
    },

    removeTab(path: string) {
      this.tabs = this.tabs.filter((t) => t.path !== path);
    },

    closeOtherTabs(path: string) {
      this.tabs = this.tabs.filter((tab) => tab.path === path || tab.path === "/dashboard");
    },

    closeAllTabs() {
      this.tabs = this.tabs.filter((tab) => tab.path === "/dashboard");
    },

    closeLeftTabs(path: string) {
      const index = this.tabs.findIndex((t) => t.path === path);
      if (index > 0) {
        this.tabs = this.tabs.slice(index);
      }
    },

    closeRightTabs(path: string) {
      const index = this.tabs.findIndex((t) => t.path === path);
      if (index !== -1) {
        this.tabs = this.tabs.slice(0, index + 1);
      }
    },

    setTheme(theme: ThemeType) {
      this.layoutSettings.theme = theme;
      this.applyThemeColor();
    },

    setSidebarTheme(theme: SidebarTheme) {
      this.layoutSettings.sidebarTheme = theme;
    },

    toggleDarkMode(isDark?: boolean) {
      this.layoutSettings.isDark = isDark ?? !this.layoutSettings.isDark;
      this.applyDarkMode();
    },

    toggleTagsView(show: boolean) {
      this.layoutSettings.showTagsView = show;
    },

    toggleBreadcrumb(show: boolean) {
      this.layoutSettings.showBreadcrumb = show;
    },

    toggleFooter(show: boolean) {
      this.layoutSettings.showFooter = show;
    },

    toggleWatermark(show: boolean) {
      this.layoutSettings.showWatermark = show;
    },

    toggleGrayMode(enable: boolean) {
      this.layoutSettings.grayMode = enable;
      this.applyFilter();
    },

    toggleColorWeak(enable: boolean) {
      this.layoutSettings.colorWeak = enable;
      this.applyFilter();
    },

    setLanguage(lang: Language) {
      this.layoutSettings.language = lang;
    },

    updateLayoutSettings(settings: Partial<LayoutSettings>) {
      this.layoutSettings = { ...this.layoutSettings, ...settings };
    },

    resetSettings() {
      this.layoutSettings = { ...defaultSettings };
      this.isCollapse = false;
      this.applySettings();
    },

    // Apply Settings
    applyThemeColor() {
      const color = themeColors[this.layoutSettings.theme];
      const root = document.documentElement;

      // 计算主色的 RGB 分量
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // 亮色变体（与白色混合）
      const lighten = (amount: number) => {
        const lr = Math.round(r + (255 - r) * amount);
        const lg = Math.round(g + (255 - g) * amount);
        const lb = Math.round(b + (255 - b) * amount);
        return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
      };

      // 暗色变体
      const darken = (amount: number) => {
        const dr = Math.round(r * (1 - amount));
        const dg = Math.round(g * (1 - amount));
        const db = Math.round(b * (1 - amount));
        return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
      };

      // 设置主色变量
      root.style.setProperty("--main-color", color);
      root.style.setProperty("--el-color-primary", color);

      // 同步自定义 Token（侧边栏激活态、Logo、面包屑、链接等）
      root.style.setProperty("--color-primary", color);
      root.style.setProperty("--color-primary-hover", lighten(0.2));
      root.style.setProperty("--color-primary-active", darken(0.2));

      // 生成 EP light-1 到 light-9 色阶
      for (let i = 1; i <= 9; i++) {
        root.style.setProperty(`--el-color-primary-light-${i}`, lighten(i / 10));
      }
      root.style.setProperty("--el-color-primary-dark-2", darken(0.2));
    },

    applyDarkMode() {
      document.documentElement.classList.toggle("dark", this.layoutSettings.isDark);
    },

    applyFilter() {
      const { grayMode, colorWeak } = this.layoutSettings;
      let filter = "";
      if (grayMode) filter = "grayscale(100%)";
      else if (colorWeak) filter = "invert(80%)";
      document.documentElement.style.filter = filter;
    },

    applySettings() {
      this.applyThemeColor();
      this.applyDarkMode();
      this.applyFilter();
    },

    init() {
      this.applySettings();
      const checkMobile = () => {
        if (window.innerWidth < 768 && !this.isCollapse) {
          this.isCollapse = true;
        }
      };
      window.addEventListener("resize", checkMobile);
      checkMobile();
    },
  },

  persist: {
    key: "app-store",
    pick: ["tabs", "isCollapse", "layoutSettings"],
  },
});

export default useAppStore;
