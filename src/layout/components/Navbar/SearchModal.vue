<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="560px"
    class="search-modal"
    :modal-class="'search-modal-backdrop'"
    @open="onOpen"
    @close="onClose"
  >
    <div class="search-container">
      <!-- 搜索输入框 -->
      <div class="search-input-wrapper">
        <SvgIcon name="ri:search-line" size="20" class="search-icon" />
        <input
          ref="inputRef"
          v-model="searchText"
          type="text"
          placeholder="搜索菜单、页面..."
          class="search-input"
          @keydown.up.prevent="highlightPrev"
          @keydown.down.prevent="highlightNext"
          @keydown.enter="selectHighlighted"
          @keydown.esc="close"
        />
        <span class="search-shortcut">ESC</span>
      </div>

      <!-- 搜索结果 -->
      <div v-if="filteredMenus.length > 0" class="search-results">
        <div class="results-title">搜索结果</div>
        <div class="results-list">
          <div
            v-for="(item, index) in filteredMenus"
            :key="item.path"
            class="result-item"
            :class="{ highlighted: index === highlightedIndex }"
            @click="selectItem(item)"
            @mouseenter="highlightedIndex = index"
          >
            <SvgIcon :name="(item.meta?.icon as string) || 'ri:file-text-line'" size="18" />
            <div class="result-content">
              <div class="result-title">{{ item.meta?.title || item.name }}</div>
              <div class="result-path">{{ item.path }}</div>
            </div>
            <SvgIcon name="ri:arrow-right-line" size="16" class="enter-icon" />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="searchText" class="search-empty">
        <SvgIcon name="ri:inbox-line" size="48" class="empty-icon" />
        <p>未找到相关结果</p>
      </div>

      <!-- 快捷提示 -->
      <div v-else class="search-tips">
        <div class="tips-title">快捷键</div>
        <div class="tips-list">
          <div class="tip-item">
            <span class="key">↑</span>
            <span class="desc">上一个</span>
          </div>
          <div class="tip-item">
            <span class="key">↓</span>
            <span class="desc">下一个</span>
          </div>
          <div class="tip-item">
            <span class="key">↵</span>
            <span class="desc">确认</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import SvgIcon from '@/components/SvgIcon/index.vue';
import useMenuStore from '@/store/modules/menu';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const router = useRouter();
const menuStore = useMenuStore();
const inputRef = ref<HTMLInputElement>();
const searchText = ref('');
const highlightedIndex = ref<number>(0);

// 对话框可见性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

// 扁平化菜单列表
const flatMenus = computed(() => {
  const menus: RouteRecordRaw[] = [];
  const traverse = (routes: RouteRecordRaw[]) => {
    routes.forEach(route => {
      if (!route.meta?.hidden && route.meta?.title) {
        menus.push(route);
      }
      if (route.children) {
        traverse(route.children);
      }
    });
  };
  traverse(menuStore.visibleMenus);
  return menus;
});

// 过滤后的菜单
const filteredMenus = computed(() => {
  if (!searchText.value) return [];
  const keyword = searchText.value.toLowerCase();
  return flatMenus.value.filter(menu => {
    const title = String(menu.meta?.title || '').toLowerCase();
    const path = String(menu.path || '').toLowerCase();
    return title.includes(keyword) || path.includes(keyword);
  }).slice(0, 8);
});

// 高亮上一个
const highlightPrev = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  } else {
    highlightedIndex.value = filteredMenus.value.length - 1;
  }
};

// 高亮下一个
const highlightNext = () => {
  if (highlightedIndex.value < filteredMenus.value.length - 1) {
    highlightedIndex.value++;
  } else {
    highlightedIndex.value = 0;
  }
};

// 选择高亮的项
const selectHighlighted = () => {
  const item = filteredMenus.value[highlightedIndex.value];
  if (item) {
    selectItem(item);
  }
};

// 选择菜单项
const selectItem = (item: RouteRecordRaw) => {
  router.push(item.path);
  close();
};

// 关闭弹窗
const close = () => {
  visible.value = false;
};

// 打开时的处理
const onOpen = () => {
  searchText.value = '';
  highlightedIndex.value = 0;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

// 关闭时的处理
const onClose = () => {
  searchText.value = '';
};
</script>

<style lang="scss" scoped>
.search-container {
  padding: 16px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--color-bg-base);
  border-radius: var(--radius-large);
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--color-primary);
  }

  .search-icon {
    color: var(--color-text-secondary);
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 16px;
    color: var(--color-text-primary);
    outline: none;

    &::placeholder {
      color: var(--color-text-placeholder);
    }
  }

  .search-shortcut {
    padding: 4px 8px;
    background-color: #fff;
    border-radius: var(--radius-base);
    font-size: 12px;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-light);
  }
}

.search-results {
  margin-top: 16px;
}

.results-title {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  padding-left: 8px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all 0.2s;

  &:hover, &.highlighted {
    background-color: var(--color-bg-base);

    .enter-icon {
      opacity: 1;
    }
  }

  .result-content {
    flex: 1;
    min-width: 0;
  }

  .result-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .result-path {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-top: 2px;
  }

  .enter-icon {
    opacity: 0;
    transition: opacity 0.2s;
    color: var(--color-primary);
  }
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);

  .empty-icon {
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.search-tips {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}

.tips-title {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.tips-list {
  display: flex;
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .key {
    padding: 4px 10px;
    background-color: var(--color-bg-base);
    border-radius: var(--radius-base);
    font-size: 12px;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-light);
  }

  .desc {
    font-size: 13px;
    color: var(--color-text-regular);
  }
}
</style>

<style>
.search-modal {
  border-radius: 12px;
  overflow: hidden;
}

.search-modal .el-dialog__header {
  display: none;
}

.search-modal .el-dialog__body {
  padding: 0;
}

.search-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
</style>
