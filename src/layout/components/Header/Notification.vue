<template>
  <el-popover placement="bottom-end" :width="340" trigger="click" popper-class="notification-popover">
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" :offset="[2, 2]">
        <button class="header-btn" type="button" title="通知" aria-label="通知">
          <SvgIcon name="ri:notification-3-line" :size="18" />
        </button>
      </el-badge>
    </template>
    <div class="notification-panel">
      <!-- Header -->
      <div class="notification-header">
        <span class="notification-title"> 通知 </span>

        <el-button link type="primary" :disabled="!unreadCount" @click="markAllRead"> 全部已读 </el-button>
      </div>

      <!-- Empty -->
      <el-empty v-if="!list.length" description="暂无通知" :image-size="64" />

      <!-- List -->
      <ul v-else class="notification-list">
        <li
          v-for="item in list" :key="item.id" class="notification-item" :class="{
            unread: !item.read,
          }" role="button" tabindex="0" :aria-label="`标记已读：${item.title}`"
          @click="markRead(item)"
          @keydown.enter.prevent="markRead(item)"
          @keydown.space.prevent="markRead(item)"
        >
          <!-- Unread Dot -->
          <el-badge v-if="!item.read" is-dot class="notification-dot" />

          <!-- Content -->
          <div class="notification-content">
            <div class="notification-item-title">
              {{ item.title }}
            </div>

            <div class="notification-item-desc">
              {{ item.desc }}
            </div>

            <div class="notification-item-time">
              {{ item.time }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { getNotifications, type NotificationItem } from "@/api/user";

import SvgIcon from "@/components/SvgIcon/index.vue";

const list = ref<NotificationItem[]>([]);

const unreadCount = ref(0);

async function loadNotifications() {
  try {
    const { data } = await getNotifications();

    list.value = data?.list ?? [];

    unreadCount.value = data?.unreadCount ?? list.value.filter((item) => !item.read).length;
  } catch {
    // 接口异常时静默降级
  }
}


function markRead(item: NotificationItem) {
  if (item.read) {
    return;
  }

  item.read = true;

  unreadCount.value = Math.max(0, unreadCount.value - 1);
}

function markAllRead() {
  list.value.forEach((item) => {
    item.read = true;
  });

  unreadCount.value = 0;
}

onMounted(loadNotifications);
</script>

<style scoped lang="scss">
.notification-panel {
  width: 100%;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.notification-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: 1.5;
}

.notification-list {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  margin: 0 calc(var(--space-3) * -1);
  border-bottom: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-bg-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);

    outline-offset: -2px;
  }
}


.notification-dot {
  flex-shrink: 0;
  margin-top: 6px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}


.notification-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.notification-item.unread .notification-item-title {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.notification-item-desc {
  margin-top: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.notification-item-time {
  margin-top: var(--space-1);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1.5;
}
</style>
