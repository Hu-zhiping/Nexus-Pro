<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">部门管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增部门</el-button>
        </div>
      </template>

      <el-table :data="deptList" row-key="id" v-loading="loading" default-expand-all>
        <el-table-column prop="name" label="部门名称" min-width="200">
          <template #default="{ row }">
            <SvgIcon name="ri:building-line" size="16" style="margin-right: 8px; color: var(--el-color-primary)" />
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" min-width="120" />
        <el-table-column prop="phone" label="联系电话" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Plus" @click="handleAddChild(row)">添加</el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
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
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

const loading = ref(false);
const deptList = ref([
  {
    id: 1,
    name: '总公司',
    leader: '张三',
    phone: '13800138000',
    email: 'admin@company.com',
    sort: 1,
    children: [
      {
        id: 11,
        name: '技术部',
        leader: '李四',
        phone: '13800138001',
        email: 'tech@company.com',
        sort: 1,
      },
      {
        id: 12,
        name: '产品部',
        leader: '王五',
        phone: '13800138002',
        email: 'product@company.com',
        sort: 2,
      },
      {
        id: 13,
        name: '运营部',
        leader: '赵六',
        phone: '13800138003',
        email: 'ops@company.com',
        sort: 3,
      }
    ]
  }
]);

const handleAdd = () => ElMessage.info('新增部门');
const handleAddChild = (row: any) => ElMessage.info(`为 "${row.name}" 添加子部门`);
const handleEdit = (row: any) => ElMessage.info(`编辑部门: ${row.name}`);
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除部门 "${row.name}" 吗？`, '提示', { type: 'warning' }).then(() => {
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
