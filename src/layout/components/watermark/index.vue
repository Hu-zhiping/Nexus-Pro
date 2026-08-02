<template>
  <div class="watermark-container" :style="containerStyle"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";

const props = defineProps({
  text: { type: String, default: "Watermark" },
  fontSize: { type: Number, default: 14 },
  fontFamily: { type: String, default: "Microsoft YaHei" },
  color: { type: String, default: "rgba(0, 0, 0, 0.08)" },
  rotate: { type: Number, default: -30 },
  gapX: { type: Number, default: 200 },
  gapY: { type: Number, default: 200 },
});

const watermarkUrl = ref("");

const containerStyle = computed(() => ({
  pointerEvents: "none" as const,
  position: "fixed" as const,
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  zIndex: "9999",
  overflow: "hidden" as const,
  backgroundImage: watermarkUrl.value ? `url(${watermarkUrl.value})` : "none",
  backgroundRepeat: "repeat",
}));

const generateWatermark = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const text = props.text;
  ctx.font = `${props.fontSize}px ${props.fontFamily}`;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = props.fontSize;
  const angle = (Math.abs(props.rotate) * Math.PI) / 180;
  const canvasWidth = Math.ceil(textWidth * Math.cos(angle) + textHeight * Math.sin(angle)) + props.gapX;
  const canvasHeight = Math.ceil(textWidth * Math.sin(angle) + textHeight * Math.cos(angle)) + props.gapY;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx.font = `${props.fontSize}px ${props.fontFamily}`;
  ctx.fillStyle = props.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((props.rotate * Math.PI) / 180);
  ctx.fillText(text, 0, 0);
  ctx.restore();
  watermarkUrl.value = canvas.toDataURL();
};

onMounted(() => {
  generateWatermark();
});

watch(
  () => [props.text, props.fontSize, props.color, props.rotate],
  () => generateWatermark(),
  { deep: true },
);

onBeforeUnmount(() => {
  watermarkUrl.value = "";
});
</script>

<style scoped>
.watermark-container {
  pointer-events: none;
}
</style>
