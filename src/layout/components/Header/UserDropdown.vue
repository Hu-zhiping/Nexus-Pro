<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <!-- 用户区域 -->
    <div class="user-panel" tabindex="0" role="button" aria-label="用户菜单">
      <el-avatar :size="34" :src="userStore.profile.avatar || undefined">
        {{ avatarText }}
      </el-avatar>

      <div class="user-info">
        <span class="username">
          {{ displayName }}
        </span>

        <span class="role">
          {{ roleLabel }}
        </span>
      </div>

      <SvgIcon class="user-arrow" name="ri:arrow-down-s-line" :size="16" />
    </div>

    <!-- 下拉菜单 -->
    <template #dropdown>
      <el-dropdown-menu>

        <el-dropdown-item command="profile">
          <SvgIcon name="ri:user-line" :size="16" />

          <span>个人中心</span>
        </el-dropdown-item>

        <el-dropdown-item divided command="logout">
          <SvgIcon name="ri:logout-box-line" :size="16" />

          <span>退出登录</span>
        </el-dropdown-item>

      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>


<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";

import useUserStore from "@/store/modules/user";
import SvgIcon from "@/components/SvgIcon/index.vue";


const router = useRouter();

const userStore = useUserStore();


/* =========================================================
 * User
 * ========================================================= */

const displayName = computed(
  () => userStore.displayName || "未登录",
);


const roleLabel = computed(
  () => userStore.roleList[0] || "管理员",
);


/**
 * 无头像时显示昵称首字符
 */
const avatarText = computed(() => {
  if (userStore.profile.avatar) {
    return "";
  }

  return displayName.value
    .charAt(0)
    .toUpperCase();
});


/* =========================================================
 * Command
 * ========================================================= */

async function handleCommand(
  command: string,
) {
  /* 个人中心 */
  if (command === "profile") {
    await router.push("/profile");
    return;
  }


  /* 退出登录 */
  if (command === "logout") {
    try {
      await ElMessageBox.confirm(
        "确定要退出登录吗？",
        "提示",
        {
          confirmButtonText: "退出",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      await userStore.signOut();
    } catch {
      // 用户取消退出
    }
  }
}
</script>


<style scoped lang="scss">
/* =========================================================
 * User Panel
 * ========================================================= */

.user-panel {
  display: flex;

  align-items: center;

  gap:
    var(--space-2);

  height:
    var(--component-button-height);

  padding:
    0 var(--space-2);

  border-radius:
    var(--radius-md);

  color:
    var(--color-text-primary);

  cursor:
    pointer;

  user-select:
    none;

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}


/* Hover */

.user-panel:hover {
  background:
    var(--color-bg-hover);
}


/* Keyboard Focus */

.user-panel:focus-visible {
  outline:
    2px solid var(--color-primary);

  outline-offset:
    2px;
}


/* =========================================================
 * Avatar
 * ========================================================= */

.user-panel :deep(.el-avatar) {
  flex-shrink: 0;

  background:
    var(--color-primary);

  color:
    #fff;

  font-size:
    var(--font-size-sm);

  font-weight:
    var(--font-weight-medium);
}


/* =========================================================
 * User Info
 * ========================================================= */

.user-info {
  display: flex;

  flex-direction: column;

  justify-content: center;

  min-width: 0;

  line-height:
    var(--line-height-normal);

  white-space:
    nowrap;
}


/* Username */

.username {
  overflow: hidden;

  text-overflow: ellipsis;

  max-width: 120px;

  color:
    var(--color-text-primary);

  font-size:
    var(--font-size-sm);

  font-weight:
    var(--font-weight-semibold);

  line-height:
    var(--line-height-normal);
}


/* Role */

.role {
  overflow: hidden;

  text-overflow: ellipsis;

  max-width: 120px;

  color:
    var(--color-text-secondary);

  font-size:
    var(--font-size-xs);

  font-weight:
    var(--font-weight-regular);

  line-height:
    var(--line-height-normal);
}


/* =========================================================
 * Arrow
 * ========================================================= */

.user-arrow {
  flex-shrink: 0;

  color:
    var(--color-text-tertiary);

  transition:
    transform var(--transition-fast),
    color var(--transition-fast);
}


.user-panel:hover .user-arrow {
  color:
    var(--color-text-secondary);
}
</style>