/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明模块路径别名
declare module '@/*' {
  const value: any
  export default value
}

// Element Plus 国际化模块声明
declare module 'element-plus/locale/zh-cn' {
  const locale: any
  export default locale
}

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const locale: any
  export default locale
}
