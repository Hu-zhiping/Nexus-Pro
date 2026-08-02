<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">角色管理</h2>
        <p class="page-desc">管理系统角色与权限分配</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="roleList" border stripe row-key="id" empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无角色数据" />
        </template>
        <el-table-column prop="name" label="角色名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="code" label="角色编码" min-width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row as RoleItem)">编辑</el-button>
            <el-button link type="primary" size="small" @click="handlePermission(row as RoleItem)">权限</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as RoleItem)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

interface RoleItem {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
}

const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(4);

const roleList = ref<RoleItem[]>([
  { id: 1, name: "超级管理员", code: "admin", description: "拥有所有权限", status: 1 },
  { id: 2, name: "普通管理员", code: "manager", description: "拥有部分管理权限", status: 1 },
  { id: 3, name: "普通用户", code: "user", description: "普通用户权限", status: 1 },
  { id: 4, name: "访客", code: "guest", description: "仅查看权限", status: 0 },
]);

const handleAdd = () => ElMessage.info("新增角色");
const handleEdit = (row: RoleItem) => ElMessage.info(`编辑角色: ${row.name}`);
const handlePermission = (row: RoleItem) => ElMessage.info(`配置权限: ${row.name}`);
const handleDelete = (row: RoleItem) => {
  ElMessageBox.confirm(`确定删除角色 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("删除成功");
  });
};
</script>
