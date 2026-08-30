<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">审批中心</h2>
        <p class="page-desc">集中处理工作流审批任务，支持流程进度追踪与审批操作</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="handleCreate">
          <SvgIcon name="ri:add-line" size="16" />
          <span>发起流程</span>
        </el-button>
      </div>
    </div>

    <!-- 筛选区 -->
    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <el-input
          v-model="query.keyword"
          placeholder="流程标题 / 发起人 / 部门"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <SvgIcon name="ri:search-line" size="14" />
          </template>
        </el-input>

        <el-radio-group v-model="query.status" @change="handleSearch">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="pending">待审批</el-radio-button>
          <el-radio-button value="approved">已通过</el-radio-button>
          <el-radio-button value="rejected">已驳回</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 列表 -->
    <el-card class="content-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar__summary">
          共 <strong>{{ total }}</strong> 条流程
        </div>
      </div>

      <el-table v-loading="loading" :data="rows" row-key="id" empty-text="暂无审批流程">
        <template #empty>
          <el-empty description="暂无审批流程" />
        </template>

        <el-table-column label="流程标题" min-width="240">
          <template #default="{ row }">
            <div class="cell-flow">
              <span class="cell-flow__title">{{ row.title }}</span>
              <span class="cell-flow__id">{{ row.id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="typeMeta(row.type).tag" size="small" effect="plain">
              {{ typeMeta(row.type).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="发起人" min-width="130">
          <template #default="{ row }">
            <div class="cell-applicant">
              <el-avatar :size="26" class="cell-applicant__avatar">{{ row.applicant.charAt(0) }}</el-avatar>
              <div class="cell-applicant__info">
                <span class="cell-applicant__name">{{ row.applicant }}</span>
                <span class="cell-applicant__dept">{{ row.department }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="priorityMeta(row.priority).tag" size="small" effect="plain">
              {{ priorityMeta(row.priority).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="当前节点" min-width="130">
          <template #default="{ row }">
            <span class="cell-node" :class="{ 'is-pending': row.status === 'pending' }">{{ row.currentNode }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMeta(row.status).tag" size="small">
              {{ statusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="发起时间" min-width="165" />

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row as WorkflowItem)">详情</el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              size="small"
              @click="handleAudit(row as WorkflowItem, 'approve')"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              size="small"
              @click="handleAudit(row as WorkflowItem, 'reject')"
            >
              驳回
            </el-button>
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
          @size-change="handleSearch"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 发起流程 -->
    <el-dialog v-model="createVisible" title="发起流程" width="620px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-form-item label="流程模板" prop="templateId">
          <el-select v-model="createForm.templateId" style="width: 100%" @change="applyTemplate">
            <el-option v-for="tpl in templates" :key="tpl.id" :value="tpl.id" :label="tpl.name">
              <span>{{ tpl.name }}</span>
              <span class="tpl-option-desc">{{ tpl.desc }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 审批链预览 + 分节点审批人 -->
        <el-form-item label="审批流程">
          <div class="flow-editor">
            <div class="flow-preview">
              <template v-for="(node, i) in selectedTemplate?.nodes ?? []" :key="node.key">
                <div class="flow-node" :class="{ 'is-endpoint': i === 0 || i === nodeCount - 1 }">
                  <span class="flow-node__name">{{ node.nodeName }}</span>
                  <span class="flow-node__approver">{{ createForm.approvers[i] || node.approver }}</span>
                </div>
                <SvgIcon
                  v-if="i < nodeCount - 1"
                  name="ri:arrow-right-line"
                  size="14"
                  class="flow-arrow"
                />
              </template>
            </div>

            <div v-for="item in approverNodes" :key="item.node.key" class="flow-approver">
              <span class="flow-approver__label">{{ item.node.nodeName }}</span>
              <el-select v-model="createForm.approvers[item.index]" style="flex: 1" size="small">
                <el-option v-for="person in approverCandidates" :key="person" :label="person" :value="person" />
              </el-select>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="流程类型" prop="type">
          <el-select v-model="createForm.type" style="width: 100%">
            <el-option label="请假" value="leave" />
            <el-option label="采购" value="purchase" />
            <el-option label="报销" value="expense" />
            <el-option label="合同" value="contract" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="流程标题" prop="title">
          <el-input v-model="createForm.title" placeholder="如：采购申请 · 显示器升级" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="优先级">
          <el-radio-group v-model="createForm.priority">
            <el-radio-button value="high">高</el-radio-button>
            <el-radio-button value="medium">中</el-radio-button>
            <el-radio-button value="low">低</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="涉及金额">
          <el-input-number v-model="createForm.amount" :min="0" :precision="2" :step="100" controls-position="right" style="width: 220px" />
          <span class="form-hint">元，无金额流程填 0</span>
        </el-form-item>

        <el-form-item label="申请事由" prop="reason">
          <el-input
            v-model="createForm.reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请描述申请事由，审批人将第一时间看到这段内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createVisible = false">取 消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="流程详情" size="600px">
      <template v-if="detail">
        <div class="detail-head">
          <div>
            <h3 class="detail-head__title">{{ detail.title }}</h3>
            <p class="detail-head__meta">{{ detail.id }} · {{ detail.applicant }}（{{ detail.department }}）· {{ detail.createdAt }}</p>
          </div>
          <el-tag :type="statusMeta(detail.status).tag">{{ statusMeta(detail.status).label }}</el-tag>
        </div>

        <!-- 流程步骤 -->
        <el-steps
          class="detail-steps"
          :active="activeStep"
          align-center
          :process-status="detail.status === 'rejected' ? 'error' : 'process'"
          :finish-status="detail.status === 'approved' ? 'success' : 'finish'"
        >
          <el-step v-for="step in detail.steps" :key="step.nodeName" :title="step.nodeName" />
        </el-steps>

        <!-- 申请信息 -->
        <el-descriptions :column="2" border class="detail-desc">
          <el-descriptions-item label="流程类型">{{ typeMeta(detail.type).label }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ priorityMeta(detail.priority).label }}</el-descriptions-item>
          <el-descriptions-item label="涉及金额">¥{{ detail.amount }}</el-descriptions-item>
          <el-descriptions-item label="发起时间">{{ detail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="申请事由" :span="2">{{ detail.reason }}</el-descriptions-item>
        </el-descriptions>

        <!-- 审批记录 -->
        <h4 class="detail-section-title">审批记录</h4>
        <el-timeline class="detail-timeline">
          <el-timeline-item
            v-for="step in detail.steps"
            :key="step.nodeName"
            :type="timelineType(step.status)"
            :hollow="step.status === 'pending'"
            :timestamp="step.time || '待处理'"
            placement="top"
          >
            <div class="timeline-node">
              <span class="timeline-node__name">{{ step.nodeName }}</span>
              <el-tag size="small" :type="stepTagType(step.status)" effect="plain">{{ stepLabel(step.status) }}</el-tag>
            </div>
            <p class="timeline-node__assignee">处理人：{{ step.assignee }}</p>
            <p v-if="step.comment" class="timeline-node__comment">「{{ step.comment }}」</p>
          </el-timeline-item>
        </el-timeline>

        <!-- 审批操作 -->
        <div v-if="detail.status === 'pending'" class="detail-footer">
          <el-button plain type="danger" @click="handleAudit(detail, 'reject')">驳 回</el-button>
          <el-button type="primary" @click="handleAudit(detail, 'approve')">通 过</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { auditWorkflow, createWorkflow, getWorkflowDetail, getWorkflowList, getWorkflowTemplates } from "@/api/workflow";
import type {
  WorkflowDetail,
  WorkflowItem,
  WorkflowStatus,
  WorkflowTemplate,
  WorkflowType,
  WorkflowPriority,
} from "@/api/workflow";

defineOptions({ name: "WorkflowApproval" });

const loading = ref(false);
const rows = ref<WorkflowItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const query = reactive({
  keyword: "",
  status: "" as WorkflowStatus | "",
});

const detailVisible = ref(false);
const detail = ref<WorkflowDetail | null>(null);

const typeMeta = (type: WorkflowType): { label: string; tag: "primary" | "success" | "warning" | "info" } => {
  const map: Record<WorkflowType, { label: string; tag: "primary" | "success" | "warning" | "info" }> = {
    leave: { label: "请假", tag: "info" },
    purchase: { label: "采购", tag: "success" },
    expense: { label: "报销", tag: "warning" },
    contract: { label: "合同", tag: "primary" },
    other: { label: "其他", tag: "info" },
  };
  return map[type] ?? map.other;
};

const priorityMeta = (priority: WorkflowPriority): { label: string; tag: "danger" | "warning" | "info" } => {
  const map: Record<WorkflowPriority, { label: string; tag: "danger" | "warning" | "info" }> = {
    high: { label: "高", tag: "danger" },
    medium: { label: "中", tag: "warning" },
    low: { label: "低", tag: "info" },
  };
  return map[priority] ?? map.low;
};

const statusMeta = (status: WorkflowStatus): { label: string; tag: "primary" | "success" | "danger" } => {
  const map: Record<WorkflowStatus, { label: string; tag: "primary" | "success" | "danger" }> = {
    pending: { label: "待审批", tag: "primary" },
    approved: { label: "已通过", tag: "success" },
    rejected: { label: "已驳回", tag: "danger" },
  };
  return map[status] ?? map.pending;
};

/** 步骤条进度：通过=走完，驳回=停在驳回节点，待审批=当前节点 */
const activeStep = computed(() => {
  const steps = detail.value?.steps ?? [];
  if (detail.value?.status === "approved") return steps.length;
  const idx = steps.findIndex((s) => s.status === "rejected" || s.status === "current");
  return idx === -1 ? 0 : idx;
});

function timelineType(status: string) {
  if (status === "done") return "primary";
  if (status === "rejected") return "danger";
  if (status === "current") return "warning";
  return undefined;
}

function stepTagType(status: string): "success" | "primary" | "danger" | "info" {
  if (status === "done") return "success";
  if (status === "rejected") return "danger";
  if (status === "current") return "primary";
  return "info";
}

function stepLabel(status: string) {
  const map: Record<string, string> = {
    done: "已办结",
    current: "处理中",
    pending: "待处理",
    rejected: "已驳回",
  };
  return map[status] ?? "待处理";
}

async function fetchList() {
  loading.value = true;
  try {
    const { data } = await getWorkflowList({
      page: page.value,
      pageSize: pageSize.value,
      status: query.status || undefined,
      keyword: query.keyword || undefined,
    });
    rows.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchList();
}

async function openDetail(row: WorkflowItem) {
  detailVisible.value = true;
  const { data } = await getWorkflowDetail(row.id);
  detail.value = data;
}

/** 通过 / 驳回：行内与抽屉共用；驳回强制填写意见 */
async function handleAudit(item: WorkflowItem, action: "approve" | "reject") {
  let comment = "";
  try {
    const { value } = await ElMessageBox.prompt(
      action === "approve" ? `确认通过「${item.title}」？可填写审批意见` : `确认驳回「${item.title}」？请填写驳回原因`,
      action === "approve" ? "通过确认" : "驳回确认",
      {
        confirmButtonText: action === "approve" ? "确认通过" : "确认驳回",
        cancelButtonText: "取消",
        type: action === "approve" ? "success" : "warning",
        inputPlaceholder: action === "approve" ? "审批意见（选填）" : "驳回原因（必填）",
        inputValidator: (input: string) => {
          if (action === "reject" && !input?.trim()) return "请填写驳回原因";
          return true;
        },
      },
    );
    comment = value?.trim() ?? "";
  } catch {
    return;
  }

  const { data } = await auditWorkflow({ id: item.id, action, comment: comment || undefined });
  if (data === null) {
    const newStatus: WorkflowStatus = action === "approve" ? "approved" : "rejected";
    item.status = newStatus;
    item.currentNode = action === "approve" ? "流程结束" : "部门主管审批";
    ElMessage.success(action === "approve" ? "已通过该流程" : "已驳回该流程");
    // 抽屉打开时同步刷新流转记录
    if (detailVisible.value && detail.value?.id === item.id) {
      const res = await getWorkflowDetail(item.id);
      detail.value = res.data;
    }
  }
}

function handleCreate() {
  createVisible.value = true;
}

/* ---------- 发起流程 ---------- */

const createVisible = ref(false);
const creating = ref(false);
const createFormRef = ref<FormInstance>();

/** 流程模板（审批链） */
const templates = ref<WorkflowTemplate[]>([]);

const selectedTemplate = computed(() => templates.value.find((tpl) => tpl.id === createForm.templateId));

const nodeCount = computed(() => selectedTemplate.value?.nodes.length ?? 0);

/** 可指定审批人的节点：跳过「提交申请」与「流程结束」 */
const approverNodes = computed(() =>
  (selectedTemplate.value?.nodes ?? [])
    .map((node, index) => ({ node, index }))
    .filter(({ node }, i) => i > 0 && i < nodeCount.value - 1 && node.nodeName !== "流程结束"),
);

const approverCandidates = computed(() => selectedTemplate.value?.candidates ?? []);

const createForm = reactive<{
  templateId: string;
  type: WorkflowType;
  title: string;
  priority: WorkflowPriority;
  amount: number;
  reason: string;
  approvers: string[];
}>({
  templateId: "",
  type: "purchase",
  title: "",
  priority: "medium",
  amount: 0,
  reason: "",
  approvers: [],
});

const createRules: FormRules = {
  templateId: [{ required: true, message: "请选择流程模板", trigger: "change" }],
  type: [{ required: true, message: "请选择流程类型", trigger: "change" }],
  title: [
    { required: true, message: "请填写流程标题", trigger: "blur" },
    { min: 4, max: 40, message: "标题长度为 4 到 40 个字符", trigger: "blur" },
  ],
  reason: [
    { required: true, message: "请填写申请事由", trigger: "blur" },
    { min: 5, message: "申请事由不少于 5 个字符", trigger: "blur" },
  ],
};

/** 切换模板：重置审批人为模板默认值，并联动流程类型 */
function applyTemplate(templateId: string) {
  const tpl = templates.value.find((t) => t.id === templateId);
  if (!tpl) return;
  createForm.approvers = tpl.nodes.map((node) => node.approver);
  createForm.type = tpl.type;
}

async function loadTemplates() {
  try {
    const { data } = await getWorkflowTemplates();
    templates.value = data ?? [];
    // 默认选中第一个模板，保证打开发起弹窗即可提交
    if (templates.value.length && !createForm.templateId) {
      createForm.templateId = templates.value[0].id;
      applyTemplate(createForm.templateId);
    }
  } catch {
    /* 模板加载失败不阻塞页面，提交时校验会兜底 */
  }
}

async function submitCreate() {
  const formEl = createFormRef.value;
  const valid = (await formEl?.validate().catch(() => false)) ?? false;
  if (!valid) return;

  creating.value = true;
  try {
    await createWorkflow({
      templateId: createForm.templateId,
      type: createForm.type,
      title: createForm.title,
      priority: createForm.priority,
      amount: createForm.amount,
      reason: createForm.reason,
      approvers: createForm.approvers,
    });
    ElMessage.success("流程已提交，等待审批");
    createVisible.value = false;
    // 重置表单，下次打开为干净状态
    Object.assign(createForm, {
      templateId: createForm.templateId,
      type: "purchase",
      title: "",
      priority: "medium",
      amount: 0,
      reason: "",
      approvers: [],
    });
    applyTemplate(createForm.templateId);
    formEl?.clearValidate();
    // 切回「全部」确保用户能立刻看到新提交的流程
    query.status = "";
    page.value = 1;
    fetchList();
  } finally {
    creating.value = false;
  }
}

onMounted(() => {
  fetchList();
  loadTemplates();
});
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--layout-content-gap);
}

.search-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.content-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  strong {
    color: var(--color-text-primary);
    margin: 0 2px;
  }
}

.cell-flow {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  &__id {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }
}

.cell-applicant {
  display: flex;
  align-items: center;
  gap: 8px;

  &__avatar {
    flex-shrink: 0;
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-size: var(--font-size-xs);
  }

  &__info {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
    min-width: 0;
  }

  &__name {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  &__dept {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }
}

.cell-node {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  &.is-pending {
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.form-hint {
  margin-left: 8px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.tpl-option-desc {
  float: right;
  margin-left: 12px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* ---------- 审批链编辑器 ---------- */

.flow-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-preview {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--color-bg-fill);
}

.flow-node {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-width: 88px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);

  &.is-endpoint {
    background: transparent;
    border-style: dashed;

    .flow-node__name {
      color: var(--color-text-secondary);
    }
  }

  &__name {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  &__approver {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    white-space: nowrap;
  }
}

.flow-arrow {
  align-self: center;
  flex-shrink: 0;
  color: var(--color-text-placeholder);
}

.flow-approver {
  display: flex;
  align-items: center;
  gap: 8px;

  &__label {
    flex-shrink: 0;
    width: 96px;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }
}

/* ---------- 详情抽屉 ---------- */

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  &__meta {
    margin: 6px 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }
}

.detail-steps {
  margin: 24px 0 8px;
}

.detail-desc {
  margin-top: 16px;
}

.detail-section-title {
  margin: 24px 0 16px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.detail-timeline {
  padding-left: 4px;
}

.timeline-node {
  display: flex;
  align-items: center;
  gap: 8px;

  &__name {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }
}

.timeline-node__assignee {
  margin: 4px 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.timeline-node__comment {
  margin: 4px 0 0;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-fill);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.detail-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 4px;
  background: var(--color-bg-card);

  :deep(.el-button) {
    min-width: 96px;
  }
}
</style>
