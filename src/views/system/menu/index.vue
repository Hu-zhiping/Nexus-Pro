<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">菜单管理</h2>
        <p class="page-desc">管理系统路由菜单与权限配置</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增菜单</el-button>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="menuList" row-key="id" border stripe default-expand-all empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无菜单数据" />
        </template>
        <el-table-column prop="meta.title" label="菜单名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <SvgIcon v-if="row.meta?.icon" :name="row.meta.icon as string" size="16" class="menu-icon" />
            <span>{{ row.meta?.title || row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="meta.hidden" label="是否隐藏" width="100">
          <template #default="{ row }">
            <el-tag :type="row.meta?.hidden ? 'info' : 'success'" size="small">
              {{ row.meta?.hidden ? "隐藏" : "显示" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAddChild(row as MenuDisplayItem)">添加</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row as MenuDisplayItem)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as MenuDisplayItem)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import SvgIcon from "@/components/svg-icon/index.vue";
import useMenuStore from "@/store/modules/menu";
import type { RouteRecordRaw } from "vue-router";

interface MenuDisplayItem {
  id: string;
  path: string;
  name?: string;
  component: string;
  meta?: RouteRecordRaw["meta"];
  children?: MenuDisplayItem[];
}

const loading = ref(false);
const menuList = ref<MenuDisplayItem[]>([]);
const menuStore = useMenuStore();

const transformMenus = (routes: RouteRecordRaw[]): MenuDisplayItem[] => {
  if (!routes) return [];
  const result: MenuDisplayItem[] = [];
  routes.forEach((route) => {
    if (!route.meta?.hidden) {
      const item: MenuDisplayItem = {
        id: route.path,
        path: route.path,
        name: route.name as string,
        component: "-",
        meta: route.meta,
        children: transformMenus(route.children || []),
      };
      result.push(item);
    }
  });
  return result;
};

// 获取菜单列表
const fetchMenuList = () => {
  loading.value = true;
  const routes = menuStore.sidebarMenus;
  menuList.value = transformMenus(routes || []);
  loading.value = false;
};

// 新增菜单
const handleAdd = () => {
  ElMessage.info("打开新增菜单对话框");
};

// 添加子菜单
const handleAddChild = (row: MenuDisplayItem) => {
  ElMessage.info(`为 "${row.meta?.title}" 添加子菜单`);
};

// 编辑菜单
const handleEdit = (row: MenuDisplayItem) => {
  ElMessage.info(`编辑菜单: ${row.meta?.title}`);
};

// 删除菜单
const handleDelete = (row: MenuDisplayItem) => {
  ElMessageBox.confirm(`确定要删除菜单 "${row.meta?.title}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("删除成功");
  });
};

onMounted(() => {
  fetchMenuList();
});
</script>

<style scoped lang="scss">
.menu-icon {
  margin-right: 8px;
}
</style>
