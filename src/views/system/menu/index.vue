<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="title">菜单管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增菜单</el-button>
        </div>
      </template>

      <el-table :data="menuList" row-key="id" v-loading="loading" default-expand-all>
        <el-table-column prop="meta.title" label="菜单名称" min-width="180">
          <template #default="{ row }">
            <SvgIcon v-if="row.meta?.icon" :name="row.meta.icon as string" size="16" style="margin-right: 8px" />
            <span>{{ row.meta?.title || row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="180" />
        <el-table-column prop="component" label="组件路径" min-width="200" />
        <el-table-column prop="meta.hidden" label="是否隐藏" width="100">
          <template #default="{ row }">
            <el-tag :type="row.meta?.hidden ? 'info' : 'success'">
              {{ row.meta?.hidden ? '隐藏' : '显示' }}
            </el-tag>
          </template>
        </el-table-column>
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
import useMenuStore from '@/store/modules/menu';

const loading = ref(false);
const menuList = ref<any[]>([]);
const menuStore = useMenuStore();

// 将路由树转换为菜单列表
const transformMenus = (routes: any[]) => {
  const result: any[] = [];
  routes.forEach(route => {
    if (!route.meta?.hidden) {
      const item = {
        id: route.path,
        path: route.path,
        name: route.name,
        component: route.component?.name || '-',
        meta: route.meta,
        children: route.children ? transformMenus(route.children) : []
      };
      result.push(item);
    }
  });
  return result;
};

// 获取菜单列表
const fetchMenuList = () => {
  loading.value = true;
  const routes = menuStore.visibleMenus;
  menuList.value = transformMenus(routes);
  loading.value = false;
};

// 新增菜单
const handleAdd = () => {
  ElMessage.info('打开新增菜单对话框');
};

// 添加子菜单
const handleAddChild = (row: any) => {
  ElMessage.info(`为 "${row.meta?.title}" 添加子菜单`);
};

// 编辑菜单
const handleEdit = (row: any) => {
  ElMessage.info(`编辑菜单: ${row.meta?.title}`);
};

// 删除菜单
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除菜单 "${row.meta?.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功');
  });
};

onMounted(() => {
  fetchMenuList();
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
</style>
