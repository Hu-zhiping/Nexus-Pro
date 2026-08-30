<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <button class="header-btn" type="button" title="切换语言" aria-label="切换语言">
      <SvgIcon name="ri:translate-2" :size="18" />
    </button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
v-for="lang in languages" :key="lang.value" :command="lang.value"
          :disabled="lang.value === appStore.layoutSettings.language">
          <span class="language-item">
            <span class="language-label">
              {{ lang.label }}
            </span>

            <SvgIcon v-if="lang.value === appStore.layoutSettings.language" name="ri:check-line" :size="16" />
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import useAppStore, { type Language } from "@/store/modules/app";

import SvgIcon from "@/components/SvgIcon/index.vue";

/* =========================================================
 * Languages
 * ========================================================= */

const languages: {
  label: string;
  value: Language;
}[] = [
    {
      label: "中文",
      value: "zh-CN",
    },
    {
      label: "English",
      value: "en",
    },
  ];

const appStore = useAppStore();

/* =========================================================
 * Change Language
 * ========================================================= */

function handleCommand(lang: Language) {
  if (lang === appStore.layoutSettings.language) {
    return;
  }

  appStore.setLanguage(lang);
}
</script>

<style scoped lang="scss">
/* =========================================================
 * Language Item
 * ========================================================= */

.language-item {
  display: flex;

  align-items: center;
  justify-content: space-between;

  width: 100%;

  gap: var(--space-5);
}

/* Label */

.language-label {
  flex: 1;

  color: var(--color-text-primary);
}

/* Selected */

.language-item :deep(.svg-icon-container) {
  flex-shrink: 0;

  color: var(--color-primary);
}
</style>
