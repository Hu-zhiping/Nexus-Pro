<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span class="card-title">个人设置</span>
      </template>

      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="100px" class="settings-form">
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
              >
                <el-avatar v-if="basicForm.avatar" :size="100" :src="basicForm.avatar" />
                <el-avatar v-else :size="100" :icon="UserFilled" />
                <div class="upload-tip">点击更换头像</div>
              </el-upload>
            </el-form-item>

            <el-form-item label="昵称">
              <el-input v-model="basicForm.nickname" placeholder="请输入昵称" style="width: 300px" />
            </el-form-item>

            <el-form-item label="用户名">
              <el-input v-model="basicForm.username" disabled style="width: 300px" />
            </el-form-item>

            <el-form-item label="性别">
              <el-radio-group v-model="basicForm.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="secret">保密</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="个人简介">
              <el-input
                v-model="basicForm.intro"
                type="textarea"
                :rows="4"
                placeholder="请输入个人简介"
                style="width: 500px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 联系信息 -->
        <el-tab-pane label="联系信息" name="contact">
          <el-form :model="contactForm" label-width="100px" class="settings-form">
            <el-form-item label="邮箱">
              <el-input v-model="contactForm.email" placeholder="请输入邮箱" style="width: 300px">
                <template #append>
                  <el-button @click="handleVerifyEmail">验证</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="contactForm.phone" placeholder="请输入手机号" style="width: 300px">
                <template #append>
                  <el-button @click="handleVerifyPhone">更换</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="所在地区">
              <el-cascader
                v-model="contactForm.region"
                :options="regionOptions"
                placeholder="请选择所在地区"
                style="width: 300px"
              />
            </el-form-item>

            <el-form-item label="详细地址">
              <el-input
                v-model="contactForm.address"
                placeholder="请输入详细地址"
                style="width: 500px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveContact">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <div class="security-section">
            <h3>修改密码</h3>
            <el-form :model="passwordForm" label-width="120px" class="settings-form">
              <el-form-item label="当前密码">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                  style="width: 300px"
                />
              </el-form-item>

              <el-form-item label="新密码">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                  style="width: 300px"
                />
              </el-form-item>

              <el-form-item label="确认新密码">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                  style="width: 300px"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 消息通知 -->
        <el-tab-pane label="消息通知" name="notification">
          <el-form label-width="200px" class="settings-form">
            <el-form-item label="系统消息">
              <el-switch v-model="notificationForm.systemMsg" />
              <span class="form-tip">接收系统维护和更新通知</span>
            </el-form-item>

            <el-form-item label="邮件通知">
              <el-switch v-model="notificationForm.emailMsg" />
              <span class="form-tip">接收邮件形式的通知</span>
            </el-form-item>

            <el-form-item label="短信通知">
              <el-switch v-model="notificationForm.smsMsg" />
              <span class="form-tip">接收短信形式的通知</span>
            </el-form-item>

            <el-form-item label="登录提醒">
              <el-switch v-model="notificationForm.loginAlert" />
              <span class="form-tip">账号登录时发送提醒</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveNotification">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UserFilled } from '@element-plus/icons-vue';

const activeTab = ref('basic');

// 基本设置表单
const basicForm = reactive({
  avatar: '',
  nickname: '管理员',
  username: 'admin',
  gender: 'male',
  intro: '',
});

// 联系信息表单
const contactForm = reactive({
  email: 'admin@example.com',
  phone: '13800138000',
  region: [],
  address: '',
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 通知设置
const notificationForm = reactive({
  systemMsg: true,
  emailMsg: true,
  smsMsg: false,
  loginAlert: true,
});

// 地区选项
const regionOptions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [{ value: 'chaoyang', label: '朝阳区' }, { value: 'haidian', label: '海淀区' }],
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [{ value: 'pudong', label: '浦东新区' }, { value: 'huangpu', label: '黄浦区' }],
  },
];

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error('只支持 JPG 或 PNG 格式的图片!');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
  }
  return false;
};

const handleSaveBasic = () => ElMessage.success('基本信息已保存');
const handleSaveContact = () => ElMessage.success('联系信息已保存');
const handleChangePassword = () => ElMessage.success('密码已修改');
const handleSaveNotification = () => ElMessage.success('通知设置已保存');
const handleVerifyEmail = () => ElMessage.info('验证邮件已发送');
const handleVerifyPhone = () => ElMessage.info('短信验证码已发送');
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.settings-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }
}

.settings-form {
  max-width: 800px;
}

.avatar-uploader {
  text-align: center;

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.form-tip {
  margin-left: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.security-section {
  h3 {
    margin: 0 0 24px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}
</style>
