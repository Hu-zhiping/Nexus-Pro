<template>
  <div class="watermark-container" :style="containerStyle">
    <canvas ref="canvasRef" class="watermark-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: 'Watermark',
  },
  fontSize: {
    type: Number,
    default: 14,
  },
  fontFamily: {
    type: String,
    default: 'Microsoft YaHei',
  },
  color: {
    type: String,
    default: 'rgba(0, 0, 0, 0.08)',
  },
  rotate: {
    type: Number,
    default: -30,
  },
  gapX: {
    type: Number,
    default: 200,
  },
  gapY: {
    type: Number,
    default: 200,
  },
});

const canvasRef = ref<HTMLCanvasElement>();

const containerStyle = computed(() => ({
  pointerEvents: 'none' as const,
  position: 'fixed' as const,
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  zIndex: '9999',
  overflow: 'hidden' as const,
}));

// 生成水印
const generateWatermark = () => {
  if (!canvasRef.value) return;
  
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 计算单个水印的尺寸
  const text = props.text;
  ctx.font = `${props.fontSize}px ${props.fontFamily}`;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = props.fontSize;
  
  // 计算画布尺寸（考虑旋转）
  const angle = (Math.abs(props.rotate) * Math.PI) / 180;
  const canvasWidth = Math.ceil(textWidth * Math.cos(angle) + textHeight * Math.sin(angle)) + props.gapX;
  const canvasHeight = Math.ceil(textWidth * Math.sin(angle) + textHeight * Math.cos(angle)) + props.gapY;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 绘制水印
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = `${props.fontSize}px ${props.fontFamily}`;
  ctx.fillStyle = props.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((props.rotate * Math.PI) / 180);
  ctx.fillText(text, 0, 0);
  ctx.restore();
};

onMounted(() => {
  generateWatermark();
});

watch(() => [props.text, props.fontSize, props.color, props.rotate], () => {
  generateWatermark();
}, { deep: true });
</script>

<style scoped>
.watermark-container {
  pointer-events: none;
}

.watermark-canvas {
  width: 100%;
  height: 100%;
}
</style>
