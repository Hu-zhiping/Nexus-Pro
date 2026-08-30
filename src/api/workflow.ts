import http from "@/utils/request";
import type { ApiResult, PageResult } from "@/api/user";

/** 审批状态：待审批 / 已通过 / 已驳回 */
export type WorkflowStatus = "pending" | "approved" | "rejected";

/** 优先级 */
export type WorkflowPriority = "high" | "medium" | "low";

/** 流程类型 */
export type WorkflowType = "leave" | "purchase" | "expense" | "contract" | "other";

export interface WorkflowItem {
  id: string;
  /** 流程标题，如「采购申请 · MacBook 开发机」 */
  title: string;
  type: WorkflowType;
  /** 发起人 */
  applicant: string;
  department: string;
  /** 当前审批节点名称 */
  currentNode: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  createdAt: string;
}

/** 节点流转记录 */
export interface WorkflowStepLog {
  nodeName: string;
  assignee: string;
  status: "done" | "current" | "pending" | "rejected";
  time?: string;
  comment?: string;
}

export interface WorkflowDetail extends WorkflowItem {
  /** 申请事由 */
  reason: string;
  /** 涉及金额（元） */
  amount: string;
  steps: WorkflowStepLog[];
}

export interface WorkflowQueryParams {
  page?: number;
  pageSize?: number;
  status?: WorkflowStatus | "";
  keyword?: string;
}

export interface WorkflowAuditPayload {
  id: string;
  action: "approve" | "reject";
  /** 审批意见 */
  comment?: string;
}

/** 发起流程入参 */
export interface WorkflowCreatePayload {
  /** 绑定的流程模板（审批链） */
  templateId: string;
  type: WorkflowType;
  title: string;
  priority: WorkflowPriority;
  /** 涉及金额（元），无金额流程传 0 */
  amount: number;
  reason: string;
  /** 与模板节点一一对应的审批人（含发起/结束节点） */
  approvers: string[];
}

/** 流程模板节点 */
export interface WorkflowTemplateNode {
  key: string;
  nodeName: string;
  /** 默认审批人 */
  approver: string;
}

/** 流程模板：预定义的审批链路（轻量 BPMN 链） */
export interface WorkflowTemplate {
  id: string;
  name: string;
  type: WorkflowType;
  desc: string;
  nodes: WorkflowTemplateNode[];
  /** 可选审批人候选池 */
  candidates: string[];
}

/** 审批列表 */
export const getWorkflowList = (params?: WorkflowQueryParams) => {
  return http.get<ApiResult<PageResult<WorkflowItem>>>("/api/workflow/list", params as Record<string, unknown>);
};

/** 审批详情（含节点流转记录） */
export const getWorkflowDetail = (id: string) => {
  return http.get<ApiResult<WorkflowDetail>>("/api/workflow/detail", { id });
};

/** 审批操作：通过 / 驳回 */
export const auditWorkflow = (data: WorkflowAuditPayload) => {
  return http.post<ApiResult<null>>("/api/workflow/audit", data);
};

/** 发起流程 */
export const createWorkflow = (data: WorkflowCreatePayload) => {
  return http.post<ApiResult<WorkflowItem>>("/api/workflow/create", data);
};

/** 流程模板列表（发起流程时选择审批链） */
export const getWorkflowTemplates = () => {
  return http.get<ApiResult<WorkflowTemplate[]>>("/api/workflow/templates");
};
