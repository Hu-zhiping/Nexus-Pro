<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">部门管理</h2>
        <p class="page-desc">管理组织架构与部门信息</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增部门</el-button>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="deptList" row-key="id" border stripe default-expand-all empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无部门数据" />
        </template>
        <el-table-column prop="name" label="部门名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <SvgIcon name="ri:building-line" size="16" class="dept-icon" />
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" min-width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" min-width="150" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAddChild(row as DeptItem)">添加</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row as DeptItem)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as DeptItem)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import SvgIcon from "@/components/svg-icon/index.vue";

interface DeptItem {
  id: number;
  name: string;
  leader: string;
  phone: string;
  email: string;
  sort: number;
  children?: DeptItem[];
}

const loading = ref(false);
const deptList = ref<DeptItem[]>([
  {
    id: 1,
    name: "总公司",
    leader: "张三",
    phone: "13800138000",
    email: "admin@company.com",
    sort: 1,
    children: [
      {
        id: 11,
        name: "技术部",
        leader: "李四",
        phone: "13800138001",
        email: "tech@company.com",
        sort: 1,
      },
      {
        id: 12,
        name: "产品部",
        leader: "王五",
        phone: "13800138002",
        email: "product@company.com",
        sort: 2,
      },
      {
        id: 13,
        name: "运营部",
        leader: "赵六",
        phone: "13800138003",
        email: "ops@company.com",
        sort: 3,
      },
    ],
  },
]);

const handleAdd = () => ElMessage.info("新增部门");
const handleAddChild = (row: DeptItem) => ElMessage.info(`为 "${row.name}" 添加子部门`);
const handleEdit = (row: DeptItem) => ElMessage.info(`编辑部门: ${row.name}`);
const handleDelete = (row: DeptItem) => {
  ElMessageBox.confirm(`确定删除部门 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("删除成功");
  });
};
</script>

<style scoped lang="scss">
.dept-icon {
  margin-right: 8px;
  color: var(--color-primary);
}
</style>
