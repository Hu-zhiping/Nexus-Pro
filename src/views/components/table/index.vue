<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">高级表格</h2>
        <p class="page-desc">表格组件示例，展示搜索、分页、操作等功能</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus">新增</el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </div>

    <el-card class="search-card" shadow="never">
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
    </el-card>

    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe row-key="id" empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'A' ? 'primary' : 'success'" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row as TableItem)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row as TableItem)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as TableItem)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Download, Search, RefreshRight } from "@element-plus/icons-vue";

interface TableItem {
  id: number;
  name: string;
  type: string;
  status: number;
  createTime: string;
}

const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(100);

const searchForm = reactive({
  keyword: "",
  status: undefined as number | undefined,
  dateRange: [] as string[],
});

const tableData = ref<TableItem[]>([
  { id: 1, name: "示例数据 1", type: "A", status: 1, createTime: "2024-01-20 10:00:00" },
  { id: 2, name: "示例数据 2", type: "B", status: 0, createTime: "2024-01-19 15:30:00" },
  { id: 3, name: "示例数据 3", type: "A", status: 1, createTime: "2024-01-18 09:00:00" },
  { id: 4, name: "示例数据 4", type: "B", status: 1, createTime: "2024-01-17 14:20:00" },
  { id: 5, name: "示例数据 5", type: "A", status: 0, createTime: "2024-01-16 11:45:00" },
]);

const handleSearch = () => ElMessage.success("搜索");
const handleReset = () => {
  searchForm.keyword = "";
  searchForm.status = undefined;
  searchForm.dateRange = [];
};
const handleView = (row: TableItem) => ElMessage.info(`查看: ${row.name}`);
const handleEdit = (row: TableItem) => ElMessage.info(`编辑: ${row.name}`);
const handleDelete = (row: TableItem) => {
  ElMessageBox.confirm(`确定要删除 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("删除成功");
  });
};
</script>
