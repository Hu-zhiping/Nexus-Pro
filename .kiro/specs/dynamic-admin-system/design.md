# Vue + Spring Boot 动态后台管理系统设计文档

## 系统架构设计

### 整体架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Vue3)    │    │  后端 (Spring)   │    │   数据库 (MySQL) │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 路由守卫     │ │    │ │ 认证过滤器   │ │    │ │ 用户表       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 动态菜单     │ │◄──►│ │ 菜单服务     │ │◄──►│ │ 菜单表       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 权限控制     │ │    │ │ 权限服务     │ │    │ │ 权限表       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术架构分层

#### 前端架构 (Vue 3)
```
┌─────────────────────────────────────┐
│              视图层 (Views)           │
├─────────────────────────────────────┤
│            组件层 (Components)        │
├─────────────────────────────────────┤
│            状态管理 (Pinia)           │
├─────────────────────────────────────┤
│            路由管理 (Vue Router)       │
├─────────────────────────────────────┤
│            HTTP 客户端 (Axios)        │
└─────────────────────────────────────┘
```

#### 后端架构 (Spring Boot)
```
┌─────────────────────────────────────┐
│            控制层 (Controller)        │
├─────────────────────────────────────┤
│            服务层 (Service)           │
├─────────────────────────────────────┤
│            数据访问层 (Repository)     │
├─────────────────────────────────────┤
│            实体层 (Entity)            │
└─────────────────────────────────────┘
```

## 数据库设计

### 核心数据表结构

#### 1. 用户表 (sys_user)
```sql
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(50) COMMENT '真实姓名',
    nickname VARCHAR(50) COMMENT '昵称',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像URL',
    org_id BIGINT COMMENT '主要组织ID',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    remark VARCHAR(500) COMMENT '备注',
    last_login_time DATETIME COMMENT '最后登录时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    INDEX idx_username (username),
    INDEX idx_org_id (org_id),
    INDEX idx_status (status)
);
```

#### 2. 角色表 (sys_role)
```sql
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人'
);
```

#### 3. 权限表 (sys_permission)
```sql
CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(50) NOT NULL COMMENT '权限名称',
    permission_code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    resource_type TINYINT NOT NULL COMMENT '资源类型:1菜单,2按钮,3接口',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    path VARCHAR(255) COMMENT '路由路径',
    component VARCHAR(255) COMMENT '组件路径',
    icon VARCHAR(50) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4. 用户角色关联表 (sys_user_role)
```sql
CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id)
);
```

#### 5. 角色权限关联表 (sys_role_permission)
```sql
CREATE TABLE sys_role_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_permission (role_id, permission_id)
);
```

#### 6. 组织架构表 (sys_organization)
```sql
CREATE TABLE sys_organization (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '组织名称',
    type VARCHAR(20) NOT NULL DEFAULT 'department' COMMENT '组织类型:company公司,department部门',
    parent_id BIGINT DEFAULT 0 COMMENT '父组织ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    description VARCHAR(500) COMMENT '组织描述',
    status TINYINT DEFAULT 1 COMMENT '状态:0禁用,1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT COMMENT '创建人',
    update_by BIGINT COMMENT '更新人',
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
);
```

#### 7. 用户组织关联表 (sys_user_organization)
```sql
CREATE TABLE sys_user_organization (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    org_id BIGINT NOT NULL COMMENT '组织ID',
    is_primary TINYINT DEFAULT 1 COMMENT '是否主要组织:0否,1是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_org (user_id, org_id),
    INDEX idx_user_id (user_id),
    INDEX idx_org_id (org_id)
);
```

## 接口设计文档

### 基础配置
- **Base URL**: `http://localhost:8080/api`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 统一响应格式
```json
{
    "code": 200,
    "message": "success",
    "data": {},
    "timestamp": 1640995200000
}
```

### 1. 认证相关接口

#### 1.1 用户登录
- **URL**: `POST /auth/login`
- **描述**: 用户登录获取访问令牌
- **请求参数**:
```json
{
    "username": "admin",
    "password": "123456"
}
```
- **响应数据**:
```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 7200,
        "userInfo": {
            "id": 1,
            "username": "admin",
            "nickname": "管理员",
            "avatar": "https://example.com/avatar.jpg"
        }
    }
}
```

#### 1.2 刷新令牌
- **URL**: `POST /auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求参数**:
```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 1.3 用户登出
- **URL**: `POST /auth/logout`
- **描述**: 用户登出，使令牌失效
- **请求头**: `Authorization: Bearer {token}`

#### 1.4 获取用户信息
- **URL**: `GET /auth/userinfo`
- **描述**: 获取当前登录用户信息
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
    "code": 200,
    "data": {
        "id": 1,
        "username": "admin",
        "nickname": "管理员",
        "email": "admin@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "roles": ["ADMIN"],
        "permissions": ["user:list", "user:create", "user:update", "user:delete"]
    }
}
```

### 2. 菜单权限接口

#### 2.1 获取用户菜单
- **URL**: `GET /menu/user-menus`
- **描述**: 获取当前用户可访问的菜单列表
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
    "code": 200,
    "data": [
        {
            "id": 1,
            "name": "系统管理",
            "path": "/system",
            "component": "Layout",
            "icon": "system",
            "sort": 1,
            "children": [
                {
                    "id": 2,
                    "name": "用户管理",
                    "path": "/system/user",
                    "component": "system/user/index",
                    "icon": "user",
                    "sort": 1,
                    "meta": {
                        "title": "用户管理",
                        "icon": "user",
                        "permissions": ["user:list"]
                    }
                }
            ]
        }
    ]
}
```

#### 2.2 获取所有菜单
- **URL**: `GET /menu/list`
- **描述**: 获取系统所有菜单(管理员用)
- **请求参数**: 
  - `page`: 页码 (可选)
  - `size`: 每页大小 (可选)
  - `keyword`: 搜索关键词 (可选)

#### 2.3 创建菜单
- **URL**: `POST /menu`
- **描述**: 创建新菜单
- **请求参数**:
```json
{
    "name": "用户管理",
    "path": "/system/user",
    "component": "system/user/index",
    "icon": "user",
    "parentId": 1,
    "sort": 1,
    "resourceType": 1,
    "status": 1,
    "meta": {
        "title": "用户管理",
        "keepAlive": true,
        "permissions": ["user:list"]
    }
}
```

#### 2.4 更新菜单
- **URL**: `PUT /menu/{id}`
- **描述**: 更新指定菜单信息

#### 2.5 删除菜单
- **URL**: `DELETE /menu/{id}`
- **描述**: 删除指定菜单

### 3. 用户管理接口

#### 3.1 获取用户列表
- **URL**: `GET /user/list`
- **描述**: 分页获取用户列表，支持按组织架构筛选
- **请求参数**:
  - `page`: 页码 (默认1)
  - `size`: 每页大小 (默认10)
  - `username`: 用户名搜索 (可选)
  - `realName`: 真实姓名搜索 (可选)
  - `status`: 用户状态 (可选，0-禁用，1-启用)
  - `orgId`: 组织ID (可选，筛选指定部门用户)
- **响应数据**:
```json
{
    "code": 200,
    "data": {
        "total": 100,
        "pages": 10,
        "current": 1,
        "size": 10,
        "records": [
            {
                "id": 1,
                "username": "admin",
                "realName": "管理员",
                "email": "admin@example.com",
                "phone": "13800138000",
                "avatar": "https://example.com/avatar/1.jpg",
                "orgId": 1,
                "orgName": "总公司",
                "status": 1,
                "createTime": "2023-01-01 10:00:00",
                "updateTime": "2023-01-01 10:00:00",
                "remark": "系统管理员账户",
                "roles": [
                    {
                        "id": 1,
                        "name": "超级管理员",
                        "code": "ADMIN"
                    }
                ]
            }
        ]
    }
}
```

#### 3.2 获取用户详情
- **URL**: `GET /user/{id}`
- **描述**: 获取指定用户的详细信息
- **响应数据**:
```json
{
    "code": 200,
    "data": {
        "id": 1,
        "username": "admin",
        "realName": "管理员",
        "email": "admin@example.com",
        "phone": "13800138000",
        "avatar": "https://example.com/avatar/1.jpg",
        "orgId": 1,
        "orgName": "总公司",
        "status": 1,
        "createTime": "2023-01-01 10:00:00",
        "updateTime": "2023-01-01 10:00:00",
        "remark": "系统管理员账户",
        "roles": [
            {
                "id": 1,
                "name": "超级管理员",
                "code": "ADMIN"
            }
        ]
    }
}
```

#### 3.3 创建用户
- **URL**: `POST /user`
- **描述**: 创建新用户
- **请求参数**:
```json
{
    "username": "testuser",
    "password": "123456",
    "realName": "测试用户",
    "email": "test@example.com",
    "phone": "13800138001",
    "orgId": 2,
    "status": 1,
    "remark": "测试账户",
    "roleIds": [2, 3]
}
```
- **响应数据**:
```json
{
    "code": 200,
    "message": "用户创建成功",
    "data": {
        "id": 10,
        "username": "testuser",
        "realName": "测试用户"
    }
}
```

#### 3.4 更新用户信息
- **URL**: `PUT /user/{id}`
- **描述**: 更新用户基本信息
- **请求参数**:
```json
{
    "realName": "测试用户2",
    "email": "test2@example.com",
    "phone": "13800138002",
    "orgId": 3,
    "status": 1,
    "remark": "更新后的测试账户",
    "roleIds": [2]
}
```
- **响应数据**:
```json
{
    "code": 200,
    "message": "用户信息更新成功"
}
```

#### 3.5 删除用户
- **URL**: `DELETE /user/{id}`
- **描述**: 删除指定用户
- **响应数据**:
```json
{
    "code": 200,
    "message": "用户删除成功"
}
```

#### 3.6 批量删除用户
- **URL**: `DELETE /user/batch`
- **描述**: 批量删除用户
- **请求参数**:
```json
{
    "userIds": [10, 11, 12]
}
```
- **响应数据**:
```json
{
    "code": 200,
    "message": "批量删除成功",
    "data": {
        "successCount": 2,
        "failCount": 1,
        "failReasons": ["用户ID 12 不存在"]
    }
}
```

#### 3.7 更新用户状态
- **URL**: `PUT /user/{id}/status`
- **描述**: 启用或禁用用户
- **请求参数**:
```json
{
    "status": 0
}
```
- **响应数据**:
```json
{
    "code": 200,
    "message": "用户状态更新成功"
}
```

#### 3.8 重置用户密码
- **URL**: `PUT /user/{id}/reset-password`
- **描述**: 重置用户密码
- **请求参数**:
```json
{
    "newPassword": "123456"
}
```
- **响应数据**:
```json
{
    "code": 200,
    "message": "密码重置成功"
}
```

#### 3.9 分配用户角色
- **URL**: `PUT /user/{id}/roles`
- **描述**: 为用户分配角色
- **请求参数**:
```json
{
    "roleIds": [1, 2, 3]
}
```
- **响应数据**:
```json
{
    "code": 200,
    "message": "角色分配成功"
}
```

#### 3.10 上传用户头像
- **URL**: `POST /user/{id}/avatar`
- **描述**: 上传用户头像
- **请求类型**: `multipart/form-data`
- **请求参数**: 
  - `file`: 头像文件 (支持jpg, png, gif格式，最大2MB)
- **响应数据**:
```json
{
    "code": 200,
    "message": "头像上传成功",
    "data": {
        "avatarUrl": "https://example.com/avatar/user_1_20231201.jpg"
    }
}
```

#### 3.11 导出用户列表
- **URL**: `GET /user/export`
- **描述**: 导出用户列表为Excel文件
- **请求参数**:
  - `username`: 用户名搜索 (可选)
  - `realName`: 真实姓名搜索 (可选)
  - `status`: 用户状态 (可选)
  - `orgId`: 组织ID (可选)
- **响应**: Excel文件下载

#### 3.12 导入用户
- **URL**: `POST /user/import`
- **描述**: 批量导入用户
- **请求类型**: `multipart/form-data`
- **请求参数**:
  - `file`: Excel文件
- **响应数据**:
```json
{
    "code": 200,
    "message": "用户导入完成",
    "data": {
        "totalCount": 100,
        "successCount": 95,
        "failCount": 5,
        "failDetails": [
            {
                "row": 10,
                "username": "test1",
                "reason": "用户名已存在"
            }
        ]
    }
}
```

### 4. 组织架构管理接口

#### 4.1 获取组织树
- **URL**: `GET /org/tree`
- **描述**: 获取完整的组织架构树
- **响应数据**:
```json
{
    "code": 200,
    "data": [
        {
            "id": 1,
            "name": "总公司",
            "type": "company",
            "parentId": 0,
            "sort": 1,
            "status": 1,
            "userCount": 25,
            "children": [
                {
                    "id": 2,
                    "name": "技术部",
                    "type": "department",
                    "parentId": 1,
                    "sort": 1,
                    "status": 1,
                    "userCount": 12,
                    "children": [
                        {
                            "id": 3,
                            "name": "前端组",
                            "type": "department",
                            "parentId": 2,
                            "sort": 1,
                            "status": 1,
                            "userCount": 6
                        }
                    ]
                }
            ]
        }
    ]
}
```

#### 4.2 创建组织
- **URL**: `POST /org`
- **描述**: 创建新的组织/部门
- **请求参数**:
```json
{
    "name": "新部门",
    "type": "department",
    "parentId": 1,
    "sort": 10,
    "description": "部门描述"
}
```

#### 4.3 更新组织
- **URL**: `PUT /org/{id}`
- **描述**: 更新组织信息

#### 4.4 删除组织
- **URL**: `DELETE /org/{id}`
- **描述**: 删除组织（需要先转移或删除下属用户）

#### 4.5 移动组织
- **URL**: `PUT /org/{id}/move`
- **描述**: 移动组织到新的父级
- **请求参数**:
```json
{
    "newParentId": 2,
    "newSort": 5
}
```

### 4. 角色管理接口

#### 4.1 获取角色列表
- **URL**: `GET /role/list`
- **描述**: 获取角色列表
- **响应数据**:
```json
{
    "code": 200,
    "data": [
        {
            "id": 1,
            "roleName": "超级管理员",
            "roleCode": "ADMIN",
            "description": "系统超级管理员",
            "status": 1,
            "createTime": "2023-01-01 10:00:00",
            "permissions": [
                {
                    "id": 1,
                    "permissionName": "用户管理",
                    "permissionCode": "user:list"
                }
            ]
        }
    ]
}
```

#### 4.2 创建角色
- **URL**: `POST /role`
- **描述**: 创建新角色
- **请求参数**:
```json
{
    "roleName": "普通用户",
    "roleCode": "USER",
    "description": "普通用户角色",
    "permissionIds": [1, 2, 3]
}
```

#### 4.3 更新角色
- **URL**: `PUT /role/{id}`
- **描述**: 更新角色信息

#### 4.4 删除角色
- **URL**: `DELETE /role/{id}`
- **描述**: 删除角色

#### 4.5 分配权限
- **URL**: `PUT /role/{id}/permissions`
- **描述**: 为角色分配权限
- **请求参数**:
```json
{
    "permissionIds": [1, 2, 3, 4]
}
```

### 5. 权限管理接口

#### 5.1 获取权限树
- **URL**: `GET /permission/tree`
- **描述**: 获取权限树结构
- **响应数据**:
```json
{
    "code": 200,
    "data": [
        {
            "id": 1,
            "permissionName": "系统管理",
            "permissionCode": "system",
            "resourceType": 1,
            "parentId": 0,
            "children": [
                {
                    "id": 2,
                    "permissionName": "用户管理",
                    "permissionCode": "user:list",
                    "resourceType": 1,
                    "parentId": 1
                }
            ]
        }
    ]
}
```

#### 5.2 创建权限
- **URL**: `POST /permission`
- **描述**: 创建新权限

#### 5.3 更新权限
- **URL**: `PUT /permission/{id}`
- **描述**: 更新权限信息

#### 5.4 删除权限
- **URL**: `DELETE /permission/{id}`
- **描述**: 删除权限

## 前端组件设计

### 1. 路由配置 (router/index.ts)
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 静态路由
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  }
]

// 动态路由
export const asyncRoutes = []

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (!userStore.hasRoutes) {
        try {
          await userStore.generateRoutes()
          next({ ...to, replace: true })
        } catch (error) {
          userStore.logout()
          next('/login')
        }
      } else {
        next()
      }
    }
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
```

### 2. 用户状态管理 (stores/user.ts)
```typescript
import { defineStore } from 'pinia'
import { login, getUserInfo, getUserMenus } from '@/api/auth'
import { generateRoutes } from '@/utils/route'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    roles: [],
    permissions: [],
    routes: [],
    hasRoutes: false
  }),

  actions: {
    async login(loginForm) {
      const { data } = await login(loginForm)
      this.token = data.token
      localStorage.setItem('token', data.token)
      return data
    },

    async getUserInfo() {
      const { data } = await getUserInfo()
      this.userInfo = data
      this.roles = data.roles
      this.permissions = data.permissions
      return data
    },

    async generateRoutes() {
      const { data } = await getUserMenus()
      const routes = generateRoutes(data)
      
      routes.forEach(route => {
        router.addRoute(route)
      })
      
      this.routes = routes
      this.hasRoutes = true
      return routes
    },

    logout() {
      this.token = ''
      this.userInfo = null
      this.roles = []
      this.permissions = []
      this.routes = []
      this.hasRoutes = false
      localStorage.removeItem('token')
      router.push('/login')
    }
  }
})
```

### 3. 动态路由生成工具 (utils/route.ts)
```typescript
import { RouteRecordRaw } from 'vue-router'

const modules = import.meta.glob('../views/**/*.vue')

export function generateRoutes(menus: any[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  menus.forEach(menu => {
    const route: RouteRecordRaw = {
      path: menu.path,
      name: menu.name,
      component: loadComponent(menu.component),
      meta: {
        title: menu.name,
        icon: menu.icon,
        permissions: menu.meta?.permissions || []
      }
    }

    if (menu.children && menu.children.length > 0) {
      route.children = generateRoutes(menu.children)
    }

    routes.push(route)
  })

  return routes
}

function loadComponent(component: string) {
  if (component === 'Layout') {
    return () => import('@/layout/index.vue')
  }
  
  const componentPath = `../views/${component}.vue`
  return modules[componentPath] || (() => import('@/views/error/404.vue'))
}
```

## 错误处理和状态码

### HTTP 状态码规范
- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权，需要登录
- `403`: 禁止访问，权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 业务状态码规范
- `200`: 操作成功
- `400`: 请求参数错误
- `401`: 未登录或登录过期
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 系统错误

## 安全设计

### 1. 认证安全
- JWT 令牌过期时间设置为 2 小时
- 提供刷新令牌机制，有效期 7 天
- 密码使用 BCrypt 加密存储
- 登录失败次数限制，超过 5 次锁定账户

### 2. 权限控制
- 基于 RBAC 模型的权限控制
- 前端路由守卫 + 后端接口权限验证
- 菜单和按钮级别的权限控制
- API 接口统一权限拦截

### 3. 数据安全
- 敏感数据传输使用 HTTPS
- SQL 注入防护
- XSS 攻击防护
- CSRF 攻击防护

这个设计文档涵盖了系统的核心架构、数据库设计、完整的 API 接口文档和前端组件设计。所有接口都包含了详细的 URL、参数和响应格式，可以直接用于开发实现。