/**
 * 生产构建（demo 模式）的 mock 注入入口。
 *
 * 仅在 `npm run build:demo`（--mode demo）时由 vite-plugin-mock 注入打包产物，
 * 使构建后的页面可以脱离后端独立演示；常规 `npm run build` 不包含本文件。
 */
import { createProdMockServer } from "vite-plugin-mock/es/createProdMockServer";

import mockModule from "../mock/index";

createProdMockServer(mockModule);
