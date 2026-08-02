<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">富文本编辑器</span>
          <el-button type="primary" @click="handleSave">保存内容</el-button>
        </div>
      </template>

      <!-- 编辑器工具栏 -->
      <div class="editor-toolbar">
        <el-button-group>
          <el-button size="small"> <SvgIcon name="ri:bold" size="14" style="margin-right: 4px" />加粗 </el-button>
          <el-button size="small"> <SvgIcon name="ri:italic" size="14" style="margin-right: 4px" />斜体 </el-button>
          <el-button size="small"> <SvgIcon name="ri:underline" size="14" style="margin-right: 4px" />下划线 </el-button>
        </el-button-group>
        <el-divider direction="vertical" />
        <el-button-group>
          <el-button size="small"> <SvgIcon name="ri:align-left" size="14" style="margin-right: 4px" />左对齐 </el-button>
          <el-button size="small"> <SvgIcon name="ri:align-center" size="14" style="margin-right: 4px" />居中 </el-button>
          <el-button size="small"> <SvgIcon name="ri:align-right" size="14" style="margin-right: 4px" />右对齐 </el-button>
        </el-button-group>
        <el-divider direction="vertical" />
        <el-button-group>
          <el-button size="small"> <SvgIcon name="ri:image-line" size="14" style="margin-right: 4px" />图片 </el-button>
          <el-button size="small"> <SvgIcon name="ri:link" size="14" style="margin-right: 4px" />链接 </el-button>
        </el-button-group>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-wrapper">
        <textarea v-model="content" class="editor-textarea" placeholder="请输入内容..."></textarea>
      </div>

      <!-- 预览区域 -->
      <el-divider content-position="left">内容预览</el-divider>
      <div class="preview-area" v-html="renderContent"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import SvgIcon from "@/components/svg-icon/index.vue";

const content = ref(`<h2>欢迎使用富文本编辑器</h2>
<p>这是一个简单的富文本编辑器示例。你可以在这里输入和编辑内容。</p>
<ul>
  <li>支持基本的文本格式化</li>
  <li>支持图片和链接插入</li>
  <li>支持内容预览</li>
</ul>
<p><strong>提示：</strong>实际项目中建议使用成熟的富文本编辑器组件，如 Quill、TinyMCE 或 WangEditor。</p>`);

const renderContent = computed(() => content.value);

const handleSave = () => {
  ElMessage.success("内容已保存");
};
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: 600;
  }
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.editor-wrapper {
  border: 1px solid var(--el-border-color);
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}

.editor-textarea {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);

  &:focus {
    background: var(--el-fill-color-light);
  }
}

.preview-area {
  padding: 16px;
  min-height: 100px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  line-height: 1.8;

  :deep(h2) {
    margin-top: 0;
    color: var(--el-text-color-primary);
  }

  :deep(ul) {
    padding-left: 20px;
  }

  :deep(li) {
    margin: 8px 0;
  }

  :deep(strong) {
    color: var(--el-color-primary);
  }
}
</style>
