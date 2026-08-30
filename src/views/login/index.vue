<template>
  <div class="login-page">
    <!-- 极光背景 -->
    <div class="aurora" aria-hidden="true">
      <span class="blob blob-a" />
      <span class="blob blob-b" />
      <span class="blob blob-c" />
      <i class="aurora-grid" />
    </div>

    <!-- 顶部工具栏 -->
    <header class="login-toolbar">
      <el-dropdown trigger="click" @command="onLangChange">
        <button type="button" class="toolbar-item">
          <SvgIcon name="ri:global-line" :size="16" />
          <span class="toolbar-label">{{ langLabel }}</span>
          <SvgIcon name="ri:arrow-down-s-line" :size="14" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
            <el-dropdown-item command="en">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <button type="button" class="toolbar-item" @click="onToggleTheme">
        <SvgIcon :name="isDark ? 'ri:sun-line' : 'ri:moon-line'" :size="16" />
        <span class="toolbar-label">{{ isDark ? "浅色模式" : "深色模式" }}</span>
      </button>

      <button type="button" class="toolbar-item" @click="onHelp">
        <SvgIcon name="ri:question-line" :size="16" />
        <span class="toolbar-label">帮助中心</span>
      </button>
    </header>

    <!-- 主内容 -->
    <main class="login-main">
      <div class="login-brand">
        <div class="brand-logo">
          <LogoMark :size="21" :stroke-width="3.2" />
        </div>
        <div class="brand-text">
          <span class="brand-name">Nexus Pro</span>
          <span class="brand-tagline">智能数据同步与管理平台</span>
        </div>
      </div>

      <div class="login-card">
        <div class="login-head">
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">登录账号，继续管理你的数据同步任务</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form" size="large">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" @keyup.enter="handleLogin">
              <template #prefix>
                <SvgIcon name="ri:user-line" :size="16" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <SvgIcon name="ri:lock-line" :size="16" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>

          <el-button class="login-btn" type="primary" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form>

        <div class="login-divider">
          <span>其他登录方式</span>
        </div>

        <div class="social-login">
          <button v-for="item in socials" :key="item.name" type="button" class="social-btn" @click="onSocial(item.name)">
            <span class="social-icon">
              <SvgIcon :name="item.icon" :size="18" />
            </span>
            <span class="social-name">{{ item.name }}</span>
          </button>
        </div>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-link type="primary" :underline="false">立即注册</el-link>
        </div>
      </div>
    </main>

    <footer class="login-copyright">© {{ year }} Nexus Pro. All rights reserved.</footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, FormInstance, FormRules } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import LogoMark from "@/components/LogoMark/index.vue";
import useUserStore from "@/store/modules/user";
import useAppStore from "@/store/modules/app";

const router = useRouter();
const appStore = useAppStore();

const loginFormRef = ref<FormInstance | null>(null);
const loading = ref(false);
const rememberMe = ref(false);
const year = new Date().getFullYear();

const isDark = computed(() => appStore.layoutSettings.isDark);
const langLabel = computed(() => (appStore.layoutSettings.language === "zh-CN" ? "简体中文" : "English"));

const loginForm = reactive({
  username: "",
  password: "",
});

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不少于 6 位", trigger: "blur" },
  ],
};

/* 三方登录 */
const socials = [
  { key: "wework", name: "企业微信", icon: "ri:chat-voice-line" },
  { key: "wechat", name: "微信登录", icon: "ri:wechat-line" },
  { key: "github", name: "GitHub", icon: "ri:github-line" },
];

const onLangChange = (cmd: string) => {
  appStore.setLanguage(cmd as "zh-CN" | "en");
  ElMessage.success(cmd === "zh-CN" ? "已切换为简体中文" : "Switched to English");
};

const onToggleTheme = () => {
  appStore.toggleDarkMode();
  ElMessage.success(isDark.value ? "已切换为深色模式" : "已切换为浅色模式");
};

const onHelp = () => {
  ElMessage.info("帮助中心正在建设中...");
};

const onSocial = (name: string) => {
  ElMessage.info(`即将跳转 ${name} 登录`);
};

const handleLogin = async () => {
  const formEl = loginFormRef.value;
  if (!formEl) return;
  const valid = await formEl.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const userStore = useUserStore();
    const success = await userStore.signIn(loginForm);
    if (success) {
      ElMessage.success("登录成功");
      router.push("/");
    } else {
      ElMessage.error("登录失败，请检查账号密码");
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "登录失败");
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
/* =========================================================
 * 登录页局部色板（浅色为默认，深色模式切换为中性碳黑）
 * ========================================================= */

.login-page {
  /* 基底与文字 */
  --lp-bg: #f4f5f9;
  --lp-text: var(--color-text-primary);
  --lp-text-2: var(--color-text-secondary);
  --lp-text-3: var(--color-text-tertiary);

  /* 玻璃卡 */
  --lp-card-bg: linear-gradient(155deg, rgb(255 255 255 / 82%), rgb(255 255 255 / 58%));
  --lp-card-border: rgb(255 255 255 / 90%);
  --lp-card-shadow: 0 24px 64px rgb(31 41 55 / 12%);

  /* 输入框 */
  --lp-input-bg: rgb(255 255 255 / 74%);
  --lp-input-bg-hover: #ffffff;
  --lp-input-border: var(--color-border);
  --lp-input-border-hover: var(--color-border-hover);

  /* 工具栏 / 社交按钮 / 分割线 */
  --lp-ghost-bg: rgb(255 255 255 / 66%);
  --lp-ghost-border: var(--color-border-light);
  --lp-ghost-text: var(--color-text-secondary);
  --lp-ghost-bg-hover: #ffffff;
  --lp-divider: var(--color-border-light);
  --lp-social-bg: rgb(255 255 255 / 74%);

  /* 光晕强度 */
  --lp-blob-strength: 26%;

  position: relative;

  display: flex;
  flex-direction: column;

  min-height: 100vh;

  overflow: hidden;

  color: var(--lp-text);

  background:
    radial-gradient(1100px 700px at 75% -10%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 70%),
    var(--lp-bg);
}

/* 深色模式：中性碳黑基底，不用蓝色 */
html.dark .login-page {
  --lp-bg: #0c0e13;
  --lp-text: #f3f4f6;
  --lp-text-2: rgb(243 244 246 / 62%);
  --lp-text-3: rgb(243 244 246 / 40%);

  --lp-card-bg: linear-gradient(155deg, rgb(255 255 255 / 10%), rgb(255 255 255 / 4%));
  --lp-card-border: rgb(255 255 255 / 12%);
  --lp-card-shadow: 0 24px 64px rgb(0 0 0 / 45%);

  --lp-input-bg: rgb(255 255 255 / 7%);
  --lp-input-bg-hover: rgb(255 255 255 / 11%);
  --lp-input-border: rgb(255 255 255 / 15%);
  --lp-input-border-hover: rgb(255 255 255 / 26%);

  --lp-ghost-bg: rgb(255 255 255 / 6%);
  --lp-ghost-border: rgb(255 255 255 / 10%);
  --lp-ghost-text: rgb(255 255 255 / 75%);
  --lp-ghost-bg-hover: rgb(255 255 255 / 12%);
  --lp-divider: rgb(255 255 255 / 12%);
  --lp-social-bg: rgb(255 255 255 / 8%);

  --lp-blob-strength: 42%;
}

/* =========================================================
 * 极光背景
 * ========================================================= */

.aurora {
  position: absolute;

  inset: 0;

  pointer-events: none;
}

.blob {
  position: absolute;

  border-radius: 50%;

  filter: blur(90px);

  &.blob-a {
    top: -160px;

    left: 12%;

    width: 520px;
    height: 520px;

    background: color-mix(in srgb, var(--color-primary) var(--lp-blob-strength), transparent);

    animation: drift-a 26s ease-in-out infinite alternate;
  }

  &.blob-b {
    right: -120px;

    top: 30%;

    width: 460px;
    height: 460px;

    background: color-mix(in srgb, #22d3ee calc(var(--lp-blob-strength) * 0.7), transparent);

    animation: drift-b 32s ease-in-out infinite alternate;
  }

  &.blob-c {
    bottom: -180px;

    left: 30%;

    width: 560px;
    height: 560px;

    background: color-mix(in srgb, #8b5cf6 calc(var(--lp-blob-strength) * 0.7), transparent);

    animation: drift-c 28s ease-in-out infinite alternate;
  }
}

.aurora-grid {
  position: absolute;

  inset: 0;

  background-image:
    linear-gradient(var(--color-border-light) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border-light) 1px, transparent 1px);

  background-size: 48px 48px;

  opacity: 0.55;

  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 72%);

  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 72%);
}

/* =========================================================
 * 顶部工具栏
 * ========================================================= */

.login-toolbar {
  position: relative;

  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  flex-shrink: 0;

  gap: var(--space-2);

  padding: var(--space-5) var(--space-8) 0;
}

.toolbar-item {
  /* 原生 button：字体需显式继承 */
  font-family: inherit;

  display: flex;
  align-items: center;

  gap: var(--space-1);

  height: 34px;

  padding: 0 var(--space-3);

  border-radius: var(--radius-round);

  background: var(--lp-ghost-bg);

  border: 1px solid var(--lp-ghost-border);

  color: var(--lp-ghost-text);

  font-size: var(--font-size-sm);

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    background: var(--lp-ghost-bg-hover);

    color: var(--lp-text);
  }
}

/* =========================================================
 * 主内容
 * ========================================================= */

.login-main {
  position: relative;

  z-index: 1;

  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: var(--space-4) var(--space-5) var(--space-5);
}

/* 品牌行 */

.login-brand {
  display: flex;
  align-items: center;

  gap: var(--space-3);

  margin-bottom: var(--space-6);

  animation: rise 0.6s ease backwards;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  border-radius: var(--radius-lg);

  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-active));

  color: #fff;

  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.brand-text {
  display: flex;
  flex-direction: column;

  gap: 2px;
}

.brand-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);

  line-height: 1.2;

  letter-spacing: 0.3px;

  color: var(--lp-text);
}

.brand-tagline {
  font-size: var(--font-size-xs);

  color: var(--lp-text-3);
}

/* 玻璃登录卡 */

.login-card {
  width: 100%;

  max-width: 420px;

  padding: var(--space-7) var(--space-8) var(--space-6);

  border-radius: var(--radius-2xl);

  background: var(--lp-card-bg);

  border: 1px solid var(--lp-card-border);

  backdrop-filter: blur(24px) saturate(150%);

  -webkit-backdrop-filter: blur(24px) saturate(150%);

  box-shadow: var(--lp-card-shadow);

  animation: rise 0.6s ease 0.1s backwards;
}

.login-head {
  margin-bottom: var(--space-6);

  text-align: center;
}

.login-title {
  margin: 0;

  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);

  letter-spacing: -0.3px;

  color: var(--lp-text);
}

.login-subtitle {
  margin: var(--space-2) 0 0;

  font-size: var(--font-size-sm);

  color: var(--lp-text-2);
}

/* 表单 */

.login-form {
  /* 20px 间距为 16px 高的校验错误提示留出可见空间，避免贴住下一个输入框 */
  :deep(.el-form-item) {
    margin-bottom: var(--space-5);
  }

  :deep(.el-input__wrapper) {
    padding: 0 var(--space-3);

    border-radius: var(--radius-md);

    background: var(--lp-input-bg);

    box-shadow: 0 0 0 1px var(--lp-input-border) inset;

    transition:
      background-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  :deep(.el-input__wrapper:hover) {
    background: var(--lp-input-bg-hover);

    box-shadow: 0 0 0 1px var(--lp-input-border-hover) inset;
  }

  :deep(.el-input__wrapper.is-focus) {
    background: var(--lp-input-bg-hover);

    box-shadow:
      0 0 0 1px var(--color-primary) inset,
      0 0 0 4px var(--color-primary-light);
  }

  :deep(.el-input__inner) {
    height: 44px;

    color: var(--lp-text);

    font-size: var(--font-size-base);

    &::placeholder {
      color: var(--lp-text-3);
    }
  }
}

.input-icon {
  color: var(--lp-text-3);
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: var(--space-1) 0 var(--space-5);

  font-size: var(--font-size-sm);

  :deep(.el-checkbox__label) {
    color: var(--lp-text-2);
  }

  :deep(.el-checkbox__inner) {
    background: var(--lp-input-bg);

    border-color: var(--lp-input-border-hover);
  }
}

.login-btn {
  width: 100%;

  height: 44px;

  border-radius: var(--radius-md);

  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);

  letter-spacing: 4px;

  text-indent: 4px;

  border: none;

  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-1px);

    box-shadow: 0 10px 28px color-mix(in srgb, var(--color-primary) 45%, transparent);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 分割线 */

.login-divider {
  display: flex;
  align-items: center;

  margin: var(--space-6) 0 var(--space-5);

  font-size: var(--font-size-xs);

  color: var(--lp-text-3);

  &::before,
  &::after {
    content: "";

    flex: 1;

    height: 1px;

    background: var(--lp-divider);
  }

  span {
    padding: 0 var(--space-4);
  }
}

/* 三方登录 */

.social-login {
  display: flex;
  justify-content: center;

  gap: var(--space-8);
}

.social-btn {
  /* 原生 button 重置：去掉 UA 默认边框/底色/字体，保留语义与键盘可达性 */
  appearance: none;

  padding: 0;

  border: none;

  background: transparent;

  font-family: inherit;

  color: inherit;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: var(--space-2);

  cursor: pointer;

  transition: transform var(--transition-base);

  &:hover {
    transform: translateY(-2px);

    .social-icon {
      border-color: var(--color-primary);

      color: var(--color-primary);

      box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 22%, transparent);
    }
  }
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;

  border-radius: var(--radius-round);

  background: var(--lp-social-bg);

  border: 1px solid var(--lp-input-border);

  color: var(--lp-text-2);

  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base);
}

.social-name {
  font-size: var(--font-size-xs);

  color: var(--lp-text-2);
}

/* 注册引导 */

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: var(--space-1);

  margin-top: var(--space-6);

  font-size: var(--font-size-sm);

  color: var(--lp-text-2);
}

/* 版权 */

.login-copyright {
  position: relative;

  z-index: 1;

  flex-shrink: 0;

  padding: var(--space-4);

  text-align: center;

  font-size: var(--font-size-xs);

  color: var(--lp-text-3);
}

/* =========================================================
 * 动画
 * ========================================================= */

@keyframes rise {
  from {
    opacity: 0;

    transform: translateY(14px);
  }

  to {
    opacity: 1;

    transform: translateY(0);
  }
}

@keyframes drift-a {
  from {
    transform: translate(-4%, -4%) scale(1);
  }

  to {
    transform: translate(10%, 8%) scale(1.18);
  }
}

@keyframes drift-b {
  from {
    transform: translate(6%, -6%) scale(1.1);
  }

  to {
    transform: translate(-8%, 6%) scale(0.95);
  }
}

@keyframes drift-c {
  from {
    transform: translate(0, 4%) scale(0.95);
  }

  to {
    transform: translate(-10%, -8%) scale(1.15);
  }
}

/* =========================================================
 * 响应式
 * ========================================================= */

@media (max-width: 767px) {
  .login-toolbar {
    padding: var(--space-3) var(--space-4) 0;

    .toolbar-label {
      display: none;
    }

    .toolbar-item {
      padding: 0 var(--space-2);
    }
  }

  .login-card {
    padding: var(--space-6) var(--space-5) var(--space-5);
  }
}

/* 矮屏压缩纵向空间，保证卡片完整可见 */
@media (max-height: 780px) {
  .login-brand {
    margin-bottom: var(--space-4);

    .brand-tagline {
      display: none;
    }
  }

  .login-card {
    padding: var(--space-6) var(--space-7) var(--space-5);
  }

  .login-head {
    margin-bottom: var(--space-4);
  }

  .login-divider {
    margin: var(--space-4) 0;
  }

  .login-footer {
    margin-top: var(--space-4);
  }
}

/* Reduced Motion */

@media (prefers-reduced-motion: reduce) {

  .blob {
    animation: none;
  }

  .login-brand,
  .login-card {
    animation: none;
  }

  .login-btn,
  .social-btn,
  .toolbar-item {
    transition: none;
  }
}
</style>
