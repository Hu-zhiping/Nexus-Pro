# Nexus-Pro Design System

版本：1.0.0

适用于：

- Vue 3
- TypeScript
- Vite 8
- Element Plus
- Tailwind CSS 4
- Pinia
- Vue Router
- Enterprise Admin Dashboard

> 本文档是项目唯一 UI 设计规范来源（Single Source of Truth）。
>
> 所有页面、组件、样式、CSS Token 必须遵循此规范。
>
> AI 生成代码也必须遵循此规范。

---

# 1. 设计原则

## 1.1 产品定位

Nexus-Pro 是企业级后台管理系统。

设计目标：

- 高效
- 清晰
- 稳定
- 专业
- 可扩展
- 可维护

避免：

- 花哨动画 / 花哨视觉效果
- 高饱和颜色
- 过度装饰 / 过度动画
- 不必要渐变
- 随机布局

---

# 2. Design Token 规则

所有 UI 样式必须优先使用 Design Token，禁止硬编码。

## 2.1 核心原则

所有 CSS Token 必须：

1. 优先复用已有 Token
2. 禁止重复创建
3. 禁止同义命名
4. 禁止组件污染全局变量

禁止：

```css
--user-card-background
--table-header-color
--login-page-bg
```

正确：

```css
--bg-card
--text-primary
--border-color
```

## 2.2 命名约定

统一使用 `--category-name` 格式。

例如：

```css
--color-primary
--bg-page
--text-primary
--border-color
--radius-md
--shadow-sm
```

禁止：

```css
--primaryColor
--pageBg
--customBlue
```

## 2.3 颜色系统

### 品牌色

允许：

```css
--color-primary
--color-success
--color-warning
--color-danger
--color-info
```

用途：

- 主按钮
- 激活状态
- 链接
- 选中状态

禁止：

```css
--blue
--main-blue
--theme-blue
color: #165dff;
```

### 文本颜色

层级：

| Token | 用途 |
| ----- | ---- |
| `--text-primary` | 页面标题、重要数据（最高优先级） |
| `--text-regular` | 表格内容、表单文字（普通内容） |
| `--text-secondary` | 描述、提示（辅助信息） |
| `--text-placeholder` | 占位文字 |
| `--text-disabled` | 禁用状态 |

禁止：

```css
--title-color
--desc-color
--content-color
```

### 背景颜色

统一：

```css
--bg-page     /* 页面背景 */
--bg-card     /* 卡片背景 */
--bg-overlay  /* 浮层背景 */
--bg-hover    /* 悬停背景 */
--bg-active   /* 激活背景 */
--fill-light  /* 辅助区域 */
```

禁止：

```css
--panel-bg
--box-background
--wrapper-bg
background: white;
```

### 边框

统一：

```css
--border-color    /* 默认边框 */
--border-light    /* 弱边框 */
--border-lighter  /* 更弱边框 */
```

禁止：

```css
--line-color
--divider-color
border: 1px solid #ddd;
```

## 2.4 尺寸系统

所有尺寸基于 4px 基础单位。

| Token | 值    |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |

禁止：

```css
--button-height
--table-height
gap: 17px;
```

## 2.5 圆角规范

统一：

```css
--radius-sm
--radius-md
--radius-lg
--radius-full
```

| 场景   | Token         | 值    |
| ------ | ------------- | ----- |
| 按钮   | `--radius-sm` | 6px   |
| 输入框 | `--radius-sm` | 6px   |
| 卡片   | `--radius-md` | 8px   |
| 弹窗   | `--radius-lg` | 12px  |

禁止：

```css
--card-radius
--dialog-radius
border-radius: 13px;
```

## 2.6 阴影规范

统一：

```css
--shadow-sm  /* 小阴影 */
--shadow     /* 默认 */
--shadow-md  /* 浮层 */
--shadow-lg  /* 大浮层 */
```

禁止：

```css
--popup-shadow
--card-shadow
box-shadow: 0 0 20px red;
```

## 2.7 动效规范

| Token             | 值     |
| ----------------- | ------ |
| `--transition-fast` | 150ms  |
| `--transition-base` | 200ms  |
| `--transition-slow` | 300ms  |

禁止超过 500ms。

## 2.8 布局 Token

公共布局允许：

```css
--sidebar-width
--header-height
--page-padding
--content-gap
```

禁止：

```css
--user-page-width
--login-container-width
```

## 2.9 Token 新增规则

新增 Token 前必须判断：是否多个组件使用？

- **否**：使用 scoped CSS

  例如：

  ```css
  .card-title {
    margin-bottom: 12px;
  }
  ```

  不要：

  ```css
  --card-title-gap: 12px;
  ```

- **是**（多个地方使用）：允许新增

  例如：

  ```css
  --spacing-md: 16px;
  ```

---

# 3. 布局规范

## 3.1 页面结构

统一：

```
Page
 │
 ├── Page Header
 │
 ├── Toolbar
 │
 ├── Content Card
 │
 └── Pagination
```

## 3.2 页面 padding

统一：`20px`

禁止：`13px`、`17px`、`23px`

---

# 4. 间距规则

所有间距必须使用 4px 倍数。

允许：4、8、12、16、20、24、32

禁止：7px、13px、19px

推荐：

```css
gap: 16px;
```

---

# 5. 排版规范

字体：系统字体

```css
-apple-system
BlinkMacSystemFont
"Segoe UI"
```

| 场景       | 字号   | 字重   |
| ---------- | ------ | ------ |
| 页面标题   | 20px   | 600    |
| 模块标题   | 16px   | 600    |
| 正文       | 14px   | 400    |
| 辅助       | 12px   | 400    |

---

# 6. 组件规范

## 6.1 Button

统一使用 Element Plus Button。

主要操作：

```vue
<el-button type="primary">主要操作</el-button>
```

危险操作：

```vue
<el-button type="danger">危险操作</el-button>
```

普通：

```vue
<el-button>普通操作</el-button>
```

禁止自行创建 `<button></button>`。

## 6.2 Form

统一使用 Element Plus Form。

- 默认 `label-width: 100px`
- 字段间距：18px

禁止多个输入框无间距。

## 6.3 Table

统一使用 Element Plus Table。

要求：

- 操作列固定右侧
- 表头清晰
- 空状态统一
- 加载状态统一

操作按钮推荐：

```vue
<el-button link>操作</el-button>
```

禁止大量：

```vue
<el-button size="small">操作</el-button>
```

## 6.4 Card

页面模块必须使用 Card。

结构：

```
el-card
 ├── header
 ├── content
 └── footer
```

禁止大量裸 div 模拟卡片。

## 6.5 Dialog

统一使用 Element Plus Dialog。

- 默认宽度：500px
- 大型弹窗：800px

禁止随机宽度（如 730px）。

## 6.6 Icon

统一使用 Iconify：

```vue
<Icon icon="ri:user-line" />
```

禁止随意引入多个 icon 库。

## 6.7 Loading

统一使用 Element Plus Loading。

禁止自定义 loading.gif。

---

# 7. CSS 规则

## 7.1 禁止硬编码

禁止：

```css
color: #333;
background: white;
border: 1px solid #ddd;
```

必须：

```css
color: var(--text-primary);
background: var(--bg-card);
border-color: var(--border-color);
```

## 7.2 禁止 !important

除非覆盖第三方库。

## 7.3 禁止大量 absolute

不要用 `position: absolute` 做普通布局。

优先：

```css
flex
grid
gap
```

---

# 8. Dark Mode

所有组件必须支持暗色模式。

禁止：

```css
background: white;
color: black;
```

必须：

```css
background: var(--bg-card);
color: var(--text-primary);
```

---

# 9. Animation

动画统一：

| 场景 | 时长   |
| ---- | ------ |
| 快速 | 150ms  |
| 普通 | 200ms  |
| 慢   | 300ms  |

禁止超过 500ms。

---

# 10. Responsive

后台系统优先桌面。

断点：1280 / 1024 / 768

禁止大量移动端特殊布局。

---

# 11. 页面模板

## 11.1 标准列表页

```
Page
 ├── Search Form
 ├── Toolbar
 ├── Table Card
 └── Pagination
```

## 11.2 标准详情页

```
Page
 ├── Header Card
 ├── Information Card
 └── Action Area
```

---

# 12. AI 生成规则

AI 生成页面必须：

- ✅ 使用已有变量
- ✅ 使用 Element Plus
- ✅ 使用 Tailwind spacing
- ✅ 保持暗色兼容
- ✅ 保持组件复用

AI 生成代码必须：

- ✅ 阅读已有组件
- ✅ 复用已有 Token
- ✅ 使用 Element Plus
- ✅ 使用 Tailwind spacing
- ✅ 保持 Dark Mode

AI 不允许创建：

```css
--custom-*
--temp-*
--page-*
--component-*
--random-*
```

禁止：

- 新颜色
- 新字体
- 新间距体系
- 新圆角体系

---

# 13. Code Review 标准

提交代码必须满足：

- 无硬编码颜色
- 无重复样式
- 无重复 Token
- 无 !important
- 无随机尺寸
- 无未使用变量
- 支持 Dark Mode
- ESLint 通过
- Prettier 通过
