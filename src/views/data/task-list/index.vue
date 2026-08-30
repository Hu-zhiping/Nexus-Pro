<template>
  <div class="task-list">
    <!-- 页面标题 + 主操作 -->
    <div class="task-list__header">
      <div>
        <h2 class="task-list__title">同步任务</h2>
        <p class="task-list__desc">管理飞书多维表与数据库之间的定时同步任务</p>
      </div>

      <el-button type="primary" @click="goCreate">
        <SvgIcon name="ri:add-line" size="16" />
        <span>新建任务</span>
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="task-list__filter">
      <el-input
v-model="query.keyword" class="filter-keyword" placeholder="搜索任务名称 / 描述" clearable
        @keyup.enter="handleSearch" @clear="handleSearch">
        <template #prefix>
          <SvgIcon name="ri:search-line" size="14" />
        </template>
      </el-input>

      <el-select v-model="query.status" class="filter-status" @change="handleSearch">
        <el-option label="全部状态" value="" />
        <el-option label="已启用" :value="1" />
        <el-option label="已停用" :value="0" />
      </el-select>

      <el-button @click="handleSearch">
        <SvgIcon name="ri:search-line" size="14" />
        <span>查询</span>
      </el-button>

      <el-button @click="handleReset">
        <SvgIcon name="ri:refresh-line" size="14" />
        <span>重置</span>
      </el-button>

      <span class="filter-total">共 {{ total }} 个任务</span>
    </div>

    <!-- 任务表格 -->
    <el-card class="task-list__table" shadow="never">
      <el-table v-loading="loading" :data="rows">
        <el-table-column label="任务名称" min-width="220">
          <template #default="{ row }">
            <div class="cell-task">
              <span class="cell-task__name">{{ row.name }}</span>
              <span class="cell-task__desc" :title="row.description">{{ row.description || "暂无描述" }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="同步方向" width="140">
          <template #default="{ row }">
            <el-tag :type="directionMeta(row.direction).tag" effect="light" round>
              {{ directionMeta(row.direction).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="调度策略" min-width="160">
          <template #default="{ row }">
            <div class="cell-schedule">
              <span class="cell-schedule__text" :class="{ 'is-off': !row.scheduleEnabled }">
                {{ row.scheduleEnabled ? row.cronDescription : "调度未开启" }}
              </span>
              <span v-if="row.scheduleEnabled" class="cell-schedule__cron">{{ row.cron }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
:model-value="row.status === 1" :loading="row._statusLoading" inline-prompt
              active-text="启" inactive-text="停" @change="(v: string | number | boolean) => handleToggleStatus(row as TaskRow, Boolean(v))" />
          </template>
        </el-table-column>

        <el-table-column label="最近执行" min-width="180">
          <template #default="{ row }">
            <div class="cell-last-run">
              <el-tag v-if="row.lastRunStatus" :type="runStatusMeta(row.lastRunStatus).tag" effect="light" round size="small">
                {{ runStatusMeta(row.lastRunStatus).label }}
              </el-tag>
              <span v-else class="cell-last-run__none">未执行</span>
              <span v-if="row.lastRunAt" class="cell-last-run__time">{{ row.lastRunAt }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="更新时间" width="170" />

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goEdit(row as SyncTaskSummary)">编辑</el-button>

            <el-button link type="success" @click="handleRun(row as SyncTaskSummary)">立即执行</el-button>

            <el-button link type="danger" @click="handleDelete(row as SyncTaskSummary)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="task-list__pagination">
        <el-pagination
v-model:current-page="query.page" v-model:page-size="query.pageSize" background
          layout="total, sizes, prev, pager, next, jumper" :total="total" :page-sizes="[10, 20, 50]"
          @current-change="loadList" @size-change="handleSizeChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import {
  deleteSyncTask,
  getSyncTaskList,
  runSyncTask,
  updateSyncTaskStatus,
  type SyncTaskSummary,
} from "@/api/sync";

defineOptions({ name: "SyncTaskList" });

const router = useRouter();

const loading = ref(false);

/** 行数据：附加上开关 loading 状态 */
type TaskRow = SyncTaskSummary & { _statusLoading?: boolean };

const rows = ref<TaskRow[]>([]);

const total = ref(0);

const query = reactive({
  keyword: "",
  status: "" as number | "",
  page: 1,
  pageSize: 10,
});

/* 同步方向展示元数据 */
function directionMeta(direction: SyncTaskSummary["direction"]) {
  switch (direction) {
    case "feishu-to-db":
      return { label: "飞书 → 数据库", tag: "primary" as const };
    case "db-to-feishu":
      return { label: "数据库 → 飞书", tag: "success" as const };
    default:
      return { label: "双向同步", tag: "warning" as const };
  }
}

/* 最近执行状态展示元数据 */
function runStatusMeta(status: SyncTaskSummary["lastRunStatus"]) {
  switch (status) {
    case "success":
      return { label: "成功", tag: "success" as const };
    case "failed":
      return { label: "失败", tag: "danger" as const };
    case "running":
      return { label: "运行中", tag: "primary" as const };
    default:
      return { label: "未执行", tag: "info" as const };
  }
}

async function loadList() {
  loading.value = true;
  try {
    const { data } = await getSyncTaskList({ ...query });
    rows.value = (data?.list ?? []).map((item) => ({ ...item, _statusLoading: false }));
    total.value = data?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadList();
}

function handleReset() {
  query.keyword = "";
  query.status = "";
  query.page = 1;
  loadList();
}

function handleSizeChange() {
  query.page = 1;
  loadList();
}

/* 新建 / 编辑统一走配置向导 */
function goCreate() {
  router.push("/sync/task/config");
}

function goEdit(row: SyncTaskSummary) {
  router.push({ path: "/sync/task/config", query: { id: String(row.id) } });
}

async function handleToggleStatus(row: SyncTaskSummary & { _statusLoading?: boolean }, enabled: boolean) {
  const status = enabled ? 1 : 0;
  row._statusLoading = true;
  try {
    await updateSyncTaskStatus(row.id, status);
    row.status = status;
    ElMessage.success(enabled ? "任务已启用" : "任务已停用");
  } finally {
    row._statusLoading = false;
  }
}

async function handleRun(row: SyncTaskSummary) {
  try {
    await ElMessageBox.confirm(`确认立即执行「${row.name}」？`, "执行确认", {
      type: "warning",
      confirmButtonText: "立即执行",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }

  const { data } = await runSyncTask(row.id);
  ElMessage.success(`已触发执行，预计 ${data.estimatedFinishAt} 完成`);
  loadList();
}

async function handleDelete(row: SyncTaskSummary) {
  try {
    await ElMessageBox.confirm(`删除后不可恢复，确认删除「${row.name}」？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      confirmButtonClass: "el-button--danger",
    });
  } catch {
    return;
  }

  await deleteSyncTask(row.id);

  /* 危险操作的完成反馈用中性提示：绿色 success 只留给非破坏性操作 */
  ElMessage.info(`已删除「${row.name}」`);

  /* 当前页删空后回退一页 */
  if (rows.value.length === 1 && query.page > 1) {
    query.page -= 1;
  }
  loadList();
}

onMounted(loadList);
</script>

<style scoped lang="scss">
.task-list {
  display: flex;
  flex-direction: column;

  gap: var(--space-4);
}

/* 页头 */

.task-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--space-4);

  padding: var(--space-5) var(--space-6);

  background: var(--color-bg-card);

  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-card);
}

.task-list__title {
  margin: 0;

  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);

  color: var(--color-text-primary);
}

.task-list__desc {
  margin: var(--space-1) 0 0;

  font-size: var(--font-size-sm);

  color: var(--color-text-secondary);
}

/* 筛选栏 */

.task-list__filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  gap: var(--space-3);

  padding: var(--space-3) var(--space-4);

  background: var(--color-bg-card);

  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-card);

  .filter-keyword {
    width: 260px;
  }

  .filter-status {
    width: 130px;
  }

  .filter-total {
    margin-left: auto;

    font-size: var(--font-size-sm);

    color: var(--color-text-tertiary);
  }
}

/* 表格 */

.task-list__table {
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: var(--space-2) var(--space-4) var(--space-4);
  }
}

.cell-task {
  display: flex;
  flex-direction: column;

  gap: 2px;

  min-width: 0;
}

.cell-task__name {
  font-weight: var(--font-weight-medium);

  color: var(--color-text-primary);
}

.cell-task__desc {
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  font-size: var(--font-size-xs);

  color: var(--color-text-tertiary);
}

.cell-schedule {
  display: flex;
  flex-direction: column;

  gap: 2px;
}

.cell-schedule__text {
  font-size: var(--font-size-sm);

  color: var(--color-text-primary);

  &.is-off {
    color: var(--color-text-tertiary);
  }
}

.cell-schedule__cron {
  font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;

  font-size: var(--font-size-xs);

  color: var(--color-text-tertiary);
}

.cell-last-run {
  display: flex;
  align-items: center;

  gap: var(--space-2);
}

.cell-last-run__none {
  font-size: var(--font-size-sm);

  color: var(--color-text-tertiary);
}

.cell-last-run__time {
  font-size: var(--font-size-xs);

  color: var(--color-text-tertiary);
}

/* 分页 */

.task-list__pagination {
  display: flex;
  justify-content: flex-end;

  margin-top: var(--space-4);
}
</style>
