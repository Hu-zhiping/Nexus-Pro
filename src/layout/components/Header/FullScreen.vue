<template>
  <button
class="header-btn" type="button" :title="isFullscreen ? '退出全屏' : '全屏'"
    :aria-label="isFullscreen ? '退出全屏' : '全屏'" @click="toggle">
    <SvgIcon :name="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'" :size="18" />
  </button>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";

import SvgIcon from "@/components/SvgIcon/index.vue";

const { isFullscreen, toggle } = useFullscreen();
</script>
