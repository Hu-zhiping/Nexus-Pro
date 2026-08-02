import { ref, computed } from "vue";

/**
 * 分页组合式函数：管理页码/页大小/总数，并生成 el-pagination 所需配置
 */
export function usePagination(options?: { page?: number; pageSize?: number; total?: number }) {
  const page = ref(options?.page ?? 1);
  const pageSize = ref(options?.pageSize ?? 10);
  const total = ref(options?.total ?? 0);

  const pagination = computed(() => ({
    currentPage: page.value,
    pageSize: pageSize.value,
    total: total.value,
  }));

  /** 页码/页大小变化后重置到第一页（可选） */
  const resetPage = () => {
    page.value = 1;
  };

  return {
    page,
    pageSize,
    total,
    pagination,
    resetPage,
  };
}

export default usePagination;
