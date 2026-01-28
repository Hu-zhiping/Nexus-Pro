<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <!-- 左滚动按钮 -->
      <button 
        v-if="showScroll" 
        class="scroll-btn left"
        @click="scrollLeft"
      >
        <SvgIcon name="ri:arrow-left-s-line" size="16" />
      </button>

      <!-- 标签列表 -->
      <div ref="tagsRef" class="tags-list" @wheel.prevent="handleWheel">
        <div
          v-for="tag in tags"
          :key="tag.path"
          class="tags-item"
          :class="{ active: isActive(tag) }"
          @click.middle="!isAffix(tag) && closeTag(tag)"
          @click.left="navigateTo(tag)"
          @contextmenu.prevent="openContextMenu($event, tag)"
        >
          <span class="tag-title">{{ tag.title }}</span>
          <span 
            v-if="!isAffix(tag)" 
            class="tag-close"
            @click.stop="closeTag(tag)"
          >
            <SvgIcon name="ri:close-line" size="12" />
          </span>
        </div>
      </div>

      <!-- 右滚动按钮 -->
      <button 
        v-if="showScroll" 
        class="scroll-btn right"
        @click="scrollRight"
      >
        <SvgIcon name="ri:arrow-right-s-line" size="16" />
      </button>
    </div>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenu.visible"
      class="context-menu"
      :style="{
        left: contextMenu.left + 'px',
        top: contextMenu.top + 'px',
      }"
    >
      <li @click="refreshTag(selectedTag)">
        <SvgIcon name="ri:refresh-line" size="14" />
        <span>刷新页面</span>
      </li>
      <li @click="closeTag(selectedTag)" :class="{ disabled: isAffix(selectedTag) }">
        <SvgIcon name="ri:close-line" size="14" />
        <span>关闭标签</span>
      </li>
      <li @click="closeOtherTags">
        <SvgIcon name="ri:close-circle-line" size="14" />
        <span>关闭其他</span>
      </li>
      <li @click="closeLeftTabs">
        <SvgIcon name="ri:skip-left-line" size="14" />
        <span>关闭左侧</span>
      </li>
      <li @click="closeRightTabs">
        <SvgIcon name="ri:skip-right-line" size="14" />
        <span>关闭右侧</span>
      </li>
      <li @click="closeAllTags" :class="{ disabled: tags.length <= affixTags.length }">
        <SvgIcon name="ri:close-circle-fill" size="14" />
        <span>关闭全部</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SvgIcon from '@/components/SvgIcon/index.vue';
import useAppStore from '@/store/modules/app';
import type { Tab } from '@/store/modules/app';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const tagsRef = ref<HTMLDivElement>();
const showScroll = ref(false);
const affixTags = ref<Tab[]>([]);
const selectedTag = ref<Tab>({} as Tab);

// 右键菜单
const contextMenu = ref({
  visible: false,
  left: 0,
  top: 0,
});

// 标签列表
const tags = computed(() => appStore.tabs);

// 是否是当前激活的标签
const isActive = (tag: Tab) => {
  return tag.path === route.path;
};

// 是否是固定标签
const isAffix = (tag: Tab) => {
  return affixTags.value.some(t => t.path === tag.path);
};

// 导航到标签
const navigateTo = (tag: Tab) => {
  if (tag.path === route.path) return;
  router.push({
    path: tag.path,
    query: tag.query,
  });
};

// 关闭标签
const closeTag = (tag: Tab) => {
  if (isAffix(tag)) return;
  
  const currentIndex = tags.value.findIndex(t => t.path === tag.path);
  appStore.removeTab(tag.path);
  
  // 如果关闭的是当前标签，则导航到相邻标签
  if (isActive(tag)) {
    const nextTag = tags.value[currentIndex] || tags.value[currentIndex - 1];
    if (nextTag) {
      navigateTo(nextTag);
    } else {
      router.push('/');
    }
  }
};

// 刷新标签
const refreshTag = (tag: Tab) => {
  router.replace({
    path: '/redirect' + tag.path,
  });
};

// 关闭其他标签
const closeOtherTags = () => {
  appStore.closeOtherTabs(selectedTag.value.path);
  if (!isActive(selectedTag.value)) {
    navigateTo(selectedTag.value);
  }
};

// 关闭左侧标签
const closeLeftTabs = () => {
  appStore.closeLeftTabs(selectedTag.value.path);
};

// 关闭右侧标签
const closeRightTabs = () => {
  appStore.closeRightTabs(selectedTag.value.path);
};

// 关闭全部标签
const closeAllTags = () => {
  appStore.closeAllTabs();
  const firstTag = affixTags.value[0] || tags.value[0];
  if (firstTag && !isActive(firstTag)) {
    navigateTo(firstTag);
  }
};

// 打开右键菜单
const openContextMenu = (e: MouseEvent, tag: Tab) => {
  selectedTag.value = tag;
  contextMenu.value = {
    visible: true,
    left: e.clientX,
    top: e.clientY,
  };
};

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

// 滚动处理
const handleWheel = (e: WheelEvent) => {
  if (!tagsRef.value) return;
  const delta = e.deltaY > 0 ? 100 : -100;
  tagsRef.value.scrollLeft += delta;
};

const scrollLeft = () => {
  if (!tagsRef.value) return;
  tagsRef.value.scrollLeft -= 200;
};

const scrollRight = () => {
  if (!tagsRef.value) return;
  tagsRef.value.scrollLeft += 200;
};

// 检查是否需要滚动
const checkScroll = () => {
  nextTick(() => {
    if (tagsRef.value) {
      showScroll.value = tagsRef.value.scrollWidth > tagsRef.value.clientWidth;
    }
  });
};

// 添加标签
const addTag = () => {
  const { meta, path, name, query, params } = route;
  if (meta?.noTagsView) return;
  
  const tag: Tab = {
    title: (meta?.title as string) || (name as string) || '未命名',
    path,
    name: name as string,
    query: query as Record<string, string>,
    params: params as Record<string, string>,
  };
  
  appStore.addTab(tag);
  
  // 检查是否是固定标签
  if (meta?.affix) {
    if (!affixTags.value.some(t => t.path === tag.path)) {
      affixTags.value.push(tag);
    }
  }
  
  checkScroll();
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    addTag();
  },
  { immediate: true }
);

// 点击外部关闭右键菜单
onMounted(() => {
  document.addEventListener('click', closeContextMenu);
  window.addEventListener('resize', checkScroll);
});
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid var(--color-border-light);
}

.tags-view-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
}

.scroll-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-base);
    color: var(--color-primary);
  }

  &.left {
    border-right: 1px solid var(--color-border-light);
  }

  &.right {
    border-left: 1px solid var(--color-border-light);
  }
}

.tags-list {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  overflow-x: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tags-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: var(--color-primary);
  }

  &.active {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;

    .tag-close {
      color: #fff;
    }
  }

  .tag-title {
    font-size: 13px;
  }

  .tag-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    color: var(--color-text-secondary);
    transition: all 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: #fff;
    }
  }
}

// 右键菜单
.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 140px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  list-style: none;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 13px;
    color: var(--color-text-regular);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--color-bg-base);
      color: var(--color-primary);
    }

    &.disabled {
      color: var(--color-text-disabled);
      cursor: not-allowed;

      &:hover {
        background-color: transparent;
      }
    }
  }
}
</style>
