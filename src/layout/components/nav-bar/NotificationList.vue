<template>
  <div class="notification-container">
    <div class="notification-header">
      <h3 class="title">通知消息</h3>
      <el-button type="primary" link size="small" @click="markAllRead">
        全部已读
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="notification-tabs">
      <el-tab-pane label="消息" name="message">
        <div class="notification-list">
          <div 
            v-for="item in messages" 
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.read }"
            @click="handleClick(item)"
          >
            <div class="item-icon" :class="item.type">
              <SvgIcon :name="getIcon(item.type)" size="20" />
            </div>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-desc">{{ item.desc }}</div>
              <div class="item-time">{{ item.time }}</div>
            </div>
            <div v-if="!item.read" class="unread-dot"></div>
          </div>
        </div>
        <div class="view-all" @click="viewAll">查看全部</div>
      </el-tab-pane>

      <el-tab-pane label="待办" name="todo">
        <div class="empty-state">
          <SvgIcon name="ri:checkbox-circle-line" size="48" class="empty-icon" />
          <p>暂无待办事项</p>
        </div>
      </el-tab-pane>

      <el-tab-pane label="系统" name="system">
        <div class="notification-list">
          <div 
            v-for="item in systemMessages" 
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.read }"
          >
            <div class="item-icon" :class="item.type">
              <SvgIcon :name="getIcon(item.type)" size="20" />
            </div>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-desc">{{ item.desc }}</div>
              <div class="item-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '@/components/svg-icon/index.vue';

const activeTab = ref('message');

const messages = ref([
  { id: 1, type: 'info', title: '欢迎使用 Vue Admin', desc: '这是一个现代化的后台管理系统', time: '5分钟前', read: false },
  { id: 2, type: 'success', title: '系统升级完成', desc: '系统已升级至 v2.0 版本', time: '1小时前', read: false },
  { id: 3, type: 'warning', title: '密码即将过期', desc: '您的密码将在 7 天后过期', time: '2小时前', read: true },
]);

const systemMessages = ref([
  { id: 4, type: 'error', title: '服务器警告', desc: 'CPU 使用率超过 80%', time: '刚刚', read: false },
  { id: 5, type: 'info', title: '数据备份完成', desc: '每日自动备份已完成', time: '昨天', read: true },
]);

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'ri:information-line',
    success: 'ri:checkbox-circle-line',
    warning: 'ri:alert-line',
    error: 'ri:error-warning-line',
  };
  return icons[type] || 'ri:notification-line';
};

const markAllRead = () => {
  messages.value.forEach(item => item.read = true);
  systemMessages.value.forEach(item => item.read = true);
};

const handleClick = (item: any) => {
  item.read = true;
};

const viewAll = () => {
  console.log('查看全部通知');
};
</script>

<style lang="scss" scoped>
.notification-container {
  max-height: 400px;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);

  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.notification-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    padding: 0 16px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background-color: var(--color-bg-base);
  }

  &.unread {
    background-color: rgba(var(--color-primary-rgb), 0.02);
  }
}

.item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;

  &.info {
    background-color: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }

  &.success {
    background-color: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }

  &.warning {
    background-color: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
  }

  &.error {
    background-color: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.item-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.unread-dot {
  width: 6px;
  height: 6px;
  background-color: #f56c6c;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.view-all {
  text-align: center;
  padding: 12px;
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
  border-top: 1px solid var(--color-border-light);

  &:hover {
    background-color: var(--color-bg-base);
  }
}

.empty-state {
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
</style>
