<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">用户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKey"
          placeholder="请输入用户名/昵称"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <!-- 数据表格 -->
      <el-table :data="userList" v-loading="loading" stripe>
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dept" label="部门" min-width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue';
import { getUserList, deleteUser, updateUserStatus } from '@/api/user';

const loading = ref(false);
const searchKey = ref('');
const userList = ref([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取角色标签类型
const getRoleType = (role: string) => {
  const types: Record<string, any> = {
    '超级管理员': 'danger',
    '管理员': 'warning',
    '普通用户': 'info',
  };
  return types[role] || 'info';
};

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res: any = await getUserList({ page: page.value, pageSize: pageSize.value });
    userList.value = res.data?.list || [];
    total.value = res.data?.total || 0;
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchUserList();
};

// 新增
const handleAdd = () => {
  ElMessage.info('打开新增用户对话框');
};

// 编辑
const handleEdit = (row: any) => {
  ElMessage.info(`编辑用户: ${row.username}`);
};

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteUser(row.id);
      ElMessage.success('删除成功');
      fetchUserList();
    } catch (error) {
      console.error('删除失败:', error);
    }
  });
};

// 状态变更
const handleStatusChange = async (row: any) => {
  try {
    await updateUserStatus(row.id, row.status);
    ElMessage.success('状态更新成功');
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1;
    console.error('状态更新失败:', error);
  }
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUserList();
};

const handlePageChange = (val: number) => {
  page.value = val;
  fetchUserList();
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.page-card {
  min-height: calc(100vh - 180px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: 600;
  }
}

.search-bar {
  margin-bottom: 20px;

  .search-input {
    width: 300px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
