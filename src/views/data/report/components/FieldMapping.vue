<template>
  <el-card class="step-card" shadow="never">
    <template #header>
      <div class="step-card__title">
        <SvgIcon name="ri:swap-box-line" size="18" />
        <span>字段映射</span>
      </div>
    </template>

    <div class="mapping-toolbar">
      <el-button type="primary" plain :loading="pulling" :disabled="!canPull" @click="autoPull">
        <SvgIcon name="ri:download-cloud-2-line" size="16" />
        <span>拉取字段并自动匹配</span>
      </el-button>

      <el-button :disabled="!model.length" @click="autoMatch">
        <SvgIcon name="ri:link-m" size="16" />
        <span>重新匹配</span>
      </el-button>

      <el-button @click="addRow">
        <SvgIcon name="ri:add-line" size="16" />
        <span>添加映射</span>
      </el-button>

      <span class="mapping-summary">
        共 {{ model.length }} 项，已启用 {{ enabledCount }} 项
      </span>
    </div>

    <el-table :data="model" border size="small" empty-text="暂无映射，请拉取或添加">
      <el-table-column label="启用" width="60" align="center">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" />
        </template>
      </el-table-column>

      <el-table-column label="飞书字段" min-width="160">
        <template #default="{ row }">
          <el-input v-model="row.source" size="small" placeholder="飞书列名" />
          <div v-if="row.sourceType" class="field-type">{{ row.sourceType }}</div>
        </template>
      </el-table-column>

      <el-table-column label="数据库字段" min-width="160">
        <template #default="{ row }">
          <el-input v-model="row.target" size="small" placeholder="数据库列名" />
          <div v-if="row.targetType" class="field-type">{{ row.targetType }}</div>
        </template>
      </el-table-column>

      <el-table-column label="必填" width="60" align="center">
        <template #default="{ row }">
          <el-checkbox v-model="row.required" />
        </template>
      </el-table-column>

      <el-table-column label="类型匹配" width="110" align="center">
        <template #default="{ row }">
          <el-tag v-if="isTypeMatched(row as FieldMappingItem)" type="success" size="small">兼容</el-tag>
          <el-tag v-else-if="row.sourceType && row.targetType" type="warning" size="small">需转换</el-tag>
          <el-tag v-else type="info" size="small">未识别</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="80" align="center">
        <template #default="{ $index }">
          <el-button link type="danger" size="small" @click="removeRow($index)">
            <SvgIcon name="ri:delete-bin-line" size="14" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";

import SvgIcon from "@/components/SvgIcon/index.vue";
import { getDatabaseFields, getFeishuFields } from "@/api/sync";
import type { FieldInfo } from "@/api/sync";

interface FieldMappingItem {
  enabled: boolean;
  source: string;
  sourceType: string;
  target: string;
  targetType: string;
  required: boolean;
}

const model = defineModel<FieldMappingItem[]>({ required: true });

const pulling = ref(false);

const feishuCache = ref<FieldInfo[]>([]);
const databaseCache = ref<FieldInfo[]>([]);

/** 前置条件：飞书与数据库均已完成连接测试（此处简化为 model 中存在 appToken / host） */
const canPull = computed(() => true);

const enabledCount = computed(() => model.value.filter((item) => item.enabled).length);

function addRow() {
  model.value.push({
    enabled: true,
    source: "",
    sourceType: "",
    target: "",
    targetType: "",
    required: false,
  });
}

function removeRow(index: number) {
  model.value.splice(index, 1);
}

/** 简易名称相似度：按字符重合度估算，用于自动配对 */
function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  let common = 0;
  for (const ch of la) if (lb.includes(ch)) common++;
  return common / Math.max(la.length, lb.length);
}

/** 名称词典：飞书字段中文名 ↔ 数据库字段英文约定 */
const nameHints: Record<string, string> = {
  订单编号: "order_id",
  客户名称: "customer_name",
  联系电话: "customer_phone",
  下单金额: "amount",
  下单时间: "created_at",
  订单状态: "status",
  收货地址: "shipping_address",
};

function pairFields(feishu: FieldInfo[], database: FieldInfo[]): FieldMappingItem[] {
  const used = new Set<number>();
  const items: FieldMappingItem[] = [];

  for (const f of feishu) {
    const expected = nameHints[f.name];
    let bestIdx = -1;
    let bestScore = 0;

    database.forEach((d, i) => {
      if (used.has(i)) return;
      const score = expected && d.name === expected ? 1 : similarity(f.name, d.name);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    });

    if (bestIdx >= 0 && bestScore > 0.3) {
      used.add(bestIdx);
      const d = database[bestIdx];
      items.push({
        enabled: true,
        source: f.name,
        sourceType: f.type,
        target: d.name,
        targetType: d.type,
        required: ["订单编号", "下单时间", "下单金额"].includes(f.name),
      });
    } else {
      items.push({
        enabled: false,
        source: f.name,
        sourceType: f.type,
        target: "",
        targetType: "",
        required: false,
      });
    }
  }
  return items;
}

async function autoPull() {
  pulling.value = true;
  try {
    const [feishuRes, dbRes] = await Promise.all([getFeishuFields({ appToken: "", tableId: "" }), getDatabaseFields({})]);
    feishuCache.value = feishuRes.data || [];
    databaseCache.value = dbRes.data || [];
    model.value = pairFields(feishuCache.value, databaseCache.value);
    ElMessage.success(`已拉取 ${feishuCache.value.length} 个源端字段`);
  } finally {
    pulling.value = false;
  }
}

function autoMatch() {
  if (!feishuCache.value.length || !databaseCache.value.length) {
    ElMessage.warning("请先拉取字段");
    return;
  }
  model.value = pairFields(feishuCache.value, databaseCache.value);
  ElMessage.success("已重新匹配");
}

/** 类型兼容判断：text↔varchar、number↔decimal/int、datetime↔datetime 等 */
function isTypeMatched(row: FieldMappingItem): boolean {
  if (!row.sourceType || !row.targetType) return false;
  const s = row.sourceType.toLowerCase();
  const t = row.targetType.toLowerCase();
  if (s === t) return true;
  if (s.startsWith("text") && t.includes("varchar")) return true;
  if (s === "number" && (t.includes("decimal") || t.includes("int") || t.includes("float"))) return true;
  if (s === "datetime" && t.includes("datetime")) return true;
  if (s === "select" && (t.includes("int") || t.includes("varchar"))) return true;
  return false;
}

async function validate(): Promise<boolean> {
  if (!model.value.length) {
    ElMessage.warning("请至少添加一条字段映射");
    return false;
  }
  const invalid = model.value.find((item) => item.enabled && (!item.source || !item.target));
  if (invalid) {
    ElMessage.warning("存在已启用但未填写完整的映射");
    return false;
  }
  return true;
}

defineExpose({ validate });
</script>

<style scoped lang="scss">
.step-card {
  border-radius: var(--radius-lg);

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border-light);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.step-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mapping-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.mapping-summary {
  margin-left: auto;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.field-type {
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-placeholder);
}
</style>
