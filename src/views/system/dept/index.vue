<template>
  <div class="page-container">
    <!-- 卡片式页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">部门管理</h2>
        <p class="page-desc">管理组织架构与部门信息</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="handleAdd()">
          <SvgIcon name="ri:add-line" size="16" />
          <span>新增部门</span>
        </el-button>
      </div>
    </div>

    <el-card class="content-card" shadow="never">
      <!-- 工具栏：筛选 + 汇总 + 展开 -->
      <div class="table-toolbar">
        <el-input v-model="keyword" class="toolbar-filter" placeholder="搜索部门 / 负责人 / 联系方式" clearable>
          <template #prefix>
            <SvgIcon name="ri:search-line" size="14" />
          </template>
        </el-input>

        <div class="toolbar-right">
          <span class="toolbar__summary">共 <strong>{{ filteredCount }}</strong> / {{ totalCount }} 个部门</span>

          <el-button link :disabled="!filteredDeptList.length" @click="toggleExpandAll">
            <SvgIcon name="ri:expand-up-down-line" size="14" />
            <span>{{ isExpandAll ? "折叠全部" : "展开全部" }}</span>
          </el-button>
        </div>
      </div>

      <el-table
v-if="isReady" v-loading="loading" :data="filteredDeptList" row-key="id"
        :default-expand-all="isExpandAll || !!keyword.trim()" empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无部门数据" />
        </template>
        <el-table-column prop="name" label="部门名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <SvgIcon name="ri:building-line" size="16" class="dept-icon" />
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" min-width="110" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.leader || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text">{{ row.phone || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="190" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text">{{ row.email || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="light">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAddChild(row as DeptItem)">新增</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row as DeptItem)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row as DeptItem)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑对话框 -->
    <el-dialog
v-model="dialogVisible" :title="dialogTitle" width="520px" :close-on-click-modal="false"
      @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="84px">
        <el-form-item label="上级部门" prop="parentId">
          <el-cascader
v-model="formData.parentId" :options="parentOptions" :props="cascaderProps" clearable
            placeholder="不选则为顶级部门" style="width: 100%" />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入部门名称" maxlength="40" show-word-limit />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="formData.leader" placeholder="请输入负责人姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="60" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" controls-position="right" />
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
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { getDeptList, saveDept, deleteDept } from "@/api/system";
import type { DeptItem, DeptPayload } from "@/api/system";

defineOptions({ name: "DeptManage" });

interface DeptForm {
  id?: number;
  parentId: number;
  name: string;
  leader: string;
  phone: string;
  email: string;
  sort: number;
  status: number;
}

const loading = ref(false);
const submitting = ref(false);
const deptList = ref<DeptItem[]>([]);
const isExpandAll = ref(true);
const isReady = ref(false);

const keyword = ref("");

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive<DeptForm>({
  parentId: 0,
  name: "",
  leader: "",
  phone: "",
  email: "",
  sort: 1,
  status: 1,
});

const cascaderProps = {
  value: "id",
  label: "name",
  children: "children",
  checkStrictly: true,
  emitPath: false,
};

const formRules: FormRules = {
  name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
  phone: [{ pattern: /^1[3-9]\d{9}$|^$/, message: "请输入正确的手机号", trigger: "blur" }],
  email: [{ type: "email", message: "请输入正确的邮箱", trigger: "blur" }],
};

const totalCount = computed(() => {
  const walk = (nodes: DeptItem[]): number => nodes.reduce((acc, n) => acc + 1 + walk(n.children || []), 0);
  return walk(deptList.value);
});

const dialogTitle = computed(() => (formData.id ? "编辑部门" : "新增部门"));

const parentOptions = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = (nodes: DeptItem[]): any[] =>
    nodes.map((n) => ({ ...n, children: n.children?.length ? walk(n.children) : undefined }));
  return walk(deptList.value);
});

/** 关键词过滤：命中自身保留整棵子树，仅子级命中则保留过滤后的子树 */
const filteredDeptList = computed<DeptItem[]>(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return deptList.value;

  const walk = (nodes: DeptItem[]): DeptItem[] =>
    nodes.reduce<DeptItem[]>((acc, node) => {
      const children = node.children?.length ? walk(node.children) : [];
      const haystack = [node.name, node.leader, node.phone, node.email].map((v) => (v || "").toLowerCase());
      if (haystack.some((v) => v.includes(kw))) {
        acc.push(node);
      } else if (children.length) {
        acc.push({ ...node, children });
      }
      return acc;
    }, []);

  return walk(deptList.value);
});

const filteredCount = computed(() => {
  const walk = (nodes: DeptItem[]): number => nodes.reduce((acc, n) => acc + 1 + walk(n.children || []), 0);
  return walk(filteredDeptList.value);
});

function toggleExpandAll() {
  isExpandAll.value = !isExpandAll.value;
  isReady.value = false;
  nextTick(() => {
    isReady.value = true;
  });
}

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await getDeptList();
    deptList.value = data || [];
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formRef.value?.resetFields();
  formData.id = undefined;
  formData.parentId = 0;
  formData.name = "";
  formData.leader = "";
  formData.phone = "";
  formData.email = "";
  formData.sort = 1;
  formData.status = 1;
}

function openDialog(payload?: DeptItem, parent?: DeptItem) {
  resetForm();
  if (payload) {
    formData.id = payload.id;
    formData.parentId = payload.parentId || 0;
    formData.name = payload.name;
    formData.leader = payload.leader || "";
    formData.phone = payload.phone || "";
    formData.email = payload.email || "";
    formData.sort = payload.sort;
    formData.status = payload.status;
  } else if (parent) {
    formData.parentId = parent.id;
  }
  dialogVisible.value = true;
}

function handleAdd() {
  openDialog();
}

function handleAddChild(row: DeptItem) {
  openDialog(undefined, row);
}

function handleEdit(row: DeptItem) {
  openDialog(row);
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const payload: DeptPayload = {
      id: formData.id,
      parentId: formData.parentId || 0,
      name: formData.name,
      leader: formData.leader,
      phone: formData.phone,
      email: formData.email,
      sort: formData.sort,
      status: formData.status,
    };
    await saveDept(payload);
    ElMessage.success(formData.id ? "部门已更新" : "部门已创建");
    dialogVisible.value = false;
    fetchData();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: DeptItem) {
  try {
    await ElMessageBox.confirm(
      `删除部门「${row.name}」将同时移除其下所有子部门，是否继续？`,
      "删除确认",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        confirmButtonClass: "el-button--danger",
      },
    );
  } catch {
    return;
  }
  await deleteDept(row.id);

  /* 危险操作的完成反馈用中性提示 */
  ElMessage.info(`已删除「${row.name}」`);
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

.dept-icon {
  margin-right: 8px;

  color: var(--color-primary);
}

.mono-text {
  font-family: ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace;

  font-size: var(--font-size-xs);

  color: var(--color-text-secondary);
}
</style>
