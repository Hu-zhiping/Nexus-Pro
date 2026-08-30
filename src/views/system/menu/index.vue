<template>
  <div class="page-container">
    <!-- 卡片式页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">菜单管理</h2>
        <p class="page-desc">管理系统路由菜单与权限配置</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="handleAdd()">
          <SvgIcon name="ri:add-line" size="16" />
          <span>新增菜单</span>
        </el-button>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <!-- 工具栏：筛选 + 汇总 + 展开 -->
      <div class="table-toolbar">
        <el-input v-model="keyword" class="toolbar-filter" placeholder="搜索菜单名称 / 路径 / 权限标识" clearable>
          <template #prefix>
            <SvgIcon name="ri:search-line" size="14" />
          </template>
        </el-input>

        <div class="toolbar-right">
          <span class="toolbar__summary">共 <strong>{{ filteredCount }}</strong> / {{ totalCount }} 项</span>

          <el-button link :disabled="!filteredMenuList.length" @click="toggleExpandAll">
            <SvgIcon name="ri:expand-up-down-line" size="14" />
            <span>{{ isExpandAll ? "折叠全部" : "展开全部" }}</span>
          </el-button>
        </div>
      </div>

      <el-table
v-if="isReady" v-loading="loading" :data="filteredMenuList" row-key="id"
        :default-expand-all="isExpandAll || !!keyword.trim()" empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无菜单数据" />
        </template>
        <el-table-column prop="title" label="菜单名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <SvgIcon v-if="row.icon" :name="row.icon" size="16" class="menu-icon" />
            <span>{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type as MenuType)" size="small" effect="plain">
              {{ typeLabel(row.type as MenuType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text">{{ row.path || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件路径" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text">{{ row.component || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text">{{ row.permission || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60" align="center" />
        <el-table-column label="显示状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hidden ? 'info' : 'success'" size="small">
              {{ row.hidden ? "隐藏" : "显示" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
v-if="row.type !== 'button'" link type="primary" size="small"
              @click="handleAddChild(row as MenuTreeItem)">新增</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row as MenuTreeItem)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as MenuTreeItem)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑对话框 -->
    <el-dialog
v-model="dialogVisible" :title="dialogTitle" width="640px" :close-on-click-modal="false"
      @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="96px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
v-model="formData.parentId" :data="parentOptions" :props="treeSelectProps" check-strictly
            clearable placeholder="不选则为顶级菜单" style="width: 100%" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group
v-model="formData.type"
            @change="(v: string | number | boolean | undefined) => onTypeChange(v as MenuType)">
            <el-radio value="directory">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单名称" maxlength="20" show-word-limit />
        </el-form-item>
        <template v-if="formData.type !== 'button'">
          <el-form-item label="路由名称" prop="name">
            <el-input v-model="formData.name" placeholder="如：syncTask" maxlength="40" />
          </el-form-item>
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="formData.path" placeholder="如：/sync/task 或 task" maxlength="60" />
          </el-form-item>
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="formData.component" placeholder="如：data/report/index 或 Layout" maxlength="80" />
          </el-form-item>
          <el-form-item label="菜单图标" prop="icon">
            <IconPicker v-model="formData.icon" placeholder="点击选择图标" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="权限标识" prop="permission">
            <el-input v-model="formData.permission" placeholder="如：system:user:add" maxlength="60" />
          </el-form-item>
        </template>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item v-if="formData.type !== 'button'" label="是否隐藏" prop="hidden">
          <el-radio-group v-model="formData.hidden">
            <el-radio :value="false">显示</el-radio>
            <el-radio :value="true">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import IconPicker from "@/components/IconPicker/index.vue";
import { getMenuTree, saveMenu, deleteMenu } from "@/api/system";
import type { MenuTreeItem, MenuPayload, MenuType } from "@/api/system";

defineOptions({ name: "MenuManage" });

interface MenuForm {
  id?: string | number;
  parentId: string | number | null;
  type: MenuType;
  title: string;
  name?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  hidden: boolean;
  permission?: string;
}

const loading = ref(false);
const submitting = ref(false);
const menuList = ref<MenuTreeItem[]>([]);
const isExpandAll = ref(true);
const isReady = ref(false);

const keyword = ref("");

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive<MenuForm>({
  parentId: null,
  type: "menu",
  title: "",
  name: "",
  path: "",
  component: "",
  icon: "",
  sort: 1,
  hidden: false,
  permission: "",
});

const formRules: FormRules = {
  title: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  name: [{ required: true, message: "请输入路由名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
};

const treeSelectProps = { label: "title", children: "children", value: "id" };

const dialogTitle = computed(() => (formData.id ? "编辑菜单" : "新增菜单"));

const parentOptions = computed<MenuTreeItem[]>(() => {
  const walk = (nodes: MenuTreeItem[]): MenuTreeItem[] =>
    nodes
      .filter((n) => n.type !== "button")
      .map((n) => ({ ...n, children: n.children?.length ? walk(n.children) : undefined }));
  return walk(menuList.value);
});

const totalCount = computed(() => {
  const walk = (nodes: MenuTreeItem[]): number => nodes.reduce((acc, n) => acc + 1 + walk(n.children || []), 0);
  return walk(menuList.value);
});

/** 关键词过滤：命中自身保留整棵子树，仅子级命中则保留过滤后的子树 */
const filteredMenuList = computed<MenuTreeItem[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return menuList.value;

  const walk = (nodes: MenuTreeItem[]): MenuTreeItem[] =>
    nodes.reduce<MenuTreeItem[]>((acc, node) => {
      const children = node.children?.length ? walk(node.children) : [];
      const haystack = [node.title, node.path, node.name, node.component, node.permission]
        .map((v) => (v || "").toLowerCase());
      if (haystack.some((v) => v.includes(kw))) {
        acc.push(node);
      } else if (children.length) {
        acc.push({ ...node, children });
      }
      return acc;
    }, []);

  return walk(menuList.value);
});

const filteredCount = computed(() => {
  const walk = (nodes: MenuTreeItem[]): number => nodes.reduce((acc, n) => acc + 1 + walk(n.children || []), 0);
  return walk(filteredMenuList.value);
});

function toggleExpandAll() {
  isExpandAll.value = !isExpandAll.value;
  isReady.value = false;
  nextTick(() => {
    isReady.value = true;
  });
}

function typeLabel(t: MenuType) {
  switch (t) {
    case "directory":
      return "目录";
    case "menu":
      return "菜单";
    case "button":
      return "按钮";
    default:
      return "—";
  }
}

function typeTagType(t: MenuType): "primary" | "success" | "warning" {
  switch (t) {
    case "directory":
      return "primary";
    case "menu":
      return "success";
    case "button":
      return "warning";
    default:
      return "primary";
  }
}

function onTypeChange(value: MenuType) {
  if (value === "button") {
    formData.component = "";
    formData.icon = "";
    formData.path = "";
    formData.name = "";
    formData.hidden = false;
  } else {
    formData.permission = "";
  }
}

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await getMenuTree();
    menuList.value = data || [];
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formRef.value?.resetFields();
  formData.id = undefined;
  formData.parentId = null;
  formData.type = "menu";
  formData.title = "";
  formData.name = "";
  formData.path = "";
  formData.component = "";
  formData.icon = "";
  formData.sort = 1;
  formData.hidden = false;
  formData.permission = "";
}

function openDialog(payload?: MenuTreeItem, parent?: MenuTreeItem) {
  resetForm();
  if (payload) {
    formData.id = payload.id;
    formData.parentId = payload.parentId;
    formData.type = payload.type;
    formData.title = payload.title;
    formData.name = payload.name;
    formData.path = payload.path;
    formData.component = payload.component;
    formData.icon = payload.icon;
    formData.sort = payload.sort;
    formData.hidden = payload.hidden;
    formData.permission = payload.permission;
  } else if (parent) {
    formData.parentId = parent.id;
    formData.type = "menu";
  }
  dialogVisible.value = true;
}

function handleAdd() {
  openDialog();
}

function handleAddChild(row: MenuTreeItem) {
  openDialog(undefined, row);
}

function handleEdit(row: MenuTreeItem) {
  openDialog(row);
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const payload: MenuPayload = {
      id: formData.id,
      parentId: formData.parentId ?? null,
      type: formData.type,
      title: formData.title,
      name: formData.name,
      path: formData.path,
      component: formData.component,
      icon: formData.icon,
      sort: formData.sort,
      hidden: formData.hidden,
      permission: formData.permission,
    };
    await saveMenu(payload);
    ElMessage.success(formData.id ? "菜单已更新" : "菜单已创建");
    dialogVisible.value = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: MenuTreeItem) {
  try {
    await ElMessageBox.confirm(`删除菜单「${row.title}」将同时移除其下所有子菜单，是否继续？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
      confirmButtonClass: "el-button--danger",
    });
  } catch {
    return;
  }
  await deleteMenu(row.id);

  /* 危险操作的完成反馈用中性提示 */
  ElMessage.info(`已删除「${row.title}」`);
  fetchData();
}

onMounted(() => {
  isReady.value = true;
  fetchData();
});
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;

  gap: var(--layout-content-gap);
}

/* 卡片式页头，与其他管理页统一 */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--space-4);

  padding: var(--space-4) var(--space-5);

  background: var(--color-bg-card);

  border: 1px solid var(--color-border-light);

  border-radius: var(--radius-lg);
}

.page-title {
  margin: 0;

  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);

  color: var(--color-text-primary);
}

.page-desc {
  margin: 2px 0 0;

  font-size: var(--font-size-sm);

  color: var(--color-text-secondary);
}

.content-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: var(--space-4) var(--space-5) var(--space-5);
  }
}

.table-toolbar {
  display: flex;
  align-items: center;

  gap: var(--space-3);

  margin-bottom: var(--space-3);
}

.toolbar-filter {
  width: 280px;
}

.toolbar-right {
  display: flex;
  align-items: center;

  gap: var(--space-3);

  margin-left: auto;
}

.toolbar__summary {
  font-size: var(--font-size-sm);

  color: var(--color-text-tertiary);

  strong {
    margin: 0 2px;

    color: var(--color-text-primary);
  }
}

.menu-icon {
  margin-right: 8px;

  color: var(--color-primary);
}

.mono-text {
  font-family: ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace;

  font-size: var(--font-size-xs);

  color: var(--color-text-secondary);
}
</style>
