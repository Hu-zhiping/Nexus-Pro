<template>
  <div
class="logo" :class="{
    'is-collapse': collapse,
  }">
    <div class="logo__box">
      <LogoMark :size="19" :stroke-width="3.2" />
    </div>

    <Transition name="logo-fade">
      <span v-if="!collapse" class="logo__title"> Nexus Pro </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import LogoMark from "@/components/LogoMark/index.vue";

defineProps<{
  /** 是否折叠 */
  collapse: boolean;
}>();
</script>

<style scoped lang="scss">
/* =========================================================
 * Logo
 * ========================================================= */

.logo {
  display: flex;
  align-items: center;

  flex-shrink: 0;

  width: 100%;
  height: var(--layout-header-height);

  gap: var(--space-3);

  padding: 0 var(--space-5);

  overflow: hidden;

  /* 背景透明：侧边栏（含深色渐变）从下方透出，避免 Logo 自绘渐变产生色差 */
  background: transparent;

  color: var(--color-sidebar-heading);

  border-bottom: 1px solid var(--color-sidebar-border);

  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    /* 与侧栏宽度动画同速（slow），避免折叠时 Logo 相对容器错速抖动 */
    padding var(--transition-slow);

  &.is-collapse {
    /* 折叠态 64px 容器：34px 图标左右各 15px 即居中。
       不改 justify-content（离散属性会瞬间跳位），仅靠 padding 平滑过渡 */
    padding: 0 15px;
  }
}

/* =========================================================
 * Logo Icon
 * ========================================================= */

.logo__box {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 34px;
  height: 34px;

  border-radius: var(--radius-md);

  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-active));

  color: #fff;

  box-shadow: var(--shadow-md);
}

/* =========================================================
 * Logo Title
 * ========================================================= */

.logo__title {
  min-width: 0;

  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;

  color: var(--color-sidebar-heading);

  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);

  line-height: 1;

  letter-spacing: 0.2px;
}

/* =========================================================
 * Animation
 * ========================================================= */

.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: opacity var(--transition-fast);
}

.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
}

/* =========================================================
 * Reduced Motion
 * ========================================================= */

@media (prefers-reduced-motion: reduce) {
  .logo {
    transition: none;
  }
}
</style>
