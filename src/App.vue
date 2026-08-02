<script setup lang="ts">
import { onMounted } from "vue";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import useAppStore from "@/store/modules/app";

const appStore = useAppStore();

onMounted(() => {
  appStore.init();
});
</script>

<template>
  <!-- ElConfigProvider：统一 size 与 z-index -->
  <el-config-provider :locale="zhCn" size="default" :z-index="3000">
    <router-view></router-view>
  </el-config-provider>
</template>

<style>
#app {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
</style>
