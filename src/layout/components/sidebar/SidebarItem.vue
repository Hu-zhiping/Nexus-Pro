<template>
  <el-sub-menu v-if="hasChildren" :index="item.path" popper-class="side-popper">
    <template #title>
      <SvgIcon v-if="item.meta?.icon" :name="item.meta.icon" size="18" />
      <span>{{ item.meta?.title || item.name }}</span>
    </template>

    <SidebarItem v-for="child in visibleChildren" :key="child.path" :item="child" />
  </el-sub-menu>

  <el-menu-item v-else :index="item.path" :disabled="item.meta?.disabled">
    <SvgIcon v-if="item.meta?.icon" :name="item.meta.icon" size="18" />
    <template #title>
      <span>{{ item.meta?.title || item.name }}</span>
    </template>
  </el-menu-item>
</template>

<script lang="ts">
export default { name: "SidebarItem" };
</script>

<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";
import type { AppRouteRecordRaw } from "@/router";
import SvgIcon from "@/components/svg-icon/index.vue";

const props = defineProps({
  item: { type: Object as PropType<AppRouteRecordRaw>, required: true },
});

const visibleChildren = computed(() => {
  if (!props.item.children) return [];
  return props.item.children.filter((child) => !child.meta?.hidden);
});

const hasChildren = computed(() => visibleChildren.value.length > 0);
</script>
