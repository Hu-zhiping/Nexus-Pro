import { defineStore } from "pinia";

export type ThemeType =
  | "periwinkle"
  | "purple"
  | "blue"
  | "green"
  | "cyan"
  | "orange"
  | "pink";
export type LayoutMode = "vertical";
export type Language = "zh-CN" | "en";
export type SidebarTheme = "dark" | "light";

export interface Tab {
  title: string;
  path: string;
  name?: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
  /** 为 true 时不缓存（对应路由 meta.noCache） */
  noCache?: boolean;
}

export interface LayoutSettings {
  layoutMode: LayoutMode;
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

/* 主题色映射：清新糖果系预设（参照用户提供的参考色板），
   每个色相取「观感最接近参考、且白字对比度尽量达标」的档位；
   hover/active/浅色阶由 applyThemeColor 按明暗模式自动推导 */
export const themeColors: Record<ThemeType, string> = {
  periwinkle: "#6366f1", // 蓝紫（indigo-500，长春花蓝）
  purple: "#9333ea", // 浅紫（purple-600，压深保白字可读）
  blue: "#2563eb", // 亮蓝（默认锚点，企业级钴蓝）
  green: "#15803d", // 嫩绿（green-700，清新且白字达标）
  cyan: "#0284c7", // 青蓝（sky-600，清爽天青）
  orange: "#ea580c", // 活力橙（orange-600，中后台经典橙）
  pink: "#db2777", // 玫粉（pink-600，明快玫红粉）
};

const DEFAULT_THEME: ThemeType = "blue";

/* 兼容历史持久化数据：未知主题键回退默认 */
function resolveTheme(theme: ThemeType): ThemeType {
  return themeColors[theme] ? theme : DEFAULT_THEME;
}

const defaultSettings: LayoutSettings = {
  layoutMode: "vertical",
  sidebarWidth: 240,
  sidebarCollapsedWidth: 64,
  showTagsView: true,
  showBreadcrumb: true,
  showFooter: false,
  fixedHeader: true,
  theme: "blue",
  sidebarTheme: "light",
  isDark: false,
  language: "zh-CN",
  showWatermark: false,
  watermarkText: "Nexus Data Sync",
  grayMode: false,
  colorWeak: false,
};

/* 颜色工具：将 hex 颜色与目标色按占比混合，用于生成主色阶 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function mix(hex: string, target: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const lr = Math.round(r + (target[0] - r) * amount);
  const lg = Math.round(g + (target[1] - g) * amount);
  const lb = Math.round(b + (target[2] - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];
/* 深色模式的色阶混合基准：与 --color-bg-card（#111827）同源，
   使 light 阶在暗色下向底色混合而非向白色，避免 EP 暗色变量被行内样式覆盖后发白 */
const DARK_BG: [number, number, number] = [17, 24, 39];

const useAppStore = defineStore("appStore", {
  state: () => ({
    isCollapse: false,
    isMobile: false,
    mobileSidebarOpen: false,
    showSettings: false,
    tabs: [] as Tab[],
    layoutSettings: { ...defaultSettings },
  }),

  getters: {
    primaryColor(): string {
      return themeColors[resolveTheme(this.layoutSettings.theme)];
    },

    sidebarActualWidth(): number {
      return this.isCollapse ? this.layoutSettings.sidebarCollapsedWidth : this.layoutSettings.sidebarWidth;
    },
  },

  actions: {
    toggleSidebar() {
      if (this.isMobile) {
        this.mobileSidebarOpen = !this.mobileSidebarOpen;
        return;
      }
      this.isCollapse = !this.isCollapse;
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.isCollapse = collapsed;
    },

    openMobileSidebar() {
      if (this.isMobile) this.mobileSidebarOpen = true;
    },

    closeMobileSidebar() {
      this.mobileSidebarOpen = false;
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
        // 保留固定标签（/dashboard）
        this.tabs = this.tabs.filter((t, i) => i >= index || t.path === "/dashboard");
      }
    },

    closeRightTabs(path: string) {
      const index = this.tabs.findIndex((t) => t.path === path);
      if (index !== -1) {
        // 保留固定标签（/dashboard）
        this.tabs = this.tabs.filter((t, i) => i <= index || t.path === "/dashboard");
      }
    },

    setTheme(theme: ThemeType) {
      this.layoutSettings.theme = theme;
      this.applyThemeColor();
    },

    setSidebarTheme(theme: SidebarTheme) {
      this.layoutSettings.sidebarTheme = theme;
      this.applySidebarTheme();
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
      const color = themeColors[resolveTheme(this.layoutSettings.theme)];
      const isDark = this.layoutSettings.isDark;
      const root = document.documentElement;

      /* 深色模式下 light 阶向暗色底混合（与 EP dark 变量策略一致），
         浅色模式向白色混合；否则深色下 plain 按钮/标签悬停底色会发白 */
      const lighten = (amount: number) => mix(color, isDark ? DARK_BG : WHITE, amount);
      const darken = (amount: number) => mix(color, BLACK, amount);

      root.style.setProperty("--main-color", color);
      root.style.setProperty("--el-color-primary", color);

      // 同步自定义 Token（侧边栏激活态、Logo、面包屑、链接等）
      root.style.setProperty("--color-primary", color);
      root.style.setProperty("--color-primary-hover", isDark ? darken(0.2) : lighten(0.2));
      root.style.setProperty("--color-primary-active", darken(0.2));
      // 主色浅色调（标签底/图标底/选中态）：深色模式下用暗色调，避免高亮区发白
      root.style.setProperty("--color-primary-light", isDark ? darken(0.8) : lighten(0.9));

      // 生成 EP light-1 到 light-9 色阶
      for (let i = 1; i <= 9; i++) {
        root.style.setProperty(`--el-color-primary-light-${i}`, lighten(i / 10));
      }
      root.style.setProperty("--el-color-primary-dark-2", darken(0.2));
    },

    applyDarkMode() {
      const isDark = this.layoutSettings.isDark;
      document.documentElement.classList.toggle("dark", isDark);
      // class 切换后重算主题色阶（light 阶的混合基准随明暗模式变化）
      this.applyThemeColor();
    },

    applySidebarWidth() {
      const root = document.documentElement;
      root.style.setProperty("--layout-sidebar-width", `${this.layoutSettings.sidebarWidth}px`);
      root.style.setProperty("--layout-sidebar-collapse-width", `${this.layoutSettings.sidebarCollapsedWidth}px`);
    },

    /* 同步侧边栏配色到 <html data-sidebar>，供 theme.css 切换侧边栏 token */
    applySidebarTheme() {
      document.documentElement.dataset.sidebar = this.layoutSettings.sidebarTheme;
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
      this.applySidebarTheme();
      this.applySidebarWidth();
      this.applyFilter();
    },

    init() {
      // 自愈历史持久化的未知主题键
      this.layoutSettings.theme = resolveTheme(this.layoutSettings.theme);
      this.applySettings();
      const checkMobile = () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        if (this.isMobile) {
          this.mobileSidebarOpen = false;
        } else if (wasMobile) {
          this.mobileSidebarOpen = false;
          if (!this.isCollapse) this.isCollapse = false;
        }
      };
      window.addEventListener("resize", checkMobile);
      checkMobile();
    },
  },

  persist: {
    key: "app-store-nexus-sync",
    pick: ["tabs", "isCollapse", "layoutSettings"],
  },
});

export default useAppStore;
