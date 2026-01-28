<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">角色管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <el-table :data="roleList" v-loading="loading" stripe>
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" :icon="Setting" @click="handlePermission(row)">权限</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue';

const loading = ref(false);
const roleList = ref([
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1 },
  { id: 2, name: '普通管理员', code: 'manager', description: '拥有部分管理权限', status: 1 },
  { id: 3, name: '普通用户', code: 'user', description: '普通用户权限', status: 1 },
  { id: 4, name: '访客', code: 'guest', description: '仅查看权限', status: 0 },
]);

const handleAdd = () => ElMessage.info('新增角色');
const handleEdit = (row: any) => ElMessage.info(`编辑角色: ${row.name}`);
const handlePermission = (row: any) => ElMessage.info(`配置权限: ${row.name}`);
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除角色 "${row.name}" 吗？`, '提示', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功');
  });
};

onMounted(() => {});
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
</style>
