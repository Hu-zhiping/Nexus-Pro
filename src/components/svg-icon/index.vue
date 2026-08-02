<template>
  <i class="svg-icon-container" :style="containerStyle">
    <Icon :icon="name" />
  </i>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = withDefaults(
  defineProps<{
    /** 图标名，如 "ri:search-line" */
    name: string;
    /** 图标尺寸（px 数字或任意 css 长度） */
    size?: number | string;
    /** 图标颜色，默认跟随文字颜色 */
    color?: string;
  }>(),
  { size: 16, color: "" },
);

const containerStyle = computed(() => {
  // 模板传入的 size="16" 是字符串，统一补 px
  const size = typeof props.size === "number" || /^\d+(\.\d+)?$/.test(String(props.size)) ? `${props.size}px` : props.size;
  return {
    width: size,
    height: size,
    color: props.color || "currentcolor",
  };
});
</script>

<style scoped>
.svg-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}
</style>
