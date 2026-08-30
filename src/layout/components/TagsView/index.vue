<template>
  <div class="tags-view" @contextmenu.prevent>
    <el-tabs
type="card" class="tags-tabs" :model-value="activeTab" @tab-click="handleTabClick"
      @tab-remove="handleTabRemove">
      <el-tab-pane v-for="tab in tabs" :key="tab.path" :name="tab.path" :closable="!isAffix(tab)">
        <template #label>
          <span class="tab-label" @contextmenu.prevent.stop="openContextMenu($event, tab)">
            <i v-if="isAffix(tab)" class="tab-dot" />
            <span>{{ tab.title }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 右键菜单 -->
    <ul v-show="menu.visible" class="context-menu" :style="{ left: `${menu.x}px`, top: `${menu.y}px` }">
      <li @click="closeOthers">
        <SvgIcon name="ri:close-circle-line" size="14" />
        <span>关闭其他</span>
      </li>
      <li @click="closeLeft">
        <SvgIcon name="ri:arrow-left-circle-line" size="14" />
        <span>关闭左侧</span>
      </li>
      <li @click="closeRight">
        <SvgIcon name="ri:arrow-right-circle-line" size="14" />
        <span>关闭右侧</span>
      </li>
      <li class="context-menu__danger" @click="closeAll">
        <SvgIcon name="ri:close-line" size="14" />
        <span>关闭全部</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { TabsPaneContext } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import useAppStore, { type Tab } from "@/store/modules/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const tabs = computed(() => appStore.tabs);
const activeTab = computed(() => route.path);

const menu = reactive<{ visible: boolean; x: number; y: number; path: string }>({
  visible: false,
  x: 0,
  y: 0,
  path: "",
});

/** 固定标签（meta.affix，不可关闭） */
function isAffix(tab: Tab) {
  return tab.path === "/dashboard";
}

/** 初始化时把 meta.affix 的路由加入固定标签 */
function initAffixTabs() {
  router
    .getRoutes()
    .filter((r) => r.meta?.affix && r.meta?.title)
    .forEach((r) => {
      appStore.addTab({ path: r.path, title: r.meta!.title as string, name: r.name as string });
    });
}

/** 路由变化时自动加入标签页 */
watch(
  () => route.path,
  (path) => {
    if (!path || path === "/login" || path === "/404") return;

    appStore.addTab({
      path,
      title: (route.meta.title as string) || path,
      name: route.name as string,
      noCache: route.meta.noCache as boolean | undefined,
      ...(Object.keys(route.query).length ? { query: route.query as Record<string, string> } : {}),
    });
  },
  { immediate: true },
);

function handleTabClick(pane: TabsPaneContext) {
  const path = pane.paneName as string;
  if (path !== route.path) {
    router.push(path);
  }
}

function handleTabRemove(name: TabsPaneContext["paneName"]) {
  const path = String(name);
  const index = tabs.value.findIndex((t) => t.path === path);
  appStore.removeTab(path);

  if (route.path === path) {
    const next = tabs.value[Math.min(index, tabs.value.length - 1)];
    if (next) {
      router.push(next.path);
    }
  }
}

/* ---------- 右键菜单 ---------- */

/* 菜单尺寸：140px 宽 × 4 项，用于视口边缘防溢出收拢 */
const MENU_WIDTH = 140;
const MENU_HEIGHT = 170;

function openContextMenu(e: MouseEvent, tab: Tab) {
  e.stopPropagation();
  menu.visible = true;
  menu.x = Math.min(e.clientX, window.innerWidth - MENU_WIDTH - 8);
  menu.y = Math.min(e.clientY, window.innerHeight - MENU_HEIGHT - 8);
  menu.path = tab.path;
}

function hideContextMenu() {
  menu.visible = false;
}

function closeOthers() {
  appStore.closeOtherTabs(menu.path);
  hideContextMenu();
  if (route.path !== menu.path) router.push(menu.path);
}

function closeLeft() {
  appStore.closeLeftTabs(menu.path);
  hideContextMenu();
  if (!tabs.value.some((t) => t.path === route.path)) router.push(menu.path);
}

function closeRight() {
  appStore.closeRightTabs(menu.path);
  hideContextMenu();
  if (!tabs.value.some((t) => t.path === route.path)) router.push(menu.path);
}

function closeAll() {
  appStore.closeAllTabs();
  hideContextMenu();
  if (route.path !== "/dashboard") router.push("/dashboard");
}

onMounted(() => {
  initAffixTabs();
  document.addEventListener("click", hideContextMenu);
});
onBeforeUnmount(() => document.removeEventListener("click", hideContextMenu));
</script>

<style scoped lang="scss">
.tags-view {
  position: relative;
  flex-shrink: 0;
  height: var(--layout-tabs-height);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
}

.tags-tabs {
  height: 100%;
  padding: 0 var(--space-3);
  display: flex;
  align-items: stretch;

  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: none;
    height: 100%;
    display: flex;
    align-items: center;
  }

  /* EP 结构为 header > nav-wrap > nav-scroll > nav，中间两层需撑满并垂直居中 */
  :deep(.el-tabs__nav-wrap),
  :deep(.el-tabs__nav-scroll) {
    height: 100%;
    display: flex;
    align-items: center;
  }

  :deep(.el-tabs__nav) {
    border: none;
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  :deep(.el-tabs__item) {
    height: 28px;
    margin: 0;
    padding: 0 var(--space-3);
    border: none !important;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    background: transparent;
    transition: var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);

    &:hover {
      background: var(--color-bg-hover);
      color: var(--color-text-primary);
    }

    &.is-active {
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: var(--font-weight-medium);
    }
  }

  :deep(.el-tabs__item .el-icon-close) {
    margin-left: 2px;
    width: 14px;
    height: 14px;
    font-size: var(--font-size-xs);

    &::before {
      width: 100%;
      height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &:hover {
      background: var(--color-bg-hover);
      border-radius: 50%;
      color: var(--color-text-primary);
    }
  }
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  line-height: 1;
  padding: 0 2px;
}

.tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

.context-menu {
  position: fixed;
  z-index: 3000;
  margin: 0;
  padding: var(--space-1);
  list-style: none;
  min-width: 140px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);

  li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover {
      background: var(--color-bg-hover);
      color: var(--color-primary);
    }

    &.context-menu__danger:hover {
      background: color-mix(in srgb, var(--color-danger) 10%, transparent);
      color: var(--color-danger);
    }
  }
}
</style>
