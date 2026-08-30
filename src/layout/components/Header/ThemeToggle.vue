<template>
  <button
class="header-btn" type="button" :title="appStore.layoutSettings.isDark ? '切换到亮色' : '切换到深色'"
    :aria-label="appStore.layoutSettings.isDark ? '切换到亮色' : '切换到深色'" @click="appStore.toggleDarkMode()">
    <SvgIcon :name="appStore.layoutSettings.isDark ? 'ri:sun-line' : 'ri:moon-line'" :size="18" />
  </button>
</template>

<script setup lang="ts">
import useAppStore from "@/store/modules/app";
import SvgIcon from "@/components/SvgIcon/index.vue";

const appStore = useAppStore();
</script>
