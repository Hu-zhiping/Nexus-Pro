<template>
  <div class="task-edit">
    <!-- 页头：返回 + 标题 + 主操作 -->
    <header class="task-edit__header">
      <div class="task-edit__heading">
        <el-button class="task-edit__back" circle @click="goBack">
          <SvgIcon name="ri:arrow-left-line" size="16" />
        </el-button>

        <div class="task-edit__heading-text">
          <h2 class="task-edit__title">{{ isEdit ? "编辑同步任务" : "新建同步任务" }}</h2>
          <p class="task-edit__desc">
            {{ isEdit && form.name ? `正在编辑「${form.name}」的调度与数据源配置` : "飞书多维表 ↔ 数据库 · 通过步骤向导完成配置" }}
          </p>
        </div>
      </div>

      <div class="task-edit__actions">
        <el-button type="primary" :loading="running" :disabled="!canRun" @click="handleRun">
          <SvgIcon name="ri:play-circle-line" size="16" />
          <span>立即执行</span>
        </el-button>
      </div>
    </header>

    <div class="task-edit__body">
      <!-- 左侧步骤轨 -->
      <aside class="task-edit__rail">
        <button
v-for="(step, i) in steps" :key="step.key" type="button" class="rail-step"
          :class="{ 'is-active': current === i, 'is-done': i < maxVisited && current !== i }" @click="jump(i)">
          <span class="rail-step__icon">
            <SvgIcon v-if="i < maxVisited && current !== i" name="ri:check-line" size="14" />
            <span v-else>{{ i + 1 }}</span>
          </span>

          <span class="rail-step__text">
            <span class="rail-step__title">{{ step.title }}</span>
            <span class="rail-step__desc">{{ step.desc }}</span>
          </span>
        </button>
      </aside>

      <!-- 右侧内容区 -->
      <section class="task-edit__main">
        <div class="task-edit__content">
          <BasicInfo v-show="current === 0" ref="basicRef" v-model="form" />
          <FeishuConfig v-show="current === 1" ref="feishuRef" v-model="form.feishu" />
          <DatabaseConfig v-show="current === 2" ref="dbRef" v-model="form.database" />
          <FieldMapping v-show="current === 3" ref="fieldsRef" v-model="form.fields" />
          <ScheduleConfig v-show="current === 4" ref="scheduleRef" v-model="form.schedule" />
          <PreviewStep v-show="current === 5" :form="form" />
        </div>

        <!-- 步骤导航 -->
        <footer class="task-edit__footer">
          <el-button :disabled="current === 0" @click="prev">
            <SvgIcon name="ri:arrow-left-line" size="14" />
            <span>上一步</span>
          </el-button>

          <span class="task-edit__step-info">{{ current + 1 }} / {{ steps.length }} · {{ steps[current].title }}</span>

          <el-button v-if="current < steps.length - 1" type="primary" :loading="validating" @click="next">
            <span>下一步</span>
            <SvgIcon name="ri:arrow-right-line" size="14" />
          </el-button>

          <el-button v-else type="primary" :loading="saving" @click="handleSave">
            <SvgIcon name="ri:save-line" size="14" />
            <span>保存任务</span>
          </el-button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { getSyncTaskDetail, runSyncTask, saveSyncTask } from "@/api/sync";
import type { TaskForm } from "@/api/sync";

import BasicInfo from "./components/BasicInfo.vue";
import FeishuConfig from "./components/FeishuConfig.vue";
import DatabaseConfig from "./components/DatabaseConfig.vue";
import FieldMapping from "./components/FieldMapping.vue";
import ScheduleConfig from "./components/ScheduleConfig.vue";
import PreviewStep from "./components/PreviewStep.vue";

defineOptions({ name: "SyncTaskConfig" });

const route = useRoute();
const router = useRouter();

/** 编辑模式：?id=xxx */
const editId = computed(() => (route.query.id as string | undefined) ?? "");
const isEdit = computed(() => !!editId.value);

const steps = [
  { key: "basic", title: "基础信息", desc: "名称与用途", icon: "ri:information-line" },
  { key: "feishu", title: "源端配置", desc: "飞书多维表", icon: "ri:cloud-line" },
  { key: "database", title: "目标配置", desc: "数据库连接", icon: "ri:database-2-line" },
  { key: "fields", title: "字段映射", desc: "字段对应关系", icon: "ri:swap-box-line" },
  { key: "schedule", title: "调度配置", desc: "定时执行策略", icon: "ri:time-line" },
  { key: "preview", title: "预览确认", desc: "核对并保存", icon: "ri:file-check-line" },
];

const current = ref(0);

/** 已到达的最远步骤（允许自由回跳，前进需逐步校验） */
const maxVisited = ref(0);

const validating = ref(false);
const saving = ref(false);
const running = ref(false);

const form = reactive<TaskForm>({
  name: "",
  description: "",
  feishu: {
    appToken: "",
    tableId: "",
    direction: "feishu-to-db",
  },
  database: {
    type: "mysql",
    host: "",
    port: 3306,
    database: "",
    username: "",
    password: "",
    table: "",
  },
  fields: [],
  schedule: {
    enabled: false,
    cron: "0 0 2 * * ?",
  },
});

const basicRef = ref<{ validate: () => Promise<boolean> }>();
const feishuRef = ref<{ validate: () => Promise<boolean> }>();
const dbRef = ref<{ validate: () => Promise<boolean> }>();
const fieldsRef = ref<{ validate: () => Promise<boolean> }>();
const scheduleRef = ref<{ validate: () => Promise<boolean> }>();

const validators = [basicRef, feishuRef, dbRef, fieldsRef, scheduleRef];

const canRun = computed(() => {
  if (!form.name || !form.feishu.appToken || !form.feishu.tableId) return false;
  if (!form.database.host || !form.database.database || !form.database.table) return false;
  if (!form.fields.some((f) => f.enabled)) return false;
  if (form.schedule.enabled && !form.schedule.cron.trim()) return false;
  return true;
});

async function next() {
  const validator = validators[current.value]?.value;
  if (validator) {
    validating.value = true;
    try {
      const ok = await validator.validate();
      if (!ok) return;
    } finally {
      validating.value = false;
    }
  }
  if (current.value < steps.length - 1) {
    current.value += 1;
    maxVisited.value = Math.max(maxVisited.value, current.value);
  }
}

function prev() {
  if (current.value > 0) {
    current.value -= 1;
  }
}

/** 只允许跳回已到达过的步骤 */
function jump(index: number) {
  if (index <= maxVisited.value) {
    current.value = index;
  }
}

function goBack() {
  router.push("/sync/task");
}

/* 编辑模式：加载任务详情回填表单 */
async function loadTask() {
  if (!editId.value) return;

  const { data } = await getSyncTaskDetail(editId.value);
  if (!data) return;

  form.id = data.id ?? editId.value;
  form.name = data.name ?? "";
  form.description = data.description ?? "";
  form.feishu = { ...form.feishu, ...data.feishu };
  form.database = { ...form.database, ...data.database };
  form.fields = data.fields ?? [];
  form.schedule = { ...form.schedule, ...data.schedule };
}

onMounted(loadTask);

async function handleSave() {
  saving.value = true;
  try {
    const { data } = await saveSyncTask({ ...form });
    form.id = data.id;
    ElMessage.success(isEdit.value ? "任务已更新" : "任务已保存");
    router.push("/sync/task");
  } finally {
    saving.value = false;
  }
}

async function handleRun() {
  try {
    await ElMessageBox.confirm("确认立即执行该同步任务？", "执行确认", {
      type: "warning",
      confirmButtonText: "立即执行",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }

  running.value = true;
  try {
    if (!form.id) {
      const { data } = await saveSyncTask({ ...form });
      form.id = data.id;
    }
    const { data } = await runSyncTask(form.id);
    ElMessage.success(`已触发执行，预计 ${data.estimatedFinishAt} 完成`);
    router.push("/sync/history");
  } finally {
    running.value = false;
  }
}
</script>

<style scoped lang="scss">
.task-edit {
  display: flex;
  flex-direction: column;

  gap: var(--space-4);
}

/* =========================================================
 * 页头
 * ========================================================= */

.task-edit__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--space-4);

  padding: var(--space-4) var(--space-5);

  background: var(--color-bg-card);

  border: 1px solid var(--color-border-light);

  border-radius: var(--radius-lg);
}

.task-edit__heading {
  display: flex;
  align-items: center;

  gap: var(--space-3);

  min-width: 0;
}

.task-edit__back {
  flex-shrink: 0;
}

.task-edit__heading-text {
  min-width: 0;
}

.task-edit__title {
  margin: 0;

  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);

  color: var(--color-text-primary);
}

.task-edit__desc {
  margin: 2px 0 0;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  font-size: var(--font-size-sm);

  color: var(--color-text-secondary);
}

/* =========================================================
 * 主体：左步骤轨 + 右内容
 * ========================================================= */

.task-edit__body {
  display: flex;
  align-items: flex-start;

  gap: var(--space-4);
}

/* 步骤轨 */

.task-edit__rail {
  position: sticky;

  top: 0;

  flex: 0 0 220px;

  display: flex;
  flex-direction: column;

  gap: var(--space-1);

  padding: var(--space-3);

  background: var(--color-bg-card);

  border: 1px solid var(--color-border-light);

  border-radius: var(--radius-lg);
}

.rail-step {
  display: flex;
  align-items: center;

  gap: var(--space-3);

  padding: var(--space-2) var(--space-3);

  border: none;

  border-radius: var(--radius-md);

  background: transparent;

  text-align: left;

  cursor: pointer;

  transition: background-color var(--transition-fast);

  &:hover {
    background: var(--color-bg-hover);
  }

  &.is-active {
    background: var(--color-primary-light);
  }
}

.rail-step__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 24px;
  height: 24px;

  border-radius: var(--radius-round);

  background: var(--color-bg-hover);

  color: var(--color-text-secondary);

  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.rail-step.is-done .rail-step__icon {
  background: var(--color-primary-light);

  color: var(--color-primary);
}

.rail-step.is-active .rail-step__icon {
  background: var(--color-primary);

  color: #ffffff;
}

.rail-step__text {
  display: flex;
  flex-direction: column;

  gap: 1px;

  min-width: 0;
}

.rail-step__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);

  color: var(--color-text-primary);

  transition: color var(--transition-fast);
}

.rail-step.is-active .rail-step__title {
  color: var(--color-primary);
}

.rail-step__desc {
  font-size: var(--font-size-xs);

  color: var(--color-text-tertiary);
}

/* 内容区 */

.task-edit__main {
  display: flex;
  flex-direction: column;

  flex: 1;

  min-width: 0;

  gap: var(--space-4);
}

.task-edit__content {
  min-width: 0;
}

/* 统一子步骤卡片质感：可见描边 + 圆角，深浅色模式都成立 */
.task-edit__content :deep(.step-card) {
  border: 1px solid var(--color-border-light);

  border-radius: var(--radius-lg);

  :deep(.el-card__header) {
    padding: var(--space-3) var(--space-5);
  }

  :deep(.el-card__body) {
    padding: var(--space-5);
  }
}

/* 底部导航 */

.task-edit__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: var(--space-3);

  padding: var(--space-3) var(--space-4);

  background: var(--color-bg-card);

  border: 1px solid var(--color-border-light);

  border-radius: var(--radius-lg);
}

.task-edit__step-info {
  font-size: var(--font-size-sm);

  color: var(--color-text-tertiary);
}

/* =========================================================
 * 响应式：窄屏步骤轨横排
 * ========================================================= */

@media (max-width: 1023px) {
  .task-edit__body {
    flex-direction: column;
  }

  .task-edit__rail {
    position: static;

    flex-direction: row;

    flex: none;

    width: 100%;

    overflow-x: auto;
  }

  .rail-step {
    flex-shrink: 0;
  }

  .rail-step__desc {
    display: none;
  }
}
</style>
