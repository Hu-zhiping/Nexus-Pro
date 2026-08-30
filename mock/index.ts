import type { MockMethod } from "vite-plugin-mock";
import Mock from "mockjs";

// ==================== 系统模块持久化状态 ====================

interface DeptRecord {
  id: number;
  parentId: number;
  name: string;
  leader: string;
  phone: string;
  email: string;
  sort: number;
  status: number;
  children?: DeptRecord[];
}

interface RoleRecord {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  menuIds: (string | number)[];
  createTime: string;
}

interface MenuRecord {
  id: string;
  parentId: string | null;
  type: "directory" | "menu" | "button";
  title: string;
  name?: string;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  hidden: boolean;
  permission?: string;
  children?: MenuRecord[];
}

const deptRecords: DeptRecord[] = [
  {
    id: 1,
    parentId: 0,
    name: "总公司",
    leader: "张伟",
    phone: "13800138000",
    email: "admin@company.com",
    sort: 1,
    status: 1,
    children: [
      { id: 11, parentId: 1, name: "技术部", leader: "李娜", phone: "13800138001", email: "tech@company.com", sort: 1, status: 1 },
      { id: 12, parentId: 1, name: "产品部", leader: "王强", phone: "13800138002", email: "product@company.com", sort: 2, status: 1 },
      { id: 13, parentId: 1, name: "运营部", leader: "赵敏", phone: "13800138003", email: "ops@company.com", sort: 3, status: 1 },
    ],
  },
];

let deptIdSeq = 100;

// ==================== 同步任务持久化状态 ====================

type SyncDirectionValue = "feishu-to-db" | "db-to-feishu" | "bidirectional";

interface SyncTaskRecord {
  id: number;
  name: string;
  description: string;
  direction: SyncDirectionValue;
  scheduleEnabled: boolean;
  cron: string;
  /** 调度说明（如「每天 02:00 执行」） */
  cronDescription: string;
  /** 1 启用 / 0 停用 */
  status: number;
  lastRunAt: string;
  lastRunStatus: "success" | "failed" | "running" | "";
  updateTime: string;
  feishu: { appToken: string; tableId: string; direction: SyncDirectionValue };
  database: { type: string; host: string; port: number; database: string; username: string; password: string; table: string };
  fields: { enabled: boolean; source: string; sourceType: string; target: string; targetType: string; required: boolean }[];
}

/** 标准字段映射（订单域演示字段） */
const mkOrderFields = () => [
  { enabled: true, source: "订单编号", sourceType: "text", target: "order_id", targetType: "varchar(32)", required: true },
  { enabled: true, source: "客户名称", sourceType: "text", target: "customer_name", targetType: "varchar(64)", required: false },
  { enabled: true, source: "下单金额", sourceType: "number", target: "amount", targetType: "decimal(10,2)", required: true },
  { enabled: false, source: "收货地址", sourceType: "text", target: "shipping_address", targetType: "varchar(255)", required: false },
];

const syncTaskRecords: SyncTaskRecord[] = [
  {
    id: 101, name: "商品库存同步", description: "飞书库存表与 MySQL 主库双向对齐，每日凌晨执行",
    direction: "bidirectional", scheduleEnabled: true, cron: "0 0 2 * * ?", cronDescription: "每天 02:00 执行",
    status: 1, lastRunAt: "2026-08-29 02:00:12", lastRunStatus: "success", updateTime: "2026-08-28 18:32:00",
    feishu: { appToken: "bascnOKlZqQpRtWy", tableId: "tblStock", direction: "bidirectional" },
    database: { type: "mysql", host: "192.168.1.10", port: 3306, database: "erp", username: "sync_user", password: "******", table: "stock" },
    fields: mkOrderFields(),
  },
  {
    id: 102, name: "飞书订单同步", description: "订单多维表落库，供报表系统分析",
    direction: "feishu-to-db", scheduleEnabled: true, cron: "0 0 * * * ?", cronDescription: "每小时整点执行",
    status: 1, lastRunAt: "2026-08-29 14:00:08", lastRunStatus: "success", updateTime: "2026-08-27 10:15:00",
    feishu: { appToken: "bascnOKlZqQpRtWy", tableId: "tblOrder", direction: "feishu-to-db" },
    database: { type: "mysql", host: "192.168.1.10", port: 3306, database: "erp", username: "sync_user", password: "******", table: "order_info" },
    fields: mkOrderFields(),
  },
  {
    id: 103, name: "支付流水同步", description: "支付流水写入数仓，T+1 对账",
    direction: "feishu-to-db", scheduleEnabled: true, cron: "0 30 3 * * ?", cronDescription: "每天 03:30 执行",
    status: 1, lastRunAt: "2026-08-29 03:30:41", lastRunStatus: "failed", updateTime: "2026-08-26 09:02:00",
    feishu: { appToken: "bascnPayTxTable", tableId: "tblPay", direction: "feishu-to-db" },
    database: { type: "postgresql", host: "192.168.1.20", port: 5432, database: "warehouse", username: "etl", password: "******", table: "payment_flow" },
    fields: mkOrderFields(),
  },
  {
    id: 104, name: "用户表双向同步", description: "用户资料双向合并，冲突以飞书为准",
    direction: "bidirectional", scheduleEnabled: true, cron: "0 0 */2 * * ?", cronDescription: "每 2 小时执行",
    status: 1, lastRunAt: "2026-08-29 14:12:33", lastRunStatus: "running", updateTime: "2026-08-25 16:40:00",
    feishu: { appToken: "bascnUserTbl009", tableId: "tblUser", direction: "bidirectional" },
    database: { type: "mysql", host: "192.168.1.10", port: 3306, database: "erp", username: "sync_user", password: "******", table: "sys_user" },
    fields: mkOrderFields(),
  },
  {
    id: 105, name: "会员积分回写", description: "积分变动回写飞书会员表",
    direction: "db-to-feishu", scheduleEnabled: true, cron: "0 0 9 * * ?", cronDescription: "工作日 09:00 执行",
    status: 1, lastRunAt: "2026-08-29 09:00:19", lastRunStatus: "success", updateTime: "2026-08-24 11:20:00",
    feishu: { appToken: "bascnMemberTbl", tableId: "tblMember", direction: "db-to-feishu" },
    database: { type: "mysql", host: "192.168.1.10", port: 3306, database: "mall", username: "sync_user", password: "******", table: "member_point" },
    fields: mkOrderFields(),
  },
  {
    id: 106, name: "库存快照归档", description: "每周归档库存快照至历史库（已停用）",
    direction: "feishu-to-db", scheduleEnabled: false, cron: "0 0 4 * * 1", cronDescription: "每周一 04:00 执行",
    status: 0, lastRunAt: "2026-08-18 04:00:02", lastRunStatus: "success", updateTime: "2026-08-20 15:00:00",
    feishu: { appToken: "bascnOKlZqQpRtWy", tableId: "tblStockSnap", direction: "feishu-to-db" },
    database: { type: "sqlserver", host: "192.168.1.30", port: 1433, database: "archive", username: "archive", password: "******", table: "stock_snapshot" },
    fields: mkOrderFields(),
  },
  {
    id: 107, name: "客户反馈回写", description: "客服系统反馈写回飞书（已停用）",
    direction: "db-to-feishu", scheduleEnabled: false, cron: "0 0 10 * * ?", cronDescription: "每天 10:00 执行",
    status: 0, lastRunAt: "", lastRunStatus: "", updateTime: "2026-08-15 09:30:00",
    feishu: { appToken: "bascnFeedback01", tableId: "tblFeedback", direction: "db-to-feishu" },
    database: { type: "postgresql", host: "192.168.1.20", port: 5432, database: "service", username: "etl", password: "******", table: "feedback" },
    fields: mkOrderFields(),
  },
];

let syncTaskIdSeq = 200;

const findSyncTask = (id: number) => syncTaskRecords.find((t) => t.id === id);

const syncTaskNow = () => Mock.mock("@datetime('yyyy-MM-dd HH:mm:ss')");

const roleRecords: RoleRecord[] = [
  { id: 1, name: "超级管理员", code: "admin", description: "拥有系统全部权限", status: 1, menuIds: ["1", "2", "3", "4", "5"], createTime: "2025-01-01 10:00:00" },
  { id: 2, name: "数据工程师", code: "data_engineer", description: "管理数据同步任务与运行历史", status: 1, menuIds: ["1", "2", "3"], createTime: "2025-02-12 14:30:00" },
  { id: 3, name: "系统管理员", code: "sys_admin", description: "管理用户、角色与菜单", status: 1, menuIds: ["1", "4"], createTime: "2025-03-08 09:15:00" },
  { id: 4, name: "只读访客", code: "viewer", description: "仅可查看仪表盘与历史", status: 0, menuIds: ["1", "2-2"], createTime: "2025-04-20 16:45:00" },
];

let roleIdSeq = 100;

interface UserRecord {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  role: string;
  dept: string;
  status: number;
  createTime: string;
}

const userRecords: UserRecord[] = Array.from({ length: 16 }).map((_, i) => {
  const roles = ["超级管理员", "数据工程师", "系统管理员", "只读访客"];
  const depts = ["技术部", "产品部", "运营部", "市场部", "人事部"];
  return {
    id: i + 1,
    username: Mock.Random.word(4, 8).toLowerCase(),
    nickname: Mock.Random.cname(),
    email: Mock.Random.email(),
    phone: /^1[3-9]\d{9}$/.exec(Mock.Random.string("number", 11))?.[0] || "13800138000",
    role: roles[i % roles.length],
    dept: depts[i % depts.length],
    status: i % 7 === 0 ? 0 : 1,
    createTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
  };
});

let userIdSeq = 1000;

const menuRecords: MenuRecord[] = [
  {
    id: "1", parentId: null, type: "menu", title: "仪表盘", name: "dashboard",
    path: "/dashboard", component: "dashboard/dashboard", icon: "ri:dashboard-3-line",
    sort: 1, hidden: false,
  },
  {
    id: "2", parentId: null, type: "directory", title: "数据同步", name: "sync",
    path: "/sync", component: "Layout", icon: "ri:refresh-line", sort: 2, hidden: false,
    children: [
      { id: "2-1", parentId: "2", type: "menu", title: "同步任务", name: "syncTask", path: "task", component: "data/report/index", icon: "ri:task-line", sort: 1, hidden: false },
      { id: "2-2", parentId: "2", type: "menu", title: "运行历史", name: "syncHistory", path: "history", component: "data/analysis/index", icon: "ri:history-line", sort: 2, hidden: false },
    ],
  },
  {
    id: "3", parentId: null, type: "directory", title: "数据源", name: "datasource",
    path: "/datasource", component: "Layout", icon: "ri:database-2-line", sort: 3, hidden: false,
    children: [
      { id: "3-1", parentId: "3", type: "menu", title: "数据源管理", name: "datasourceList", path: "list", component: "components/table/index", icon: "ri:database-2-line", sort: 1, hidden: false },
    ],
  },
  {
    id: "6", parentId: null, type: "directory", title: "工作流", name: "workflow",
    path: "/workflow", component: "Layout", icon: "ri:flow-chart-line", sort: 5, hidden: false,
    children: [
      { id: "6-1", parentId: "6", type: "menu", title: "审批中心", name: "workflowApproval", path: "approval", component: "workflow/approval/index", icon: "ri:checkbox-circle-line", sort: 1, hidden: false },
    ],
  },
  {
    id: "4", parentId: null, type: "directory", title: "系统管理", name: "system",
    path: "/system", component: "Layout", icon: "ri:settings-3-line", sort: 4, hidden: false,
    children: [
      { id: "4-1", parentId: "4", type: "menu", title: "用户管理", name: "user", path: "user", component: "system/user/index", icon: "ri:group-line", sort: 1, hidden: false },
      { id: "4-2", parentId: "4", type: "menu", title: "部门管理", name: "dept", path: "dept", component: "system/dept/index", icon: "ri:building-2-line", sort: 2, hidden: false },
      { id: "4-3", parentId: "4", type: "menu", title: "角色管理", name: "role", path: "role", component: "system/role/index", icon: "ri:shield-user-line", sort: 3, hidden: false },
      { id: "4-4", parentId: "4", type: "menu", title: "菜单管理", name: "menu", path: "menu", component: "system/menu/index", icon: "ri:menu-2-line", sort: 4, hidden: false },
    ],
  },
  {
    id: "5", parentId: null, type: "directory", title: "个人中心", name: "profile",
    path: "/profile", component: "Layout", icon: "ri:user-3-line", sort: 5, hidden: false,
    children: [
      { id: "5-1", parentId: "5", type: "menu", title: "个人资料", name: "profileIndex", path: "index", component: "profile/index", icon: "ri:user-3-line", sort: 1, hidden: false },
    ],
  },
];

let menuIdSeq = 100;

const cloneTree = <T extends { children?: T[] }>(nodes: T[]): T[] =>
  nodes.map((n) => ({ ...n, children: n.children ? cloneTree(n.children) : undefined }));

function findDeptById(nodes: DeptRecord[], id: number): DeptRecord | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findDeptById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeDeptById(nodes: DeptRecord[], id: number): boolean {
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx >= 0) {
    nodes.splice(idx, 1);
    return true;
  }
  for (const n of nodes) {
    if (n.children && removeDeptById(n.children, id)) return true;
  }
  return false;
}

function upsertDept(nodes: DeptRecord[], record: DeptRecord, parentId: number): boolean {
  if (!parentId || parentId === 0) {
    const idx = nodes.findIndex((n) => n.id === record.id);
    if (idx >= 0) nodes[idx] = { ...nodes[idx], ...record };
    else nodes.push(record);
    return true;
  }
  for (const n of nodes) {
    if (n.id === parentId) {
      n.children = n.children || [];
      const idx = n.children.findIndex((c) => c.id === record.id);
      if (idx >= 0) n.children[idx] = { ...n.children[idx], ...record };
      else n.children.push(record);
      return true;
    }
    if (n.children && upsertDept(n.children, record, parentId)) return true;
  }
  return false;
}

function findMenuById(nodes: MenuRecord[], id: string): MenuRecord | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findMenuById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeMenuById(nodes: MenuRecord[], id: string): boolean {
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx >= 0) {
    nodes.splice(idx, 1);
    return true;
  }
  for (const n of nodes) {
    if (n.children && removeMenuById(n.children, id)) return true;
  }
  return false;
}

function upsertMenu(nodes: MenuRecord[], record: MenuRecord, parentId: string | null): boolean {
  if (!parentId) {
    const idx = nodes.findIndex((n) => n.id === record.id);
    if (idx >= 0) nodes[idx] = { ...nodes[idx], ...record };
    else nodes.push(record);
    return true;
  }
  for (const n of nodes) {
    if (n.id === parentId) {
      n.children = n.children || [];
      const idx = n.children.findIndex((c) => c.id === record.id);
      if (idx >= 0) n.children[idx] = { ...n.children[idx], ...record };
      else n.children.push(record);
      return true;
    }
    if (n.children && upsertMenu(n.children, record, parentId)) return true;
  }
  return false;
}

const ok = <T>(data: T, message = "请求成功") => ({ code: 200, message, msg: message, data });
const fail = (message: string, code = 500) => ({ code, message, msg: message, data: null });

/**
 * Nexus Data Sync 平台菜单
 * 一级：仪表盘 / 数据同步 / 数据源 / 系统管理 / 个人中心
 */
const generateMenuList = () => [
  {
    id: "1",
    path: "/dashboard",
    name: "dashboard",
    component: "dashboard/dashboard",
    meta: {
      title: "仪表盘",
      icon: "ri:dashboard-3-line",
      hidden: false,
      affix: true,
    },
  },
  {
    id: "2",
    path: "/sync",
    name: "sync",
    component: "Layout",
    redirect: "/sync/task",
    meta: {
      title: "数据同步",
      icon: "ri:refresh-line",
      hidden: false,
    },
    children: [
      {
        id: "2-1",
        path: "task",
        name: "syncTask",
        component: "data/task-list/index",
        meta: { title: "同步任务", icon: "ri:task-line", hidden: false },
      },
      {
        id: "2-3",
        path: "task/config",
        name: "syncTaskConfig",
        component: "data/report/index",
        meta: { title: "任务配置", hidden: true },
      },
      {
        id: "2-2",
        path: "history",
        name: "syncHistory",
        component: "data/analysis/index",
        meta: { title: "运行历史", icon: "ri:history-line", hidden: false },
      },
    ],
  },
  {
    id: "3",
    path: "/datasource",
    name: "datasource",
    component: "Layout",
    redirect: "/datasource/list",
    meta: {
      title: "数据源",
      icon: "ri:database-2-line",
      hidden: false,
    },
    children: [
      {
        id: "3-1",
        path: "list",
        name: "datasourceList",
        component: "components/table/index",
        meta: { title: "数据源管理", icon: "ri:database-2-line", hidden: false },
      },
    ],
  },
  {
    id: "6",
    path: "/workflow",
    name: "workflow",
    component: "Layout",
    redirect: "/workflow/approval",
    meta: {
      title: "工作流",
      icon: "ri:flow-chart-line",
      hidden: false,
    },
    children: [
      {
        id: "6-1",
        path: "approval",
        name: "workflowApproval",
        component: "workflow/approval/index",
        meta: { title: "审批中心", icon: "ri:checkbox-circle-line", hidden: false },
      },
    ],
  },
  {
    id: "4",
    path: "/system",
    name: "system",
    component: "Layout",
    redirect: "/system/user",
    meta: {
      title: "系统管理",
      icon: "ri:settings-3-line",
      hidden: false,
    },
    children: [
      {
        id: "4-1",
        path: "user",
        name: "user",
        component: "system/user/index",
        meta: { title: "用户管理", icon: "ri:group-line", hidden: false },
      },
      {
        id: "4-2",
        path: "dept",
        name: "dept",
        component: "system/dept/index",
        meta: { title: "部门管理", icon: "ri:building-2-line", hidden: false },
      },
      {
        id: "4-3",
        path: "role",
        name: "role",
        component: "system/role/index",
        meta: { title: "角色管理", icon: "ri:shield-user-line", hidden: false },
      },
      {
        id: "4-4",
        path: "menu",
        name: "menu",
        component: "system/menu/index",
        meta: { title: "菜单管理", icon: "ri:menu-2-line", hidden: false },
      },
    ],
  },
  {
    id: "5",
    path: "/profile",
    name: "profile",
    component: "Layout",
    redirect: "/profile/index",
    meta: {
      title: "个人中心",
      icon: "ri:user-3-line",
      hidden: false,
    },
    children: [
      {
        id: "5-1",
        path: "index",
        name: "profileIndex",
        component: "profile/index",
        meta: { title: "个人资料", icon: "ri:user-3-line", hidden: false },
      },
    ],
  },
];

const generateUserList = () =>
  Mock.mock({
    "list|20": [
      {
        "id|+1": 1,
        username: "@cname",
        nickname: "@cname",
        email: "@email",
        phone: /^1[3-9]\d{9}$/,
        avatar: "",
        "status|1": [0, 1],
        "role|1": ["超级管理员", "管理员", "普通用户"],
        "dept|1": ["技术部", "产品部", "运营部", "市场部", "人事部"],
        createTime: "@datetime",
        updateTime: "@datetime",
      },
    ],
  });

const generateNotifications = () => [
  {
    id: 1,
    type: "info",
    title: "数据同步",
    desc: "飞书订单表 → MySQL 同步任务已开启",
    time: "2 小时前",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "同步完成",
    desc: "用户表双向同步成功，共更新 1248 条",
    time: "5 小时前",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "连接异常",
    desc: "生产数据库连接超时，请检查配置",
    time: "1 天前",
    read: true,
  },
];

/**
 * 同步任务运行历史（替代原 scanRecords）
 */
const generateSyncHistory = () =>
  Mock.mock({
    "list|18": [
      {
        "id|+1": 1,
        "taskName|1": ["飞书订单同步", "用户表双向同步", "商品库存同步", "会员积分同步"],
        "source|1": ["飞书多维表", "MySQL", "PostgreSQL"],
        "target|1": ["MySQL", "飞书多维表", "PostgreSQL"],
        "direction|1": ["forward", "reverse", "bidirectional"],
        "totalRecords|100-10000": 0,
        "successRecords|0-10000": 0,
        "failedRecords|0-50": 0,
        "duration|10-300": 0,
        "status|1": ["success", "running", "failed"],
        "triggerType|1": ["手动", "定时"],
        createTime: "@datetime('yyyy-MM-dd HH:mm:ss')",
      },
    ],
  });

/**
 * 工作流审批中心：流程实例（固定种子数据，保证演示效果稳定）
 */
const workflowSeeds: Array<
  Pick<WorkflowRecord, "title" | "type" | "applicant" | "department" | "priority" | "reason" | "amount">
> = [
  { title: "采购申请 · MacBook Pro 开发机", type: "purchase", applicant: "沈知远", department: "研发部", priority: "high", reason: "入职新同事需要开发机，配置 32G 内存 + M3 Pro", amount: "18999.00" },
  { title: "请假申请 · 年假 3 天", type: "leave", applicant: "林晚晴", department: "产品部", priority: "medium", reason: "家中有事，申请 9 月 2 日至 9 月 4 日年假", amount: "0.00" },
  { title: "差旅报销 · 深圳客户现场支持", type: "expense", applicant: "周墨白", department: "交付部", priority: "medium", reason: "客户现场部署差旅费用，含高铁与住宿发票 6 张", amount: "4632.50" },
  { title: "合同用印 · 华信集团年度框架协议", type: "contract", applicant: "苏念安", department: "商务部", priority: "high", reason: "年度框架合作协议一式两份，申请用印并归档", amount: "1260000.00" },
  { title: "采购申请 · 测试服务器扩容", type: "purchase", applicant: "陈嘉树", department: "运维部", priority: "high", reason: "压测集群内存不足，申请 2 台 64G 云主机", amount: "27600.00" },
  { title: "报销申请 · 团建活动费用", type: "expense", applicant: "顾晓萌", department: "人事部", priority: "low", reason: "Q3 季度团建聚餐费用，共 23 人", amount: "5980.00" },
  { title: "请假申请 · 病假 1 天", type: "leave", applicant: "赵一鸣", department: "研发部", priority: "low", reason: "感冒发烧，申请 8 月 29 日病假一天", amount: "0.00" },
  { title: "合同用印 · 启明传媒投放合同", type: "contract", applicant: "苏念安", department: "商务部", priority: "medium", reason: "Q4 品牌投放合同，金额以最终结算为准", amount: "380000.00" },
  { title: "采购申请 · 办公区绿植更换", type: "purchase", applicant: "顾晓萌", department: "行政部", priority: "low", reason: "办公区绿植季度轮换养护", amount: "2380.00" },
  { title: "差旅报销 · 北京行业峰会", type: "expense", applicant: "林晚晴", department: "产品部", priority: "medium", reason: "产品峰会门票与差旅，含会议资料费", amount: "7250.00" },
  { title: "采购申请 · 显示器升级", type: "purchase", applicant: "赵一鸣", department: "研发部", priority: "medium", reason: "老员工显示器升级为 4K 双屏", amount: "12992.00" },
  { title: "请假申请 · 调休 2 天", type: "leave", applicant: "周墨白", department: "交付部", priority: "low", reason: "项目上线后调休，申请 9 月 5 日至 6 日", amount: "0.00" },
];

interface WorkflowRecord {
  id: string;
  title: string;
  type: "leave" | "purchase" | "expense" | "contract" | "other";
  applicant: string;
  department: string;
  currentNode: string;
  status: "pending" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
  createdAt: string;
  reason: string;
  amount: string;
  /** 绑定的流程模板与实际节点链（发起流程时写入；种子数据走默认链） */
  templateId?: string;
  flowNodes?: Array<{ nodeName: string; assignee: string }>;
}

const workflowList: WorkflowRecord[] = workflowSeeds.map((seed, i) => {
  const status = i % 3 === 0 ? "pending" : i % 3 === 1 ? "approved" : "rejected";
  return {
    id: `WF-2026${String(100 + i)}`,
    ...seed,
    status,
    currentNode: status === "pending" ? "部门主管审批" : status === "approved" ? "流程结束" : "部门主管审批",
    createdAt: `2026-08-${String(16 + (i % 14)).padStart(2, "0")} ${String(9 + (i % 8)).padStart(2, "0")}:${i % 2 ? "25" : "50"}:00`,
  };
});

/** 发起流程的自增序号（与固定种子数据 WF-2026100~111 错开） */
let workflowSeq = 200;

/**
 * 流程模板（轻量审批链）：发起流程时绑定，决定节点链路与默认审批人
 */
const workflowTemplates = [
  {
    id: "tpl_purchase",
    name: "采购审批流",
    type: "purchase",
    desc: "适用于物品/设备采购，金额较大时增加总经理审批",
    nodes: [
      { key: "submit", nodeName: "提交申请", approver: "发起人" },
      { key: "leader", nodeName: "部门主管审批", approver: "王建国" },
      { key: "manager", nodeName: "分管经理审批", approver: "李明轩" },
      { key: "boss", nodeName: "总经理审批", approver: "赵鸿飞" },
      { key: "end", nodeName: "流程结束", approver: "发起人" },
    ],
    candidates: ["王建国", "李明轩", "赵鸿飞", "孙倩", "周文彬"],
  },
  {
    id: "tpl_leave",
    name: "请假审批流",
    type: "leave",
    desc: "适用于请假/调休等人事流程，一级审批即可",
    nodes: [
      { key: "submit", nodeName: "提交申请", approver: "发起人" },
      { key: "leader", nodeName: "部门主管审批", approver: "王建国" },
      { key: "end", nodeName: "流程结束", approver: "发起人" },
    ],
    candidates: ["王建国", "李明轩", "孙倩"],
  },
  {
    id: "tpl_general",
    name: "通用审批流",
    type: "other",
    desc: "适用于报销、合同等其他通用事项",
    nodes: [
      { key: "submit", nodeName: "提交申请", approver: "发起人" },
      { key: "leader", nodeName: "部门主管审批", approver: "王建国" },
      { key: "manager", nodeName: "分管经理审批", approver: "李明轩" },
      { key: "end", nodeName: "流程结束", approver: "发起人" },
    ],
    candidates: ["王建国", "李明轩", "赵鸿飞", "孙倩"],
  },
];

const findTemplate = (id: string) => workflowTemplates.find((tpl) => tpl.id === id);

/** 按状态推导节点流转记录：优先使用发起时绑定的模板节点链，种子数据走默认链 */
function buildWorkflowSteps(item: WorkflowRecord) {
  const chain = item.flowNodes?.length
    ? item.flowNodes
    : [
        { nodeName: "提交申请", assignee: item.applicant },
        { nodeName: "部门主管审批", assignee: "王建国" },
        { nodeName: "分管经理审批", assignee: "李明轩" },
        { nodeName: "流程结束", assignee: item.applicant },
      ];

  const last = chain.length - 1;
  return chain.map((node, i) => {
    if (i === 0) {
      return { nodeName: node.nodeName, assignee: node.assignee, status: "done", time: item.createdAt, comment: item.reason };
    }
    if (item.status === "approved") {
      return {
        nodeName: node.nodeName,
        assignee: node.assignee,
        status: "done",
        time: `2026-08-${String(17 + (i % 12)).padStart(2, "0")} 14:30:00`,
        comment: i === last ? "同意归档" : "情况属实，同意",
      };
    }
    if (item.status === "rejected" && i === 1) {
      return { nodeName: node.nodeName, assignee: node.assignee, status: "rejected", time: "2026-08-19 10:05:00", comment: "预算不足，请补充成本说明后重新提交" };
    }
    if (item.status === "pending" && i === 1) {
      return { nodeName: node.nodeName, assignee: node.assignee, status: "current" };
    }
    return { nodeName: node.nodeName, assignee: node.assignee, status: "pending" };
  });
}

export default [
  {
    url: "/api/admin/login",
    method: "post",
    statusCode: 200,
    response: () => ({
      code: 200,
      message: "登录成功",
      data: {
        token: "ASKS99WH7828JAU89892I0A6Y2802J",
        userInfo: {
          id: 1,
          username: "admin",
          nickname: "管理员",
          avatar: "",
          email: "admin@example.com",
          phone: "13800138000",
          roles: ["admin"],
          permissions: ["*"],
        },
      },
    }),
  },
  {
    url: "/api/admin/getUserInfo",
    method: "get",
    statusCode: 200,
    response: () => ({
      code: 200,
      message: "请求成功",
      data: {
        id: 1,
        username: "admin",
        nickname: "管理员",
        avatar: "",
        email: "admin@example.com",
        phone: "13800138000",
        roles: ["admin"],
        permissions: ["*"],
        dept: "技术部",
        position: "高级管理员",
      },
    }),
  },
  {
    url: "/api/admin/getMenuList",
    method: "post",
    statusCode: 200,
    response: () => ({
      code: 200,
      message: "请求成功",
      data: generateMenuList(),
    }),
  },
  {
    url: "/api/admin/getUserList",
    method: "get",
    statusCode: 200,
    response: () => {
      const { list } = generateUserList();
      return ok({ list, total: list.length, page: 1, pageSize: 20 });
    },
  },
  {
    url: "/api/admin/user/list",
    method: "get",
    statusCode: 200,
    response: ({ query }: { query: Record<string, string> }) => {
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;
      const keyword = (query.keyword || "").trim();
      const role = (query.role || "").trim();
      const status = query.status === "" || query.status === undefined ? null : Number(query.status);
      let list = [...userRecords];
      if (keyword) {
        list = list.filter((u) => u.username.includes(keyword) || u.nickname.includes(keyword));
      }
      if (role) list = list.filter((u) => u.role === role);
      if (status !== null) list = list.filter((u) => u.status === status);
      const total = list.length;
      const start = (page - 1) * pageSize;
      return ok({ list: list.slice(start, start + pageSize), total, page, pageSize });
    },
  },
  {
    url: "/api/admin/user/save",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: Partial<UserRecord> & { password?: string } }) => {
      const { id, username, nickname, email, phone, role, dept, status = 1 } = body || {};
      if (!username || !nickname) return fail("用户名与昵称不能为空");
      if (id) {
        const target = userRecords.find((u) => u.id === Number(id));
        if (!target) return fail("用户不存在");
        Object.assign(target, { username, nickname, email, phone, role, dept, status });
        return ok({ id: target.id }, "保存成功");
      }
      if (userRecords.some((u) => u.username === username)) return fail("用户名已存在");
      const newId = ++userIdSeq;
      userRecords.unshift({
        id: newId, username, nickname, email: email || "", phone: phone || "",
        role: role || "普通用户", dept: dept || "技术部", status,
        createTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      });
      return ok({ id: newId }, "新增成功");
    },
  },
  {
    url: "/api/admin/user/delete",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: string | number } }) => {
      const id = Number(body?.id);
      if (!id) return fail("缺少用户 ID");
      const idx = userRecords.findIndex((u) => u.id === id);
      if (idx < 0) return fail("用户不存在");
      userRecords.splice(idx, 1);
      return ok(null, "删除成功");
    },
  },
  {
    url: "/api/admin/user/status",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: string | number; status?: number } }) => {
      const id = Number(body?.id);
      if (!id) return fail("缺少用户 ID");
      const target = userRecords.find((u) => u.id === id);
      if (!target) return fail("用户不存在");
      target.status = Number(body?.status);
      return ok(null, "状态已更新");
    },
  },
  {
    url: "/api/admin/getNotifications",
    method: "get",
    statusCode: 200,
    response: () => ({
      code: 200,
      message: "请求成功",
      data: {
        list: generateNotifications(),
        unreadCount: 3,
      },
    }),
  },
  {
    url: "/api/admin/getSyncHistory",
    method: "get",
    statusCode: 200,
    response: () => {
      const { list } = generateSyncHistory();
      return {
        code: 200,
        message: "请求成功",
        data: {
          list,
          total: list.length,
          page: 1,
          pageSize: 20,
        },
      };
    },
  },
  {
    url: "/api/workflow/list",
    method: "get",
    statusCode: 200,
    response: ({ query }: { query: Record<string, string | undefined> }) => {
      const { status, keyword, page = "1", pageSize = "10" } = query;
      let list = [...workflowList];
      if (status) list = list.filter((item) => item.status === status);
      if (keyword) {
        list = list.filter(
          (item) => item.title.includes(keyword) || item.applicant.includes(keyword) || item.department.includes(keyword),
        );
      }
      const p = Number(page);
      const size = Number(pageSize);
      return ok({
        list: list.slice((p - 1) * size, p * size),
        total: list.length,
        page: p,
        pageSize: size,
      });
    },
  },
  {
    url: "/api/workflow/detail",
    method: "get",
    statusCode: 200,
    response: ({ query }: { query: Record<string, string | undefined> }) => {
      const item = workflowList.find((w) => w.id === query.id);
      if (!item) return fail("流程不存在", 404);
      return ok({ ...item, steps: buildWorkflowSteps(item) });
    },
  },
  {
    url: "/api/workflow/audit",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id: string; action: "approve" | "reject"; comment?: string } }) => {
      const item = workflowList.find((w) => w.id === body?.id);
      if (!item) return fail("流程不存在", 404);
      if (item.status !== "pending") return fail("该流程已审批完成");
      item.status = body.action === "approve" ? "approved" : "rejected";
      item.currentNode = body.action === "approve" ? "流程结束" : "部门主管审批";
      return ok(null, body.action === "approve" ? "审批通过" : "已驳回");
    },
  },
  {
    url: "/api/workflow/templates",
    method: "get",
    statusCode: 200,
    response: () => ok(workflowTemplates),
  },
  {
    url: "/api/workflow/create",
    method: "post",
    statusCode: 200,
    response: ({
      body,
    }: {
      body: {
        templateId: string;
        type: WorkflowRecord["type"];
        title: string;
        priority: WorkflowRecord["priority"];
        amount: number;
        reason: string;
        approvers?: string[];
      };
    }) => {
      if (!body?.title?.trim() || !body?.reason?.trim()) return fail("流程标题与申请事由不能为空");
      const template = findTemplate(body.templateId) ?? workflowTemplates[2];
      workflowSeq += 1;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      // 节点链来自模板，审批人按用户选择覆盖（缺省回退模板默认）
      const flowNodes = template.nodes.map((node, i) => ({
        nodeName: node.nodeName,
        assignee: body.approvers?.[i]?.trim() || node.approver,
      }));
      const record: WorkflowRecord = {
        id: `WF-2026${workflowSeq}`,
        title: body.title.trim(),
        type: body.type || template.type,
        applicant: "管理员",
        department: "研发部",
        currentNode: flowNodes[1]?.nodeName ?? "部门主管审批",
        status: "pending",
        priority: body.priority || "medium",
        createdAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
        reason: body.reason.trim(),
        amount: (Number(body.amount) || 0).toFixed(2),
        templateId: template.id,
        flowNodes,
      };
      workflowList.unshift(record);
      return ok(
        { ...record, flowNodes: undefined, templateId: record.templateId },
        "流程已提交",
      );
    },
  },
  {
    url: "/api/admin/logout",
    method: "post",
    statusCode: 200,
    response: () => ({
      code: 200,
      message: "退出成功",
      data: null,
    }),
  },
  // ===== 仪表盘聚合数据 =====
  {
    url: "/api/dashboard/overview",
    method: "get",
    statusCode: 200,
    response: () => {
      const today = new Date();
      const days: { date: string; success: number; failed: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const label = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        days.push({
          date: label,
          success: Mock.Random.integer(6, 18),
          failed: Mock.Random.integer(0, 3),
        });
      }

      const recentTasks = Array.from({ length: 6 }).map((_, idx) => {
        const statuses: ("success" | "running" | "failed")[] = ["success", "success", "success", "running", "failed", "success"];
        const directions: ("forward" | "reverse" | "bidirectional")[] = ["forward", "reverse", "bidirectional"];
        return {
          id: idx + 1,
          taskName: Mock.Random.pick(["飞书订单同步", "用户表双向同步", "商品库存同步", "会员积分同步", "支付流水同步"]),
          source: Mock.Random.pick(["飞书多维表", "MySQL", "PostgreSQL"]),
          target: Mock.Random.pick(["MySQL", "飞书多维表", "PostgreSQL"]),
          direction: Mock.Random.pick(directions),
          status: statuses[idx % statuses.length],
          duration: Mock.Random.integer(8, 240),
          createTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
        };
      });

      return {
        code: 200,
        message: "请求成功",
        data: {
          metrics: {
            totalTasks: 36,
            todaySyncCount: 12,
            successRate: 96.8,
            avgDuration: 48,
            totalTasksTrend: 8,
            todaySyncTrend: 25,
            successRateTrend: -1.2,
            avgDurationTrend: -12,
          },
          trends: days,
          statusDistribution: {
            success: 156,
            running: 3,
            failed: 12,
          },
          recentTasks,
        },
      };
    },
  },
  // ===== 数据同步任务相关接口 =====
  {
    url: "/api/sync/testFeishu",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { appToken?: string; tableId?: string } }) => {
      const { appToken, tableId } = body || {};
      if (!appToken || !tableId) {
        return {
          code: 200,
          message: "请求成功",
          data: { success: false, message: "App Token 与 Table ID 不能为空" },
        };
      }
      return {
        code: 200,
        message: "请求成功",
        data: {
          success: true,
          message: "飞书多维表连接成功",
          latency: Mock.Random.integer(80, 240),
        },
      };
    },
  },
  {
    url: "/api/sync/testDatabase",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { host?: string; database?: string; type?: string } }) => {
      const { host, database } = body || {};
      if (!host || !database) {
        return {
          code: 200,
          message: "请求成功",
          data: { success: false, message: "服务器地址与数据库名不能为空" },
        };
      }
      return {
        code: 200,
        message: "请求成功",
        data: {
          success: true,
          message: `${body?.type?.toUpperCase() || "MySQL"} 数据库连接成功`,
          latency: Mock.Random.integer(20, 120),
        },
      };
    },
  },
  {
    url: "/api/sync/getFeishuFields",
    method: "post",
    statusCode: 200,
    response: () => ({
      code: 200,
      message: "请求成功",
      data: [
        { name: "订单编号", type: "text", description: "订单的唯一编号" },
        { name: "客户名称", type: "text", description: "下单客户名称" },
        { name: "联系电话", type: "text", description: "客户手机号" },
        { name: "下单金额", type: "number", description: "订单总金额（元）" },
        { name: "下单时间", type: "datetime", description: "订单创建时间" },
        { name: "订单状态", type: "select", description: "订单当前状态" },
        { name: "收货地址", type: "text", description: "收货详细地址" },
      ],
    }),
  },
  {
    url: "/api/sync/getDatabaseFields",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { type?: string } }) => {
      const type = body?.type || "mysql";
      const prefix = type === "postgresql" ? "varchar" : type === "sqlserver" ? "nvarchar" : "varchar";
      return {
        code: 200,
        message: "请求成功",
        data: [
          { name: "order_id", type: `${prefix}(32)`, description: "订单编号" },
          { name: "customer_name", type: `${prefix}(64)`, description: "客户名称" },
          { name: "customer_phone", type: `${prefix}(20)`, description: "联系电话" },
          { name: "amount", type: "decimal(10,2)", description: "下单金额" },
          { name: "created_at", type: "datetime", description: "下单时间" },
          { name: "status", type: "tinyint", description: "订单状态 0-待支付 1-已支付 2-已取消" },
          { name: "shipping_address", type: `${prefix}(255)`, description: "收货地址" },
        ],
      };
    },
  },
  {
    url: "/api/sync/parseCron",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { cron?: string } }) => {
      const cron = (body?.cron || "").trim();
      const parts = cron.split(/\s+/);
      const nextRuns: string[] = [];
      const now = new Date();

      // 简易解析：覆盖常见 Quartz 6 段表达式
      const [sec, min, hour, dom, mon, dow] = [...parts, ...Array(6).fill("*")].slice(0, 6);
      let description = "自定义表达式";

      if (parts.length === 6) {
        if (sec === "0" && min === "0" && hour === "*" && dom === "*" && mon === "*" && dow === "?") {
          description = "每小时整点执行";
          for (let i = 1; i <= 5; i++) nextRuns.push(addHours(now, i));
        } else if (sec === "0" && /^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && mon === "*" && dow === "?") {
          description = `每天 ${pad(hour)}:${pad(min)} 执行`;
          for (let i = 0; i < 5; i++) nextRuns.push(addDaysAt(now, i, Number(hour), Number(min)));
        } else if (sec === "0" && min === "0" && /^\*\/\d+$/.test(hour) && dom === "*" && mon === "*" && dow === "?") {
          const step = Number(hour.slice(2));
          description = `每 ${step} 小时执行`;
          for (let i = 1; i <= 5; i++) nextRuns.push(addHours(now, i * step));
        } else if (sec === "0" && min === "0" && /^\d+$/.test(hour) && dom === "*" && mon === "*" && /^\d+$/.test(dow)) {
          description = `每周${["日", "一", "二", "三", "四", "五", "六"][Number(dow) % 7]} ${pad(hour)}:00 执行`;
          for (let i = 1; i <= 5; i++) nextRuns.push(addWeeks(now, i, Number(hour)));
        } else if (sec === "0" && min === "0" && /^\d+$/.test(hour) && dom === "*" && mon === "*" && /^1-5$/.test(dow)) {
          description = `工作日 ${pad(hour)}:00 执行`;
          for (let i = 1; i <= 5; i++) nextRuns.push(addWorkdays(now, i, Number(hour)));
        }
      }

      return {
        code: 200,
        message: "请求成功",
        data: { description, nextRuns: nextRuns.slice(0, 5) },
      };
    },
  },
  {
    url: "/api/sync/save",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: Record<string, unknown> }) => {
      const b = (body || {}) as Partial<SyncTaskRecord> & { schedule?: { enabled?: boolean; cron?: string } };
      if (!b.name) return fail("任务名称不能为空");

      const scheduleEnabled = Boolean(b.schedule?.enabled ?? b.scheduleEnabled ?? false);
      const cron = String(b.schedule?.cron ?? b.cron ?? "");

      if (b.id) {
        const target = findSyncTask(Number(b.id));
        if (!target) return fail("任务不存在");
        Object.assign(target, {
          name: b.name,
          description: b.description ?? "",
          direction: b.direction ?? target.direction,
          scheduleEnabled,
          cron,
          updateTime: syncTaskNow(),
          feishu: b.feishu ?? target.feishu,
          database: b.database ?? target.database,
          fields: b.fields ?? target.fields,
        });
        return ok({ id: target.id }, "保存成功");
      }

      const id = ++syncTaskIdSeq;
      syncTaskRecords.unshift({
        id,
        name: b.name,
        description: b.description ?? "",
        direction: (b.direction ?? "feishu-to-db") as SyncDirectionValue,
        scheduleEnabled,
        cron,
        cronDescription: "自定义表达式",
        status: 1,
        lastRunAt: "",
        lastRunStatus: "",
        updateTime: syncTaskNow(),
        feishu: b.feishu ?? { appToken: "", tableId: "", direction: "feishu-to-db" },
        database: b.database ?? { type: "mysql", host: "", port: 3306, database: "", username: "", password: "", table: "" },
        fields: (b.fields as SyncTaskRecord["fields"]) ?? [],
      });
      return ok({ id }, "保存成功");
    },
  },
  {
    url: "/api/sync/run",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: number | string } }) => {
      const target = findSyncTask(Number(body?.id));
      if (!target) return fail("任务不存在");
      target.lastRunAt = syncTaskNow();
      target.lastRunStatus = "running";
      return ok({
        runId: Mock.Random.integer(100000, 999999),
        estimatedFinishAt: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      }, "已触发执行");
    },
  },
  {
    url: "/api/sync/task/list",
    method: "get",
    statusCode: 200,
    response: ({ query }: { query: Record<string, string> }) => {
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;
      const keyword = (query.keyword || "").trim();
      const status = query.status === "" || query.status === undefined ? null : Number(query.status);

      let list = [...syncTaskRecords];
      if (keyword) list = list.filter((t) => t.name.includes(keyword) || t.description.includes(keyword));
      if (status !== null) list = list.filter((t) => t.status === status);

      const total = list.length;
      const start = (page - 1) * pageSize;
      return ok({
        list: list.slice(start, start + pageSize).map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          direction: t.direction,
          scheduleEnabled: t.scheduleEnabled,
          cron: t.cron,
          cronDescription: t.cronDescription,
          status: t.status,
          lastRunAt: t.lastRunAt,
          lastRunStatus: t.lastRunStatus,
          updateTime: t.updateTime,
        })),
        total,
        page,
        pageSize,
      });
    },
  },
  {
    url: "/api/sync/task/detail",
    method: "get",
    statusCode: 200,
    response: ({ query }: { query: Record<string, string> }) => {
      const target = findSyncTask(Number(query.id));
      if (!target) return fail("任务不存在");
      return ok(target);
    },
  },
  {
    url: "/api/sync/task/status",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: number; status?: number } }) => {
      const target = findSyncTask(Number(body?.id));
      if (!target) return fail("任务不存在");
      target.status = Number(body?.status) === 1 ? 1 : 0;
      return ok({ id: target.id, status: target.status }, target.status === 1 ? "已启用" : "已停用");
    },
  },
  {
    url: "/api/sync/task/delete",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: number } }) => {
      const id = Number(body?.id);
      const index = syncTaskRecords.findIndex((t) => t.id === id);
      if (index === -1) return fail("任务不存在");
      syncTaskRecords.splice(index, 1);
      return ok(null, "删除成功");
    },
  },
  // ===== 部门 CRUD =====
  {
    url: "/api/admin/dept/list",
    method: "get",
    statusCode: 200,
    response: () => ok(cloneTree(deptRecords)),
  },
  {
    url: "/api/admin/dept/save",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: Partial<DeptRecord> }) => {
      const { id, parentId = 0, name, leader, phone, email, sort = 1, status = 1 } = body || {};
      if (!name) return fail("部门名称不能为空");
      const pid = Number(parentId) || 0;
      if (id) {
        const target = findDeptById(deptRecords, Number(id));
        if (!target) return fail("部门不存在");
        const record: DeptRecord = { ...target, name, leader, phone, email, sort, status } as DeptRecord;
        if (target.parentId !== pid) {
          removeDeptById(deptRecords, target.id);
          upsertDept(deptRecords, { ...record, parentId: pid }, pid);
        } else {
          upsertDept(deptRecords, record, pid);
        }
        return ok({ id: target.id }, "保存成功");
      }
      const newId = ++deptIdSeq;
      const record: DeptRecord = {
        id: newId, parentId: pid, name, leader: leader || "", phone: phone || "",
        email: email || "", sort, status,
      };
      upsertDept(deptRecords, record, pid);
      return ok({ id: newId }, "新增成功");
    },
  },
  {
    url: "/api/admin/dept/delete",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: number } }) => {
      const id = Number(body?.id);
      if (!id) return fail("缺少部门 ID");
      if (!findDeptById(deptRecords, id)) return fail("部门不存在");
      removeDeptById(deptRecords, id);
      return ok(null, "删除成功");
    },
  },
  // ===== 角色 CRUD =====
  {
    url: "/api/admin/role/list",
    method: "get",
    statusCode: 200,
    response: ({ query }: { query: Record<string, string> }) => {
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;
      const keyword = (query.keyword || "").trim();
      const status = query.status === "" || query.status === undefined ? null : Number(query.status);
      let list = [...roleRecords];
      if (keyword) {
        list = list.filter((r) => r.name.includes(keyword) || r.code.includes(keyword));
      }
      if (status !== null) list = list.filter((r) => r.status === status);
      const total = list.length;
      const start = (page - 1) * pageSize;
      return ok({ list: list.slice(start, start + pageSize), total, page, pageSize });
    },
  },
  {
    url: "/api/admin/role/save",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: Partial<RoleRecord> }) => {
      const { id, name, code, description = "", status = 1, menuIds = [] } = body || {};
      if (!name || !code) return fail("角色名称与编码不能为空");
      if (id) {
        const target = roleRecords.find((r) => r.id === Number(id));
        if (!target) return fail("角色不存在");
        Object.assign(target, { name, code, description, status, menuIds });
        return ok({ id: target.id }, "保存成功");
      }
      if (roleRecords.some((r) => r.code === code)) return fail("角色编码已存在");
      const newId = ++roleIdSeq;
      roleRecords.push({
        id: newId, name, code, description, status, menuIds,
        createTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      });
      return ok({ id: newId }, "新增成功");
    },
  },
  {
    url: "/api/admin/role/delete",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: number } }) => {
      const id = Number(body?.id);
      if (!id) return fail("缺少角色 ID");
      const idx = roleRecords.findIndex((r) => r.id === id);
      if (idx < 0) return fail("角色不存在");
      roleRecords.splice(idx, 1);
      return ok(null, "删除成功");
    },
  },
  {
    url: "/api/admin/role/status",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: number; status?: number } }) => {
      const id = Number(body?.id);
      if (!id) return fail("缺少角色 ID");
      const target = roleRecords.find((r) => r.id === id);
      if (!target) return fail("角色不存在");
      target.status = Number(body?.status);
      return ok(null, "状态已更新");
    },
  },
  // ===== 菜单 CRUD =====
  {
    url: "/api/admin/menu/tree",
    method: "get",
    statusCode: 200,
    response: () => ok(cloneTree(menuRecords)),
  },
  {
    url: "/api/admin/menu/save",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: Partial<MenuRecord> }) => {
      const {
        id, parentId = null, type = "menu", title, name, path, component,
        icon, sort = 1, hidden = false, permission,
      } = body || {};
      if (!title) return fail("菜单名称不能为空");
      const pid = parentId ? String(parentId) : null;
      if (id) {
        const target = findMenuById(menuRecords, String(id));
        if (!target) return fail("菜单不存在");
        const record: MenuRecord = {
          ...target, parentId: pid, type, title, name, path, component,
          icon, sort, hidden, permission,
        } as MenuRecord;
        if (target.parentId !== pid) {
          removeMenuById(menuRecords, target.id);
          upsertMenu(menuRecords, { ...record, parentId: pid }, pid);
        } else {
          upsertMenu(menuRecords, record, pid);
        }
        return ok({ id: target.id }, "保存成功");
      }
      const newId = String(++menuIdSeq);
      const record: MenuRecord = {
        id: newId, parentId: pid, type, title, name, path, component,
        icon, sort, hidden, permission,
      } as MenuRecord;
      upsertMenu(menuRecords, record, pid);
      return ok({ id: newId }, "新增成功");
    },
  },
  {
    url: "/api/admin/menu/delete",
    method: "post",
    statusCode: 200,
    response: ({ body }: { body: { id?: string | number } }) => {
      const id = body?.id ? String(body.id) : "";
      if (!id) return fail("缺少菜单 ID");
      if (!findMenuById(menuRecords, id)) return fail("菜单不存在");
      removeMenuById(menuRecords, id);
      return ok(null, "删除成功");
    },
  },
] as MockMethod[];

/** 简易日期工具：用于 cron 预览的下次执行时间生成 */
function pad(n: number | string) {
  return String(n).padStart(2, "0");
}
function format(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function addHours(d: Date, h: number) {
  const t = new Date(d);
  t.setHours(t.getHours() + h);
  return format(t);
}
function addDaysAt(d: Date, days: number, hour: number, minute: number) {
  const t = new Date(d);
  t.setDate(t.getDate() + days);
  t.setHours(hour, minute, 0, 0);
  return format(t);
}
function addWeeks(d: Date, weeks: number, hour: number) {
  const t = new Date(d);
  t.setDate(t.getDate() + weeks * 7);
  t.setHours(hour, 0, 0, 0);
  return format(t);
}
function addWorkdays(d: Date, count: number, hour: number) {
  const t = new Date(d);
  let added = 0;
  while (added < count) {
    t.setDate(t.getDate() + 1);
    const dow = t.getDay();
    if (dow >= 1 && dow <= 5) added++;
  }
  t.setHours(hour, 0, 0, 0);
  return format(t);
}
