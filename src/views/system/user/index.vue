<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="page-desc">管理系统用户账号、角色与状态</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-area">
        <div class="search-form-wrapper">
          <div class="search-form-base">
            <el-input
              v-model="searchKey"
              placeholder="请输入用户名/昵称"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-collapse-transition>
            <div v-show="searchExpanded" class="search-form-extra">
              <el-select v-model="searchRole" placeholder="选择角色" clearable class="search-select">
                <el-option label="超级管理员" value="超级管理员" />
                <el-option label="管理员" value="管理员" />
                <el-option label="普通用户" value="普通用户" />
              </el-select>
              <el-select v-model="searchStatus" placeholder="选择状态" clearable class="search-select">
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
              <el-date-picker
                v-model="searchDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="search-date"
              />
            </div>
          </el-collapse-transition>
        </div>
        <div class="search-btns">
          <el-button :icon="Search" type="primary" @click="handleSearch">搜索</el-button>
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
          <el-button link type="primary" class="expand-btn" @click="searchExpanded = !searchExpanded">
            <span>{{ searchExpanded ? "收起" : "展开" }}</span>
            <el-icon class="expand-icon" :class="{ 'is-expanded': searchExpanded }">
              <ArrowDown />
            </el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card class="content-card" shadow="never">
      <el-table v-loading="loading" :data="userList" border stripe row-key="id" empty-text="暂无数据">
        <template #empty>
          <el-empty description="暂无用户数据" />
        </template>
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)" size="small">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row as UserItem)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search, RefreshRight, ArrowDown } from "@element-plus/icons-vue";
import { getUserList, deleteUser, updateUserStatus } from "@/api/user";
import type { UserItem } from "@/api/user";

const loading = ref(false);
const searchKey = ref("");
const searchRole = ref("");
const searchStatus = ref<number | "">("");
const searchDateRange = ref<[string, string] | []>([]);
const searchExpanded = ref(false);
const userList = ref<UserItem[]>([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取角色标签类型
const getRoleType = (role: string): "success" | "warning" | "info" | "danger" => {
  const types: Record<string, "success" | "warning" | "info" | "danger"> = {
    超级管理员: "danger",
    管理员: "warning",
    普通用户: "info",
  };
  return types[role] || "info";
};

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await getUserList({ page: page.value, pageSize: pageSize.value });
    userList.value = res?.data?.list || [];
    total.value = res?.data?.total || 0;
  } catch (error) {
    console.error("获取用户列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchUserList();
};

// 重置
const handleReset = () => {
  searchKey.value = "";
  searchRole.value = "";
  searchStatus.value = "";
  searchDateRange.value = [];
  page.value = 1;
  fetchUserList();
};

// 新增
const handleAdd = () => {
  ElMessage.info("打开新增用户对话框");
};

// 编辑
const handleEdit = (row: UserItem) => {
  ElMessage.info(`编辑用户: ${row.username}`);
};

// 删除
const handleDelete = (row: UserItem) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await deleteUser(row.id);
      ElMessage.success("删除成功");
      fetchUserList();
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

// 状态变更
const handleStatusChange = async (row: UserItem) => {
  try {
    await updateUserStatus(row.id, row.status);
    ElMessage.success("状态更新成功");
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1;
    console.error("状态更新失败:", error);
  }
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUserList();
};

const handlePageChange = (val: number) => {
  page.value = val;
  fetchUserList();
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped lang="scss">
.search-card {
  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.search-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.search-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.search-form-base,
.search-form-extra {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .search-input {
    width: 240px;
  }

  .search-select {
    width: 140px;
  }

  .search-date {
    width: 260px;
  }
}

.search-btns {
  display: flex;
  gap: 8px;
  align-items: center;

  .expand-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;

    .expand-icon {
      transition: transform 0.3s;

      &.is-expanded {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
