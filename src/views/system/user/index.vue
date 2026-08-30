<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="page-desc">管理系统用户账号、角色与状态</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="handleAdd">
          <SvgIcon name="ri:user-add-line" size="16" />
          <span>新增用户</span>
        </el-button>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <el-input
          v-model="filters.keyword"
          placeholder="用户名 / 昵称"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <SvgIcon name="ri:search-line" size="14" />
          </template>
        </el-input>

        <el-select v-model="filters.role" placeholder="角色" clearable style="width: 160px">
          <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
        </el-select>

        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
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

    <!-- 数据展示 -->
    <el-card class="content-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar__summary">共 <strong>{{ total }}</strong> 位用户</div>
      </div>

      <el-table v-loading="loading" :data="userList" border stripe row-key="id" empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无用户数据" />
        </template>
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role as string)" size="small" effect="light">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dept" label="部门" min-width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" min-width="140" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              active-text="启用"
              inactive-text="禁用"
              inline-prompt
              @change="(v: string | number | boolean) => handleToggleStatus(row as UserItem, v)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row as UserItem)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as UserItem)">删除</el-button>
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
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增 / 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="84px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="字母数字下划线，4-20 位"
            maxlength="20"
            show-word-limit
            :disabled="!!formData.id"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item v-if="!formData.id" label="登录密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            show-password
            placeholder="6-20 位密码"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="dept">
          <el-cascader
            v-model="formData.dept"
            :options="deptOptions"
            :props="{ label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
            clearable
            placeholder="请选择部门"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="60" />
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { getUserList, saveUser, deleteUser, updateUserStatus } from "@/api/user";
import type { UserItem } from "@/api/user";
import { getRoleList, getDeptList } from "@/api/system";
import type { DeptItem, RoleItem } from "@/api/system";

defineOptions({ name: "UserManage" });

interface UserForm {
  id?: string | number;
  username: string;
  nickname: string;
  password?: string;
  role: string;
  dept: string;
  phone: string;
  email: string;
  status: number;
}

const loading = ref(false);
const submitting = ref(false);
const userList = ref<UserItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const filters = reactive({
  keyword: "",
  role: "",
  status: "" as number | "",
});

const roleOptions = ref<string[]>([]);
const deptOptions = ref<DeptItem[]>([]);

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive<UserForm>({
  username: "",
  nickname: "",
  password: "",
  role: "",
  dept: "",
  phone: "",
  email: "",
  status: 1,
});

const formRules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/, message: "用户名需以字母开头，4-20 位字母数字下划线", trigger: "blur" },
  ],
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  password: [
    { required: true, message: "请输入登录密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度 6-20 位", trigger: "blur" },
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  dept: [{ required: true, message: "请选择部门", trigger: "change" }],
  phone: [
    { pattern: /^1[3-9]\d{9}$|^$/, message: "请输入正确的手机号", trigger: "blur" },
  ],
  email: [
    { type: "email", message: "请输入正确的邮箱", trigger: "blur" },
  ],
};

const dialogTitle = computed(() => (formData.id ? "编辑用户" : "新增用户"));

function roleTagType(role: string): "success" | "warning" | "info" | "danger" {
  switch (role) {
    case "超级管理员":
      return "danger";
    case "数据工程师":
      return "warning";
    case "系统管理员":
      return "success";
    default:
      return "info";
  }
}

async function fetchMeta() {
  const [roleRes, deptRes] = await Promise.all([
    getRoleList({ page: 1, pageSize: 100, status: 1 }),
    getDeptList(),
  ]);
  roleOptions.value = (roleRes.data.list as RoleItem[]).map((r) => r.name);
  deptOptions.value = deptRes.data || [];
}

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await getUserList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
      status: filters.status === "" ? undefined : Number(filters.status),
    });
    userList.value = data.list;
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
  filters.role = "";
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
  formData.username = "";
  formData.nickname = "";
  formData.password = "";
  formData.role = "";
  formData.dept = "";
  formData.phone = "";
  formData.email = "";
  formData.status = 1;
}

function handleAdd() {
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row: UserItem) {
  resetForm();
  formData.id = row.id;
  formData.username = row.username;
  formData.nickname = row.nickname;
  formData.role = row.role;
  formData.dept = row.dept;
  formData.phone = row.phone;
  formData.email = row.email;
  formData.status = row.status;
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    await saveUser({
      id: formData.id,
      username: formData.username,
      nickname: formData.nickname,
      password: formData.password,
      role: formData.role,
      dept: formData.dept,
      phone: formData.phone,
      email: formData.email,
      status: formData.status,
    });
    ElMessage.success(formData.id ? "用户已更新" : "用户已创建");
    dialogVisible.value = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: UserItem) {
  try {
    await ElMessageBox.confirm(`确认删除用户「${row.nickname || row.username}」？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  await deleteUser(row.id);
  ElMessage.success("用户已删除");
  fetchData();
}

async function handleToggleStatus(row: UserItem, value: string | number | boolean) {
  const newStatus = value ? 1 : 0;
  try {
    await updateUserStatus(row.id, newStatus);
    row.status = newStatus;
    ElMessage.success(newStatus === 1 ? "已启用" : "已禁用");
  } catch {
    /* handled by interceptor */
  }
}

onMounted(() => {
  fetchMeta();
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
</style>
