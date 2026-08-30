<template>
  <!-- 有子菜单 -->
  <el-sub-menu v-if="item.children?.length" :index="item.path">
    <template #title>
      <SvgIcon v-if="item.icon" :name="item.icon" :size="18" />

      <span>{{ item.title }}</span>
    </template>

    <SidebarItem v-for="child in item.children" :key="child.path" :item="child" />
  </el-sub-menu>

  <!-- 叶子菜单 -->
  <el-menu-item v-else :index="item.path" :disabled="item.disabled">
    <SvgIcon v-if="item.icon" :name="item.icon" :size="18" />

    <template #title>
      {{ item.title }}
    </template>
  </el-menu-item>
</template>

<script setup lang="ts">
import SvgIcon from "@/components/SvgIcon/index.vue";
import type { MenuVO } from "@/types/menu";

defineProps<{
  item: MenuVO;
}>();
</script>
