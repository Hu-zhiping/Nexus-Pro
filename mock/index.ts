import type { MockMethod } from "vite-plugin-mock";
import Mock from "mockjs";

const { Random } = Mock;

// 生成菜单列表
const generateMenuList = () => {
  return [
    {
      id: "1",
      path: "/dashboard",
      name: "dashboard",
      component: "dashboard/index",
      meta: {
        title: "首页",
        icon: "ri:dashboard-line",
        hidden: false,
        affix: true,
      },
    },
    {
      id: "2",
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
          id: "2-1",
          path: "user",
          name: "user",
          component: "system/user/index",
          meta: {
            title: "用户管理",
            icon: "ri:user-line",
            hidden: false,
          },
        },
        {
          id: "2-2",
          path: "role",
          name: "role",
          component: "system/role/index",
          meta: {
            title: "角色管理",
            icon: "ri:shield-user-line",
            hidden: false,
          },
        },
        {
          id: "2-3",
          path: "menu",
          name: "menu",
          component: "system/menu/index",
          meta: {
            title: "菜单管理",
            icon: "ri:menu-line",
            hidden: false,
          },
        },
        {
          id: "2-4",
          path: "dept",
          name: "dept",
          component: "system/dept/index",
          meta: {
            title: "部门管理",
            icon: "ri:organization-chart",
            hidden: false,
          },
        },
      ],
    },
    {
      id: "3",
      path: "/data",
      name: "data",
      component: "Layout",
      redirect: "/data/report",
      meta: {
        title: "数据报表",
        icon: "ri:bar-chart-box-line",
        hidden: false,
      },
      children: [
        {
          id: "3-1",
          path: "report",
          name: "report",
          component: "data/report/index",
          meta: {
            title: "数据报表",
            icon: "ri:line-chart-line",
            hidden: false,
          },
        },
        {
          id: "3-2",
          path: "analysis",
          name: "analysis",
          component: "data/analysis/index",
          meta: {
            title: "数据分析",
            icon: "ri:pie-chart-line",
            hidden: false,
          },
        },
      ],
    },
    {
      id: "4",
      path: "/components",
      name: "components",
      component: "Layout",
      redirect: "/components/table",
      meta: {
        title: "组件示例",
        icon: "ri:apps-line",
        hidden: false,
      },
      children: [
        {
          id: "4-1",
          path: "table",
          name: "table",
          component: "components/table/index",
          meta: {
            title: "高级表格",
            icon: "ri:table-2",
            hidden: false,
          },
        },
        {
          id: "4-2",
          path: "form",
          name: "form",
          component: "components/form/index",
          meta: {
            title: "表单组件",
            icon: "ri:file-list-line",
            hidden: false,
          },
        },
        {
          id: "4-3",
          path: "editor",
          name: "editor",
          component: "components/editor/index",
          meta: {
            title: "富文本编辑器",
            icon: "ri:edit-line",
            hidden: false,
          },
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
        icon: "ri:user-settings-line",
        hidden: true,
      },
      children: [
        {
          id: "5-1",
          path: "index",
          name: "profileIndex",
          component: "profile/index",
          meta: {
            title: "个人资料",
            icon: "ri:user-line",
            hidden: false,
          },
        },
        {
          id: "5-2",
          path: "settings",
          name: "profileSettings",
          component: "profile/settings",
          meta: {
            title: "个人设置",
            icon: "ri:settings-4-line",
            hidden: false,
          },
        },
      ],
    },
  ];
};

// 生成用户列表
const generateUserList = () => {
  return Mock.mock({
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
};

// 生成通知消息
const generateNotifications = () => {
  return [
    {
      id: 1,
      type: "info",
      title: "欢迎使用 Vue Admin Pro",
      desc: "这是一个功能强大的后台管理系统",
      time: "5分钟前",
      read: false,
    },
    {
      id: 2,
      type: "success",
      title: "系统升级完成",
      desc: "系统已升级至 v2.0 版本",
      time: "1小时前",
      read: false,
    },
    {
      id: 3,
      type: "warning",
      title: "密码即将过期",
      desc: "您的密码将在 7 天后过期",
      time: "2小时前",
      read: true,
    },
    {
      id: 4,
      type: "error",
      title: "登录异常提醒",
      desc: "检测到您的账号在异地登录",
      time: "昨天",
      read: false,
    },
  ];
};

export default [
  // 登录接口
  {
    url: "/api/admin/login",
    method: "post",
    statusCode: 200,
    response: () => {
      return {
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
      };
    },
  },
  // 获取用户信息
  {
    url: "/api/admin/getUserInfo",
    method: "get",
    statusCode: 200,
    response: () => {
      return {
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
          position: "高级工程师",
        },
      };
    },
  },
  // 获取菜单列表
  {
    url: "/api/admin/getMenuList",
    method: "post",
    statusCode: 200,
    response: () => {
      return {
        code: 200,
        message: "请求成功",
        data: generateMenuList(),
      };
    },
  },
  // 获取用户列表
  {
    url: "/api/admin/getUserList",
    method: "get",
    statusCode: 200,
    response: () => {
      const { list } = generateUserList();
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
  // 获取通知消息
  {
    url: "/api/admin/getNotifications",
    method: "get",
    statusCode: 200,
    response: () => {
      return {
        code: 200,
        message: "请求成功",
        data: {
          list: generateNotifications(),
          unreadCount: 3,
        },
      };
    },
  },
  // 退出登录
  {
    url: "/api/admin/logout",
    method: "post",
    statusCode: 200,
    response: () => {
      return {
        code: 200,
        message: "退出成功",
        data: null,
      };
    },
  },
] as MockMethod[];
