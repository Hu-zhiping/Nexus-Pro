<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 左侧个人信息 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="100" :src="userInfo.avatar" class="profile-avatar">
              <SvgIcon name="ri:user-line" size="50" />
            </el-avatar>
            <h3 class="profile-name">{{ userInfo.username }}</h3>
            <p class="profile-role">{{ userInfo.role }}</p>
          </div>

          <el-divider />

          <div class="profile-info">
            <div class="info-item">
              <SvgIcon name="ri:mail-line" size="16" />
              <span>{{ userInfo.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <SvgIcon name="ri:phone-line" size="16" />
              <span>{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <SvgIcon name="ri:building-line" size="16" />
              <span>{{ userInfo.dept || '未设置' }}</span>
            </div>
            <div class="info-item">
              <SvgIcon name="ri:map-pin-line" size="16" />
              <span>{{ userInfo.location || '未设置' }}</span>
            </div>
          </div>

          <el-divider />

          <div class="profile-tags">
            <h4>个人标签</h4>
            <div class="tags-list">
              <el-tag v-for="tag in userInfo.tags" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详情 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>基本资料</span>
              <el-button type="primary" :icon="Edit" @click="handleEdit">编辑资料</el-button>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userInfo.nickname }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ userInfo.gender }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
            <el-descriptions-item label="手机">{{ userInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ userInfo.dept }}</el-descriptions-item>
            <el-descriptions-item label="职位">{{ userInfo.position }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ userInfo.createTime }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ userInfo.lastLoginTime }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header>
            <span>账号安全</span>
          </template>

          <div class="security-list">
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">
                  <SvgIcon name="ri:lock-password-line" size="20" />
                  <span>登录密码</span>
                </div>
                <div class="security-desc">定期修改密码可以保护账号安全</div>
              </div>
              <el-button type="primary" link @click="handleChangePassword">修改</el-button>
            </div>

            <el-divider />

            <div class="security-item">
              <div class="security-info">
                <div class="security-title">
                  <SvgIcon name="ri:smartphone-line" size="20" />
                  <span>手机绑定</span>
                </div>
                <div class="security-desc">已绑定手机：{{ userInfo.phone }}</div>
              </div>
              <el-button type="primary" link @click="handleChangePhone">更换</el-button>
            </div>

            <el-divider />

            <div class="security-item">
              <div class="security-info">
                <div class="security-title">
                  <SvgIcon name="ri:mail-check-line" size="20" />
                  <span>邮箱绑定</span>
                </div>
                <div class="security-desc">已绑定邮箱：{{ userInfo.email }}</div>
              </div>
              <el-button type="primary" link @click="handleChangeEmail">更换</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

const router = useRouter();

const userInfo = reactive({
  id: '10001',
  username: 'admin',
  nickname: '管理员',
  role: '超级管理员',
  gender: '男',
  email: 'admin@example.com',
  phone: '13800138000',
  dept: '技术部',
  position: '高级工程师',
  location: '北京市',
  avatar: '',
  createTime: '2024-01-01 10:00:00',
  lastLoginTime: '2024-01-24 15:30:00',
  tags: ['Vue', 'TypeScript', '前端开发', 'UI设计'],
});

const handleEdit = () => {
  router.push('/profile/settings');
};

const handleChangePassword = () => ElMessage.info('修改密码');
const handleChangePhone = () => ElMessage.info('更换手机号');
const handleChangeEmail = () => ElMessage.info('更换邮箱');
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.profile-card {
  .profile-header {
    text-align: center;
    padding: 20px 0;

    .profile-avatar {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      margin-bottom: 16px;
    }

    .profile-name {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
    }

    .profile-role {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .profile-info {
    padding: 0 12px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      color: var(--el-text-color-regular);
      font-size: 14px;

      &:not(:last-child) {
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
    }
  }

  .profile-tags {
    padding: 0 12px;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.security-list {
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;

    .security-info {
      .security-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .security-desc {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
