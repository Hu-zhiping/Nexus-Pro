<template>
  <div class="icon-picker">
    <el-popover
v-model:visible="visible" trigger="click" :width="420" placement="bottom-start"
      popper-class="icon-picker-popper" @show="ensureLoaded">
      <template #reference>
        <button type="button" class="icon-picker__trigger" :class="{ 'is-empty': !modelValue }">
          <SvgIcon v-if="modelValue" :name="modelValue" :size="18" />
          <span class="icon-picker__value" :title="modelValue">{{ modelValue || placeholder }}</span>

          <SvgIcon
v-if="modelValue" class="icon-picker__clear" name="ri:close-circle-fill" :size="15"
            @click.stop="clear" />
        </button>
      </template>

      <div v-loading="loading" class="icon-picker__panel">
        <el-input v-model="search" placeholder="搜索图标名称（英文，如 dashboard）" clearable>
          <template #prefix>
            <SvgIcon name="ri:search-line" :size="14" />
          </template>
        </el-input>

        <div class="icon-picker__meta">
          {{ searchKeyword ? `匹配 ${shownIcons.length} 个图标` : `常用图标 ${shownIcons.length} 个，搜索可查看全部 ${allCount} 个` }}
        </div>

        <el-scrollbar max-height="300px">
          <div v-if="shownIcons.length" class="icon-picker__grid">
            <button
v-for="name in shownIcons" :key="name" type="button" class="grid-cell" :title="name"
              :class="{ 'is-selected': name === modelValue }" @click="select(name)">
              <Icon :icon="name" width="20" height="20" />
            </button>
          </div>

          <div v-else class="icon-picker__empty">
            <SvgIcon name="ri:search-eye-line" :size="28" />
            <span>未找到匹配图标</span>
          </div>
        </el-scrollbar>

        <div class="icon-picker__footer">
          当前值：<span class="icon-picker__current">{{ modelValue || "未选择" }}</span>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Icon, addCollection } from "@iconify/vue";

import SvgIcon from "@/components/SvgIcon/index.vue";

/**
 * RemixIcon 图标选择器
 * - 打开时懒加载 @iconify-json/ri 全量集合并 addCollection 注册离线
 * - 默认展示常用图标，搜索可检索全部图标名
 */
const modelValue = defineModel<string>({ default: "" });

withDefaults(
  defineProps<{
    placeholder?: string;
  }>(),
  { placeholder: "点击选择图标" },
);

const emit = defineEmits<{
  change: [value: string];
}>();

/* 常用图标（名称已对照 @iconify-json/ri 校验） */
const COMMON_ICONS = [
  "ri:dashboard-3-line", "ri:settings-3-line", "ri:user-line", "ri:group-line", "ri:admin-line", "ri:database-2-line", "ri:cloud-line", "ri:refresh-line",
  "ri:swap-box-line", "ri:time-line", "ri:history-line", "ri:bar-chart-2-line", "ri:pie-chart-2-line", "ri:line-chart-line", "ri:file-list-2-line", "ri:file-text-line",
  "ri:folder-line", "ri:shield-check-line", "ri:shield-user-line", "ri:bell-line", "ri:price-tag-3-line", "ri:table-line", "ri:edit-line", "ri:lock-line",
  "ri:lock-password-line", "ri:global-line", "ri:home-5-line", "ri:flashlight-line", "ri:building-line", "ri:building-2-line", "ri:briefcase-line", "ri:calendar-line",
  "ri:calendar-event-line", "ri:mail-line", "ri:message-2-line", "ri:chat-smile-2-line", "ri:notification-3-line", "ri:task-line", "ri:menu-line", "ri:menu-fold-line",
  "ri:function-line", "ri:code-s-slash-line", "ri:terminal-box-line", "ri:server-line", "ri:hard-drive-2-line", "ri:cpu-line", "ri:router-line", "ri:wifi-line",
  "ri:store-2-line", "ri:shopping-cart-2-line", "ri:money-cny-box-line", "ri:wallet-3-line", "ri:bank-line", "ri:eye-line", "ri:eye-off-line", "ri:search-line",
  "ri:filter-3-line", "ri:download-2-line", "ri:upload-2-line", "ri:delete-bin-line", "ri:add-line", "ri:close-line", "ri:check-line", "ri:key-2-line",
  "ri:fingerprint-line", "ri:apps-line", "ri:grid-line", "ri:layout-masonry-line", "ri:window-line", "ri:tv-2-line", "ri:device-line", "ri:phone-line",
  "ri:camera-line", "ri:image-line", "ri:music-2-line", "ri:video-line", "ri:mic-line", "ri:map-pin-user-line", "ri:guide-line", "ri:compass-3-line",
  "ri:rocket-line", "ri:trophy-line", "ri:fire-line", "ri:star-line", "ri:heart-line", "ri:thumb-up-line", "ri:bookmark-line", "ri:clipboard-line",
  "ri:archive-line", "ri:send-plane-line", "ri:attachment-line", "ri:folder-shared-line", "ri:file-copy-2-line", "ri:book-2-line", "ri:ball-pen-line", "ri:scissors-line",
  "ri:umbrella-line", "ri:moon-line", "ri:sun-line", "ri:plant-line", "ri:restaurant-line", "ri:gift-line", "ri:coupon-3-line", "ri:virus-line",
  "ri:pulse-line", "ri:health-book-line", "ri:gamepad-line", "ri:brush-line", "ri:scissors-2-line", "ri:printer-line", "ri:scan-line", "ri:usb-line",
  "ri:battery-2-charge-line", "ri:bluetooth-line",
];

const MAX_SEARCH_RESULTS = 240;

const visible = ref(false);
const loading = ref(false);
const search = ref("");

/** 全量图标名（打开面板时懒加载） */
const allNames = ref<string[]>([]);

const allCount = computed(() => allNames.value.length);

const searchKeyword = computed(() => {
  const kw = search.value.trim().toLowerCase();
  return kw.startsWith("ri:") ? kw.slice(3) : kw;
});

const shownIcons = computed<string[]>(() => {
  const kw = searchKeyword.value;
  if (!kw) return COMMON_ICONS;
  return allNames.value.filter((name) => name.slice(3).includes(kw)).slice(0, MAX_SEARCH_RESULTS);
});

/** 首次打开时加载全量图标数据并注册离线集合 */
async function ensureLoaded() {
  if (allNames.value.length) return;

  loading.value = true;
  try {
    const { default: data } = await import("@iconify-json/ri/icons.json");
    addCollection(data);
    allNames.value = [...Object.keys(data.icons), ...Object.keys(data.aliases ?? {})].map((n) => `ri:${n}`);
  } finally {
    loading.value = false;
  }
}

function select(name: string) {
  modelValue.value = name;
  emit("change", name);
  visible.value = false;
}

function clear() {
  modelValue.value = "";
  emit("change", "");
}
</script>

<style scoped lang="scss">
.icon-picker {
  width: 100%;
}

/* 触发器：模仿 el-input 外观 */

.icon-picker__trigger {
  display: inline-flex;
  align-items: center;

  gap: var(--space-2);

  width: 100%;

  height: 32px;

  padding: 0 10px;

  background: var(--color-bg-card);

  border: 1px solid var(--color-border);

  border-radius: var(--el-border-radius-base);

  color: var(--color-text-primary);

  font-size: var(--font-size-base);

  cursor: pointer;

  transition: border-color var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
  }

  &.is-empty .icon-picker__value {
    color: var(--color-text-placeholder);
  }
}

.icon-picker__value {
  flex: 1;

  min-width: 0;

  overflow: hidden;

  text-align: left;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.icon-picker__clear {
  flex-shrink: 0;

  color: var(--color-text-tertiary);

  transition: color var(--transition-fast);

  &:hover {
    color: var(--color-text-secondary);
  }
}

/* 弹层内容 */

.icon-picker__panel {
  display: flex;
  flex-direction: column;

  gap: var(--space-2);

  min-height: 200px;
}

.icon-picker__meta {
  font-size: var(--font-size-xs);

  color: var(--color-text-tertiary);
}

.icon-picker__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);

  gap: var(--space-1);

  padding: var(--space-1) var(--space-1) var(--space-2);
}

.grid-cell {
  display: flex;
  align-items: center;
  justify-content: center;

  aspect-ratio: 1;

  border: none;

  border-radius: var(--radius-sm);

  background: transparent;

  color: var(--color-text-secondary);

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);

    color: var(--color-primary);
  }

  &.is-selected {
    background: var(--color-primary-light);

    color: var(--color-primary);
  }
}

.icon-picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: var(--space-2);

  padding: var(--space-8) 0;

  color: var(--color-text-tertiary);

  font-size: var(--font-size-sm);
}

.icon-picker__footer {
  padding: var(--space-2) var(--space-1) 0;

  border-top: 1px solid var(--color-border-light);

  font-size: var(--font-size-xs);

  color: var(--color-text-tertiary);
}

.icon-picker__current {
  color: var(--color-text-primary);
}
</style>
