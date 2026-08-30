<template>
  <main class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";

import useAppStore from "@/store/modules/app";

const appStore = useAppStore();

const cachedViews = computed(() =>
  appStore.tabs.filter((tab) => tab.name && !tab.noCache).map((tab) => tab.name as string),
);
</script>

<style scoped lang="scss">
/* 滚动由外层 .layout__content 统一承担，这里只负责内边距与底色 */
.app-main {
  min-height: 0;
  padding: var(--layout-content-padding);
  background: var(--color-bg-page);
}

/* 页面切换过渡：从右淡入，向右淡出 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

@media (max-width: 768px) {
  .app-main {
    padding: var(--space-4);
  }
}
</style>
