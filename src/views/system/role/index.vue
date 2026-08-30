<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">角色管理</h2>
        <p class="page-desc">管理系统角色与权限分配</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="handleAdd">
          <SvgIcon name="ri:add-line" size="16" />
          <span>新增角色</span>
        </el-button>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <el-input
          v-model="filters.keyword"
          placeholder="角色名称 / 编码"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <SvgIcon name="ri:search-line" size="14" />
          </template>
        </el-input>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <div class="search-form__btns">
          <el-button type="primary" @click="handleSearch">
            <SvgIcon name="ri:search-line" size="16" />
            <span>搜索</span>
          </el-button>
          <el-button @click="handleReset">
            <SvgIcon name="ri:refresh-line" size="16" />
            <span>重置</span>
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="content-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar__summary">共 <strong>{{ total }}</strong> 个角色</div>
      </div>

      <el-table v-loading="loading" :data="roleList" border stripe row-key="id" empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无角色数据" />
        </template>
        <el-table-column prop="name" label="角色名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="code" label="角色编码" min-width="160" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              @change="(v: string | number | boolean) => handleToggleStatus(row as RoleItem, v)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handlePermission(row as RoleItem)">
              <SvgIcon name="ri:shield-keyhole-line" size="14" />
              <span>权限</span>
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row as RoleItem)">编辑</el-button>
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
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增 / 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="84px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="如：admin / data_engineer"
            maxlength="40"
            show-word-limit
            :disabled="!!formData.id"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="说明该角色的职责与权限范围"
            maxlength="120"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权限分配对话框 -->
    <el-dialog
      v-model="permVisible"
      title="权限分配"
      width="560px"
      :close-on-click-modal="false"
      @closed="permForm.menuIds = []"
    >
      <div v-if="permForm.roleName" class="perm-head">
        <span class="perm-head__label">当前角色：</span>
        <el-tag type="primary" effect="plain">{{ permForm.roleName }}</el-tag>
      </div>
      <div class="perm-toolbar">
        <el-checkbox v-model="permExpandAll" @change="onPermExpandAll">展开全部</el-checkbox>
        <el-checkbox v-model="permCheckAll" @change="onPermCheckAll">全选 / 反选</el-checkbox>
        <el-link type="primary" :underline="false" @click="onPermClear">清空</el-link>
      </div>
      <el-tree
        ref="permTreeRef"
        :data="menuTree"
        node-key="id"
        show-checkbox
        :default-expand-all="permExpandAll"
        :props="{ label: 'title', children: 'children' }"
        class="perm-tree"
      />
      <template #footer>
        <el-button @click="permVisible = false">取消</el-button>
        <el-button type="primary" :loading="permSubmitting" @click="handlePermSubmit">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { getRoleList, saveRole, deleteRole, toggleRoleStatus, getMenuTree } from "@/api/system";
import type { RoleItem, RolePayload, MenuTreeItem } from "@/api/system";

defineOptions({ name: "RoleManage" });

interface RoleForm {
  id?: number;
  name: string;
  code: string;
  description: string;
  status: number;
}

const loading = ref(false);
const submitting = ref(false);
const roleList = ref<RoleItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const filters = reactive({ keyword: "", status: "" as number | "" });

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive<RoleForm>({
  name: "",
  code: "",
  description: "",
  status: 1,
});

const formRules: FormRules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [
    { required: true, message: "请输入角色编码", trigger: "blur" },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: "编码需以字母开头，仅含字母数字下划线", trigger: "blur" },
  ],
};

const dialogTitle = computed(() => (formData.id ? "编辑角色" : "新增角色"));

const permVisible = ref(false);
const permSubmitting = ref(false);
const permExpandAll = ref(true);
const permCheckAll = ref(false);
const permTreeRef = ref();
const menuTree = ref<MenuTreeItem[]>([]);
const permForm = reactive({
  roleId: 0,
  roleName: "",
  menuIds: [] as (string | number)[],
});

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await getRoleList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: filters.keyword || undefined,
      status: filters.status === "" ? undefined : Number(filters.status),
    });
    roleList.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchData();
}

function handleReset() {
  filters.keyword = "";
  filters.status = "";
  page.value = 1;
  fetchData();
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchData();
}

function handlePageChange(p: number) {
  page.value = p;
  fetchData();
}

function resetForm() {
  formRef.value?.resetFields();
  formData.id = undefined;
  formData.name = "";
  formData.code = "";
  formData.description = "";
  formData.status = 1;
}

function handleAdd() {
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row: RoleItem) {
  resetForm();
  formData.id = row.id;
  formData.name = row.name;
  formData.code = row.code;
  formData.description = row.description;
  formData.status = row.status;
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const payload: RolePayload = { ...formData, menuIds: [] };
    await saveRole(payload);
    ElMessage.success(formData.id ? "角色已更新" : "角色已创建");
    dialogVisible.value = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: RoleItem) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.name}」？相关用户将失去该角色权限。`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  await deleteRole(row.id);
  ElMessage.success("角色已删除");
  fetchData();
}

async function handleToggleStatus(row: RoleItem, value: string | number | boolean) {
  const newStatus = value ? 1 : 0;
  try {
    await toggleRoleStatus(row.id, newStatus);
    row.status = newStatus;
    ElMessage.success(newStatus === 1 ? "已启用" : "已禁用");
  } catch {
    /* handled by interceptor */
  }
}

async function handlePermission(row: RoleItem) {
  permForm.roleId = row.id;
  permForm.roleName = row.name;
  permForm.menuIds = [...row.menuIds];
  permVisible.value = true;
  if (!menuTree.value.length) {
    const { data } = await getMenuTree();
    menuTree.value = data || [];
  }
  nextTick(() => {
    permTreeRef.value?.setCheckedKeys(permForm.menuIds);
  });
}

function onPermExpandAll(value: string | number | boolean) {
  const expand = Boolean(value);
  const tree = permTreeRef.value;
  if (!tree) return;
  const walk = (nodes: MenuTreeItem[]) => {
    nodes.forEach((n) => {
      tree.getNode(n.id)?.expand();
      if (!expand && n.children?.length) walk(n.children);
    });
  };
  walk(menuTree.value);
}

function onPermCheckAll(value: string | number | boolean) {
  const tree = permTreeRef.value;
  if (!tree) return;
  if (value) {
    tree.setCheckedKeys(menuTree.value.map((n) => n.id));
  } else {
    tree.setCheckedKeys([]);
  }
}

function onPermClear() {
  permTreeRef.value?.setCheckedKeys([]);
  permCheckAll.value = false;
}

async function handlePermSubmit() {
  const tree = permTreeRef.value;
  if (!tree) return;
  const checked = tree.getCheckedKeys() as (string | number)[];
  const halfChecked = tree.getHalfCheckedKeys() as (string | number)[];
  const menuIds = [...new Set([...checked, ...halfChecked])];
  permSubmitting.value = true;
  try {
    const target = roleList.value.find((r) => r.id === permForm.roleId);
    if (target) {
      target.menuIds = menuIds;
    }
    await saveRole({
      id: permForm.roleId,
      name: target?.name || "",
      code: target?.code || "",
      description: target?.description || "",
      status: target?.status ?? 1,
      menuIds,
    });
    ElMessage.success("权限已更新");
    permVisible.value = false;
  } finally {
    permSubmitting.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--layout-content-gap);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.page-desc {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.page-actions {
  display: flex;
  gap: 8px;
}

.search-card,
.content-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.content-card :deep(.el-card__body) {
  padding: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  &__btns {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);

  strong {
    color: var(--color-text-primary);
    margin: 0 4px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.perm-head {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;

  &__label {
    color: var(--color-text-secondary);
    margin-right: 4px;
  }
}

.perm-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 8px;
}

.perm-tree {
  max-height: 360px;
  overflow-y: auto;

  :deep(.el-tree-node__label) {
    font-size: 13px;
  }
}
</style>
