<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Nexus N 字标：左竖笔画 → 数据链路斜线 → 右竖笔画，圆角端点 -->
    <path
      d="M6.5 18.5V5.5L17.5 18.5V5.5"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 渲染尺寸（px 数字或任意 css 长度） */
    size?: number | string;
    /** 描边宽度：小尺寸下可加粗保证辨识度 */
    strokeWidth?: number | string;
  }>(),
  { size: 20, strokeWidth: 3 },
);
</script>
