<template>
  <div class="tags-view">
    <div class="tags-wrapper">
      <button v-if="showScroll" class="scroll-btn" @click="scrollLeft">
        <SvgIcon name="ri:arrow-left-s-line" size="14" />
      </button>

      <div ref="tagsRef" class="tags-list" @wheel.prevent="handleWheel">
        <TransitionGroup name="tag">
          <div
            v-for="tag in tags"
            :key="tag.path"
            class="tag-item"
            :class="{ 'is-active': isActive(tag), 'is-affixed': isAffix(tag) }"
            @click.middle="!isAffix(tag) && closeTag(tag)"
            @click.left="navigateTo(tag)"
            @contextmenu.prevent="openContextMenu($event, tag)"
          >
            <span v-if="!isAffix(tag)" class="tag-dot" :class="{ 'is-active': isActive(tag) }" />
            <span class="tag-title">{{ tag.title }}</span>
            <span v-if="!isAffix(tag)" class="tag-close" @click.stop="closeTag(tag)">
              <SvgIcon name="ri:close-line" size="12" />
            </span>
          </div>
        </TransitionGroup>
      </div>

      <button v-if="showScroll" class="scroll-btn" @click="scrollRight">
        <SvgIcon name="ri:arrow-right-s-line" size="14" />
      </button>

      <div class="tags-actions">
        <el-dropdown trigger="click" @command="handleAction">
          <button class="action-btn">
            <SvgIcon name="ri:arrow-down-s-line" size="14" />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="refresh"><SvgIcon name="ri:refresh-line" size="14" /> 刷新当前</el-dropdown-item>
              <el-dropdown-item command="closeCurrent"><SvgIcon name="ri:close-line" size="14" /> 关闭当前</el-dropdown-item>
              <el-dropdown-item command="closeOther"><SvgIcon name="ri:close-circle-line" size="14" /> 关闭其他</el-dropdown-item>
              <el-dropdown-item command="closeLeft"><SvgIcon name="ri:skip-left-line" size="14" /> 关闭左侧</el-dropdown-item>
              <el-dropdown-item command="closeRight"><SvgIcon name="ri:skip-right-line" size="14" /> 关闭右侧</el-dropdown-item>
              <el-dropdown-item command="closeAll"><SvgIcon name="ri:close-circle-fill" size="14" /> 关闭全部</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 右键菜单 -->
    <Transition name="ctx-menu">
      <ul v-show="ctxMenu.visible" class="context-menu" :style="{ left: ctxMenu.left + 'px', top: ctxMenu.top + 'px' }">
        <li @click="refreshTag(selectedTag)">
          <SvgIcon name="ri:refresh-line" size="14" />
          <span>刷新页面</span>
        </li>
        <li :class="{ 'is-disabled': isAffix(selectedTag) }" @click="closeTag(selectedTag)">
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
        <li :class="{ 'is-disabled': tags.length <= 1 }" @click="closeAllTags">
          <SvgIcon name="ri:close-circle-fill" size="14" />
          <span>关闭全部</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import SvgIcon from "@/components/svg-icon/index.vue";
import useAppStore from "@/store/modules/app";
import type { Tab } from "@/store/modules/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const tagsRef = ref<HTMLDivElement>();
const showScroll = ref(false);
const affixTags = ref<Tab[]>([]);
const selectedTag = ref<Tab>({} as Tab);
const ctxMenu = ref({ visible: false, left: 0, top: 0 });

const tags = computed(() => appStore.tabs);
const isActive = (tag: Tab) => tag.path === route.path;
const isAffix = (tag: Tab) => affixTags.value.some((t) => t.path === tag.path);

const navigateTo = (tag: Tab) => {
  if (tag.path === route.path) return;
  router.push({ path: tag.path, query: tag.query });
};

const closeTag = (tag: Tab) => {
  if (isAffix(tag)) return;
  const idx = tags.value.findIndex((t) => t.path === tag.path);
  appStore.removeTab(tag.path);
  if (isActive(tag)) {
    const next = tags.value[idx] || tags.value[idx - 1];
    if (next) navigateTo(next);
    else router.push("/");
  }
};

const refreshTag = (tag: Tab) => {
  router.replace({ path: "/redirect" + tag.path });
};

const closeOtherTags = () => {
  appStore.closeOtherTabs(selectedTag.value.path);
  if (!isActive(selectedTag.value)) navigateTo(selectedTag.value);
};

const closeLeftTabs = () => appStore.closeLeftTabs(selectedTag.value.path);
const closeRightTabs = () => appStore.closeRightTabs(selectedTag.value.path);

const closeAllTags = () => {
  appStore.closeAllTabs();
  const first = affixTags.value[0] || tags.value[0];
  if (first && !isActive(first)) navigateTo(first);
};

const openContextMenu = (e: MouseEvent, tag: Tab) => {
  selectedTag.value = tag;
  ctxMenu.value = { visible: true, left: e.clientX, top: e.clientY };
};

const closeContextMenu = () => {
  ctxMenu.value.visible = false;
};

const handleWheel = (e: WheelEvent) => {
  if (!tagsRef.value) return;
  tagsRef.value.scrollLeft += e.deltaY > 0 ? 100 : -100;
};

const scrollLeft = () => {
  tagsRef.value && (tagsRef.value.scrollLeft -= 200);
};
const scrollRight = () => {
  tagsRef.value && (tagsRef.value.scrollLeft += 200);
};

const checkScroll = () => {
  nextTick(() => {
    if (tagsRef.value) showScroll.value = tagsRef.value.scrollWidth > tagsRef.value.clientWidth;
  });
};

const handleAction = (command: string) => {
  const cur = tags.value.find((t) => t.path === route.path);
  if (!cur) return;
  switch (command) {
    case "refresh":
      refreshTag(cur);
      break;
    case "closeCurrent":
      closeTag(cur);
      break;
    case "closeOther":
      selectedTag.value = cur;
      closeOtherTags();
      break;
    case "closeLeft":
      selectedTag.value = cur;
      closeLeftTabs();
      break;
    case "closeRight":
      selectedTag.value = cur;
      closeRightTabs();
      break;
    case "closeAll":
      closeAllTags();
      break;
  }
};

const addTag = () => {
  const { meta, path, name, query, params } = route;
  if (meta?.noTagsView || meta?.hidden) return;
  const tag: Tab = {
    title: (meta?.title as string) || (name as string) || "未命名",
    path,
    name: name as string,
    query: query as Record<string, string>,
    params: params as Record<string, string>,
  };
  appStore.addTab(tag);
  if (meta?.affix && !affixTags.value.some((t) => t.path === tag.path)) {
    affixTags.value.push(tag);
  }
  checkScroll();
};

watch(
  () => route.path,
  () => addTag(),
  { immediate: true },
);

onMounted(() => {
  document.addEventListener("click", closeContextMenu);
  window.addEventListener("resize", checkScroll);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeContextMenu);
  window.removeEventListener("resize", checkScroll);
});
</script>

<style scoped>
.tags-view {
  position: relative;
  height: var(--tags-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-lighter);
  box-sizing: border-box;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  gap: 4px;
}

.scroll-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-regular);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.scroll-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tags-list {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 2px 0;
}

.tags-list::-webkit-scrollbar {
  display: none;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
  position: relative;
}

.tag-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-lighter);
}

.tag-item:hover .tag-close {
  opacity: 1;
}

.tag-item.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.tag-item.is-active .tag-title {
  color: var(--text-inverse);
  font-weight: 500;
}

.tag-item.is-active .tag-dot.is-active {
  background: var(--text-inverse);
}

.tag-item.is-active .tag-close {
  color: rgba(255, 255, 255, 0.8);
  opacity: 1;
}

.tag-item.is-active .tag-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-inverse);
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-placeholder);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.tag-dot.is-active {
  background: var(--color-primary);
}

.tag-title {
  font-size: 12px;
  white-space: nowrap;
  color: var(--text-regular);
  transition: color var(--transition-fast);
}

.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 1px;
  border-radius: 50%;
  color: var(--text-secondary);
  opacity: 0;
  transition: all var(--transition-fast);
}

.tag-close:hover {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.tags-actions {
  margin-left: 2px;
  flex-shrink: 0;
}

.action-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-regular);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 140px;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  box-shadow: var(--el-box-shadow-dark);
}

.context-menu li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-size: 14px;
  color: var(--text-regular);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.context-menu li:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
}

.context-menu li.is-disabled {
  color: var(--text-disabled);
  cursor: not-allowed;
}

.context-menu li.is-disabled:hover {
  background: transparent;
  color: var(--text-disabled);
}

.tag-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tag-leave-active {
  transition: all 0.15s ease;
}

.tag-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-4px);
}

.tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.tag-move {
  transition: transform 0.25s ease;
}

.ctx-menu-enter-active {
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ctx-menu-leave-active {
  transition: all 0.1s ease;
}

.ctx-menu-enter-from,
.ctx-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
