<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">运行历史</h2>
        <p class="page-desc">查看所有同步任务的运行记录与执行状态</p>
      </div>
      <div class="page-actions">
        <el-button :disabled="!tableData.length" @click="exportData">
          <SvgIcon name="ri:download-line" size="16" />
          <span>导出</span>
        </el-button>
        <el-button type="primary" @click="goNewTask">
          <SvgIcon name="ri:add-line" size="16" />
          <span>新建任务</span>
        </el-button>
      </div>
    </div>

    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <el-input
          v-model="filters.keyword"
          placeholder="任务名称 / 源 / 目标"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <SvgIcon name="ri:search-line" size="14" />
          </template>
        </el-input>

        <el-select v-model="filters.status" placeholder="运行状态" clearable style="width: 140px">
          <el-option label="成功" value="success" />
          <el-option label="运行中" value="running" />
          <el-option label="失败" value="failed" />
        </el-select>

        <el-select v-model="filters.triggerType" placeholder="触发方式" clearable style="width: 140px">
          <el-option label="手动" value="手动" />
          <el-option label="定时" value="定时" />
        </el-select>

        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px"
        />

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

    <!-- 数据表 -->
    <el-card class="content-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar__summary">
          共 <strong>{{ total }}</strong> 条记录
          <template v-if="summarySuccess">· 成功 <span class="ok-text">{{ summarySuccess }}</span></template>
          <template v-if="summaryFailed">· 失败 <span class="warn-text">{{ summaryFailed }}</span></template>
        </div>
        <div class="toolbar__actions">
          <el-button :disabled="!selectedRows.length" link @click="batchRerun">
            <SvgIcon name="ri:refresh-line" size="14" />
            <span>批量重跑 ({{ selectedRows.length }})</span>
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        row-key="id"
        empty-text="暂无同步历史"
        @selection-change="onSelectionChange"
      >
        <template #empty>
          <el-empty description="暂无同步历史" />
        </template>
        <el-table-column type="selection" width="44" />
        <el-table-column label="任务名称" prop="taskName" min-width="160" show-overflow-tooltip />
        <el-table-column label="方向" width="130">
          <template #default="{ row }">
            <el-tag :type="directionTagType(row.direction)" size="small" effect="plain">
              {{ directionLabel(row.direction) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源 → 目标" min-width="200">
          <template #default="{ row }">
            <span class="route-text">
              <span class="route-text__node">{{ row.source }}</span>
              <SvgIcon name="ri:arrow-right-line" size="14" class="route-text__arrow" />
              <span class="route-text__node">{{ row.target }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="记录数" width="160">
          <template #default="{ row }">
            <div class="record-cell">
              <span class="record-cell__num">{{ row.successRecords }} / {{ row.totalRecords }}</span>
              <el-progress
                v-if="row.totalRecords > 0"
                :percentage="Math.round((row.successRecords / row.totalRecords) * 100)"
                :stroke-width="6"
                :show-text="false"
                :color="row.failedRecords > 0 ? '#f59e0b' : '#10b981'"
                style="width: 80px"
              />
              <span v-if="row.failedRecords > 0" class="record-cell__failed">失败 {{ row.failedRecords }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">{{ formatDuration(row.duration) }}</template>
        </el-table-column>
        <el-table-column label="触发" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.triggerType === '定时' ? 'warning' : 'info'" size="small" effect="plain">
              {{ row.triggerType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" effect="light">
              <SvgIcon v-if="row.status === 'running'" name="ri:loader-4-line" size="12" class="is-spinning" />
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行时间" prop="createTime" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row as SyncHistoryItem)">
              详情
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              :disabled="row.status === 'running'"
              @click="rerun(row as SyncHistoryItem)"
            >
              重跑
            </el-button>
            <el-button link type="primary" size="small" @click="downloadLog(row as SyncHistoryItem)">
              日志
            </el-button>
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

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="运行详情" size="520px" direction="rtl">
      <template v-if="currentDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务名称">{{ currentDetail.taskName }}</el-descriptions-item>
          <el-descriptions-item label="同步方向">
            <el-tag :type="directionTagType(currentDetail.direction)" size="small">
              {{ directionLabel(currentDetail.direction) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="源 → 目标">
            {{ currentDetail.source }} → {{ currentDetail.target }}
          </el-descriptions-item>
          <el-descriptions-item label="记录数">
            成功 {{ currentDetail.successRecords }} / 总 {{ currentDetail.totalRecords }} / 失败 {{ currentDetail.failedRecords }}
          </el-descriptions-item>
          <el-descriptions-item label="耗时">{{ formatDuration(currentDetail.duration) }}</el-descriptions-item>
          <el-descriptions-item label="触发方式">{{ currentDetail.triggerType }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentDetail.status)" size="small">{{ statusLabel(currentDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="执行时间">{{ currentDetail.createTime }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { getSyncHistory } from "@/api/user";
import type { SyncHistoryItem, SyncStatus, SyncDirection } from "@/api/user";

defineOptions({ name: "SyncHistory" });

const router = useRouter();

const loading = ref(false);
const tableData = ref<SyncHistoryItem[]>([]);
const selectedRows = ref<SyncHistoryItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const filters = reactive({
  keyword: "",
  status: "" as SyncStatus | "",
  triggerType: "" as "手动" | "定时" | "",
  dateRange: [] as [string, string] | [],
});

const detailVisible = ref(false);
const currentDetail = ref<SyncHistoryItem | null>(null);

const summarySuccess = computed(() => tableData.value.filter((r) => r.status === "success").length);
const summaryFailed = computed(() => tableData.value.filter((r) => r.status === "failed").length);

async function fetchData() {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      triggerType: filters.triggerType || undefined,
    };
    const { data } = await getSyncHistory(params);
    tableData.value = data.list;
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
  filters.triggerType = "";
  filters.dateRange = [];
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

function onSelectionChange(rows: SyncHistoryItem[]) {
  selectedRows.value = rows;
}

function directionLabel(d: SyncDirection) {
  switch (d) {
    case "forward":
      return "飞书 → 数据库";
    case "reverse":
      return "数据库 → 飞书";
    case "bidirectional":
      return "双向同步";
    default:
      return "—";
  }
}

function directionTagType(d: SyncDirection): "primary" | "success" | "warning" {
  switch (d) {
    case "forward":
      return "primary";
    case "reverse":
      return "success";
    case "bidirectional":
      return "warning";
    default:
      return "primary";
  }
}

function statusLabel(s: SyncStatus) {
  switch (s) {
    case "success":
      return "成功";
    case "running":
      return "运行中";
    case "failed":
      return "失败";
    default:
      return "—";
  }
}

function statusTagType(s: SyncStatus): "success" | "primary" | "danger" {
  switch (s) {
    case "success":
      return "success";
    case "running":
      return "primary";
    case "failed":
      return "danger";
    default:
      return "success";
  }
}

function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function viewDetail(row: SyncHistoryItem) {
  currentDetail.value = row;
  detailVisible.value = true;
}

async function rerun(row: SyncHistoryItem) {
  try {
    await ElMessageBox.confirm(`确认重新执行任务「${row.taskName}」？`, "重跑确认", {
      type: "warning",
      confirmButtonText: "立即执行",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  ElMessage.success(`已触发重跑：${row.taskName}`);
}

async function batchRerun() {
  try {
    await ElMessageBox.confirm(`确认批量重跑选中的 ${selectedRows.value.length} 个任务？`, "批量重跑", {
      type: "warning",
      confirmButtonText: "立即执行",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  ElMessage.success(`已批量触发 ${selectedRows.value.length} 个任务`);
}

function downloadLog(row: SyncHistoryItem) {
  ElMessage.success(`正在下载「${row.taskName}」的执行日志`);
}

function exportData() {
  ElMessage.success(`正在导出 ${total.value} 条历史记录`);
}

function goNewTask() {
  router.push("/sync/task");
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

.search-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
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

.ok-text {
  color: var(--color-success);
}

.warn-text {
  color: var(--color-danger);
}

.route-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--color-text-main);
}

.route-text__node {
  font-weight: 500;
}

.route-text__arrow {
  color: var(--color-text-placeholder);
}

.record-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);

  &__num {
    color: var(--color-text-main);
    white-space: nowrap;
  }

  &__failed {
    color: var(--color-danger);
    font-size: var(--font-size-xs);
    white-space: nowrap;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.is-spinning {
  animation: spin 1.4s linear infinite;
  margin-right: 4px;
}

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
