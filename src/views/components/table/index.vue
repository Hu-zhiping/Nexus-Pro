<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">高级表格示例</span>
          <div class="actions">
            <el-button type="primary" :icon="Plus">新增</el-button>
            <el-button :icon="Download">导出</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'A' ? 'primary' : 'success'">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
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
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Download, Search, RefreshRight, View, Edit, Delete } from '@element-plus/icons-vue';

const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(100);

const searchForm = reactive({
  keyword: '',
  status: undefined,
  dateRange: [],
});

const tableData = ref([
  { id: 1, name: '示例数据 1', type: 'A', status: 1, createTime: '2024-01-20 10:00:00' },
  { id: 2, name: '示例数据 2', type: 'B', status: 0, createTime: '2024-01-19 15:30:00' },
  { id: 3, name: '示例数据 3', type: 'A', status: 1, createTime: '2024-01-18 09:00:00' },
  { id: 4, name: '示例数据 4', type: 'B', status: 1, createTime: '2024-01-17 14:20:00' },
  { id: 5, name: '示例数据 5', type: 'A', status: 0, createTime: '2024-01-16 11:45:00' },
]);

const handleSearch = () => ElMessage.success('搜索');
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = undefined;
  searchForm.dateRange = [];
};
const handleView = (row: any) => ElMessage.info(`查看: ${row.name}`);
const handleEdit = (row: any) => ElMessage.info(`编辑: ${row.name}`);
const handleDelete = (row: any) => ElMessage.success(`删除: ${row.name}`);
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: 600;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
