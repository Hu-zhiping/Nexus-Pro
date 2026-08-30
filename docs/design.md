# Nexus AI Admin Dashboard 设计规范

版本：v1.0.0

技术栈：
Vue3 + TypeScript + Element Plus + SCSS

设计目标：

- 企业级 SaaS 后台
- AI 科技感
- 简洁高效
- 数据可视化
- 统一 Design Token

---

# 一、设计原则

## 视觉原则

- 大圆角
- 浅色背景
- 卡片化布局
- 轻量阴影
- 高信息密度
- 清晰层级


## 栅格原则

采用 8px Grid：

4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64

---

# 二、CSS Design Token

## 1. Color Token

```scss
:root {

  /* Brand */

  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-light: #DBEAFE;


  /* Status */

  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;


  /* Background */

  --color-bg-page: #F8FAFC;
  --color-bg-card: #FFFFFF;
  --color-bg-overlay: rgba(15,23,42,.4);


  /* Border */

  --color-border: #E2E8F0;
  --color-border-light: #F1F5F9;


  /* Text */

  --color-text-primary: #0F172A;
  --color-text-main: #334155;
  --color-text-secondary: #64748B;
  --color-text-placeholder: #94A3B8;
  --color-text-disabled: #CBD5E1;

}
```

---

# 三、Typography Token

字体：

```scss
--font-family:
"Inter",
"PingFang SC",
"Microsoft YaHei",
sans-serif;
```

字号：

```scss
:root {

--font-size-xs:12px;

--font-size-sm:14px;

--font-size-md:16px;

--font-size-lg:18px;

--font-size-xl:24px;

--font-size-xxl:32px;

}
```

字重：

```scss
:root {

--font-weight-normal:400;

--font-weight-medium:500;

--font-weight-semibold:600;

--font-weight-bold:700;

}
```

---

# 四、Spacing Token

```scss
:root {

--space-1:4px;

--space-2:8px;

--space-3:12px;

--space-4:16px;

--space-5:20px;

--space-6:24px;

--space-8:32px;

--space-10:40px;

--space-12:48px;

--space-16:64px;

}
```

---

# 五、Radius Token

```scss
:root {

--radius-sm:8px;

--radius-md:10px;

--radius-lg:16px;

--radius-xl:20px;

--radius-full:999px;

}
```

使用规范：

|组件|圆角|
|-|-|
|页面卡片|20px|
|Dashboard 卡片|16px|
|按钮|12px|
|输入框|10px|
|标签|8px|
|头像|999px|

---

# 六、Shadow Token

```scss
:root {

--shadow-sm:
0 1px 3px rgba(15,23,42,.06);


--shadow-card:
0 4px 20px rgba(15,23,42,.06);


--shadow-hover:
0 8px 30px rgba(15,23,42,.10);


--shadow-lg:
0 12px 40px rgba(15,23,42,.12);

}
```

---

# 七、Layout Token

```scss
:root {

--layout-sidebar-width:240px;

--layout-header-height:64px;

--layout-content-padding:24px;

}
```

---

# 八、整体布局

设计尺寸：

1440 × 900px


结构：

```
+------------------------------------------------+
| Header 64px                                    |
+------------+-----------------------------------+
| Sidebar    | Content                           |
| 240px      | Padding 24px                      |
+------------+-----------------------------------+
```

---

# 九、Sidebar规范

宽度：

240px

背景：

var(--color-bg-card)


菜单：

高度：

40px

圆角：

10px

间距：

8px


激活状态：

background:

#EEF2FF

color:

var(--color-primary)

---

# 十、Header规范

高度：

64px


Padding：

24px


搜索框：

width:

280px


height:

36px


radius:

18px

---

# 十一、Dashboard 页面规范

## KPI 卡片

数量：

5个


布局：

repeat(5,1fr)


间距：

16px


尺寸：

260 × 128px


样式：

```scss
background:
var(--color-bg-card);

border-radius:
var(--radius-lg);

padding:
var(--space-6);

box-shadow:
var(--shadow-card);
```

---

# 十二、图表区域

布局：

8 : 4


卡片高度：

340px


Padding：

24px


Radius：

20px

---

# 十三、AI分析组件


## AI Scan Card


包含：

- 设备名称
- 扫描状态
- 图片数量
- AI分析进度


Progress:

height:

6px


radius:

6px

---

# 十四、Table规范


表头高度：

56px


行高度：

56px


字体：

14px


内容：

- 用户
- 设备
- 扫描时间
- 图片数量
- 清理建议
- 操作

---

# 十五、Button规范


Primary Button:

height:

40px


padding:

0 16px


radius:

12px


font-size:

14px


font-weight:

600


background:

var(--color-primary)


---

# 十六、Card规范


```scss
.nexus-card {

background:
var(--color-bg-card);

padding:
var(--space-6);

border-radius:
var(--radius-lg);

box-shadow:
var(--shadow-card);

}
```

---

# 十七、动画规范


页面进入：

300ms ease-out


效果：

opacity

translateY(10px)


卡片 Hover：

200ms


效果：

translateY(-2px)

---

# 十八、组件命名规范


Figma:

Nexus/Button

Nexus/Card

Nexus/Table

Nexus/Header

Nexus/Sidebar

Nexus/AI/ScanCard


Vue:

```
components/

NexusButton.vue

NexusCard.vue

NexusTable.vue

AiScanCard.vue
```

---

# 十九、开发规范


所有组件必须支持：

- Default
- Hover
- Active
- Disabled
- Loading


---

# End

Nexus AI Admin Dashboard

Design System v1.0
