<template>
  <div class="login-container">
    <!-- 左侧品牌展示 -->
    <aside class="login-banner">
      <div class="brand">
        <div class="brand-logo">
          <SvgIcon name="ri:hexagon-fill" size="22" />
        </div>

        <div>
          <div class="brand-name">Nexus Admin</div>

          <div class="brand-sub">Enterprise Management Platform</div>
        </div>
      </div>

      <div class="banner-content">
        <h1>智能化企业管理平台</h1>

        <p>高效、安全、稳定的一站式业务管理解决方案</p>

        <div class="feature-list">
          <div v-for="item in features" :key="item.name" class="feature-item">
            <div class="feature-icon">
              <SvgIcon :name="item.icon" size="18" />
            </div>

            <span>
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="banner-footer">
        <span> © {{ year }} Nexus Admin </span>
      </div>
    </aside>

    <!-- 登录区域 -->

    <main class="login-main">
      <div class="login-box">
        <!-- 移动端LOGO -->

        <div class="mobile-brand">
          <div class="brand-logo">
            <SvgIcon name="ri:hexagon-fill" size="20" />
          </div>

          <span> Nexus Admin </span>
        </div>

        <div class="login-card">
          <header class="login-header">
            <h2>欢迎登录</h2>

            <p>输入账号信息进入管理系统</p>
          </header>

          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" size="large" placeholder="请输入用户名" :prefix-icon="UserIcon" />
            </el-form-item>

            <el-form-item prop="password">
              <el-input v-model="loginForm.password" size="large" type="password" placeholder="请输入密码" show-password
                :prefix-icon="LockIcon" @keyup.enter="handleLogin" />
            </el-form-item>

            <div class="login-options">
              <el-checkbox v-model="rememberMe"> 记住登录 </el-checkbox>

              <el-link type="primary" :underline="false"> 忘记密码？ </el-link>
            </div>

            <el-button class="login-btn" size="large" type="primary" :loading="loading" @click="handleLogin"> 登 录
            </el-button>
          </el-form>

          <div class="security">
            <SvgIcon name="ri:shield-check-line" size="16" />

            企业级安全认证
          </div>
        </div>

        <footer class="copyright">Nexus Admin © {{ year }}</footer>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";

import { User as UserIcon, Lock as LockIcon } from "@element-plus/icons-vue";

import { FormInstance, FormRules, ElMessage } from "element-plus";

import SvgIcon from "@/components/svg-icon/index.vue";

import useUserStore from "@/store/modules/user";

const router = useRouter();

const loginFormRef = ref<FormInstance>();

const loading = ref(false);

const rememberMe = ref(false);

const year = new Date().getFullYear();

const loginForm = reactive({
  username: "",

  password: "",
});

const rules = reactive<FormRules>({
  username: [
    {
      required: true,
      message: "请输入用户名",
      trigger: "blur",
    },
  ],

  password: [
    {
      required: true,

      message: "请输入密码",

      trigger: "blur",
    },

    {
      min: 6,

      message: "密码长度不少于6位",

      trigger: "blur",
    },
  ],
});

const features = [
  {
    icon: "ri:shield-check-line",

    name: "权限安全管理",
  },

  {
    icon: "ri:database-2-line",

    name: "数据智能分析",
  },

  {
    icon: "ri:computer-line",

    name: "多端业务协同",
  },
];

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
.login-container {
  display: flex;

  min-height: 100vh;

  background: #f5f7fb;
}

/* ============================
   左侧品牌区域
============================ */

.login-banner {
  position: relative;

  display: none;

  flex-direction: column;

  width: 52%;

  padding: 48px 60px;

  overflow: hidden;

  color: #fff;

  background:
    radial-gradient(circle at 20% 20%, rgba(64, 128, 255, 0.35), transparent 35%), linear-gradient(135deg, #0f172a, #1d4ed8);

  @media (min-width: 1024px) {
    display: flex;
  }

  &::after {
    content: "";

    position: absolute;

    width: 600px;

    height: 600px;

    right: -250px;

    bottom: -250px;

    border-radius: 50%;

    background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 70%);
  }
}

/* 品牌 */

.brand {
  position: relative;

  z-index: 2;

  display: flex;

  align-items: center;

  gap: 14px;
}

.brand-logo {
  display: flex;

  align-items: center;

  justify-content: center;

  width: 46px;

  height: 46px;

  color: white;

  border-radius: 14px;

  background: linear-gradient(135deg, #60a5fa, #2563eb);

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.brand-name {
  font-size: 22px;

  font-weight: 700;
}

.brand-sub {
  margin-top: 4px;

  font-size: 12px;

  opacity: 0.7;
}

/* 中间内容 */

.banner-content {
  position: relative;

  z-index: 2;

  flex: 1;

  display: flex;

  flex-direction: column;

  justify-content: center;
}

.banner-content h1 {
  margin: 0;

  font-size: 38px;

  line-height: 1.3;

  letter-spacing: -1px;
}

.banner-content p {
  margin-top: 18px;

  font-size: 16px;

  opacity: 0.75;
}

/* 功能列表 */

.feature-list {
  display: flex;

  gap: 20px;

  margin-top: 45px;
}

.feature-item {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 12px 18px;

  border-radius: 12px;

  background: rgba(255, 255, 255, 0.1);

  backdrop-filter: blur(10px);

  font-size: 14px;
}

.feature-icon {
  display: flex;
}

/* 底部 */

.banner-footer {
  position: relative;

  z-index: 2;

  font-size: 13px;

  opacity: 0.6;
}

/* ============================
   登录主体
============================ */

.login-main {
  flex: 1;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 30px;

  background: linear-gradient(160deg, #ffffff, #f3f6ff);
}

.login-box {
  width: 100%;

  max-width: 420px;
}

/* 移动端品牌 */

.mobile-brand {
  display: flex;

  justify-content: center;

  align-items: center;

  gap: 10px;

  margin-bottom: 25px;

  font-size: 22px;

  font-weight: 700;

  @media (min-width: 1024px) {
    display: none;
  }
}

/* 登录卡片 */

.login-card {
  padding: 45px 38px;

  border-radius: 26px;

  background: rgba(255, 255, 255, 0.85);

  backdrop-filter: blur(20px);

  border: 1px solid rgba(255, 255, 255, 0.7);

  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.12);

  animation: cardShow 0.6s ease;
}

@keyframes cardShow {
  from {
    opacity: 0;

    transform: translateY(20px);
  }

  to {
    opacity: 1;

    transform: translateY(0);
  }
}

/* 标题 */

.login-header {
  margin-bottom: 32px;

  h2 {
    margin: 0;

    font-size: 28px;

    font-weight: 700;

    color: #111827;
  }

  p {
    margin-top: 10px;

    color: #64748b;

    font-size: 14px;
  }
}

/* 输入框 */

.login-form {
  :deep(.el-input__wrapper) {
    height: 48px;

    padding: 0 15px;

    border-radius: 12px;

    background: #f8fafc;

    box-shadow: inset 0 0 0 1px #e2e8f0;

    transition: 0.25s;
  }

  :deep(.el-input__wrapper.is-focus) {
    background: #fff;

    box-shadow:
      0 0 0 4px rgba(37, 99, 235, 0.12),
      inset 0 0 0 1px #2563eb;
  }
}

.login-options {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin: 18px 0 25px;

  font-size: 13px;
}

/* 登录按钮 */

.login-btn {
  width: 100%;

  height: 50px;

  border-radius: 14px;

  border: none;

  font-size: 16px;

  font-weight: 600;

  letter-spacing: 2px;

  background: linear-gradient(135deg, #2563eb, #60a5fa);

  box-shadow: 0 12px 25px rgba(37, 99, 235, 0.35);

  transition: 0.3s;

  &:hover {
    transform: translateY(-2px);

    box-shadow: 0 18px 35px rgba(37, 99, 235, 0.4);
  }
}

/* 安全提示 */

.security {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  margin-top: 30px;

  color: #64748b;

  font-size: 13px;
}

/* 页脚 */

.copyright {
  margin-top: 25px;

  text-align: center;

  color: #94a3b8;

  font-size: 12px;
}

/* ============================
   暗色模式
============================ */

.dark {
  .login-main {
    background: #020617;
  }

  .login-card {
    background: rgba(15, 23, 42, 0.8);

    border-color: rgba(255, 255, 255, 0.08);
  }

  .login-header h2 {
    color: #fff;
  }

  .login-header p,
  .security,
  .copyright {
    color: #94a3b8;
  }

  .login-form {
    :deep(.el-input__wrapper) {
      background: #111827;

      box-shadow: inset 0 0 0 1px #334155;
    }
  }
}
</style>
