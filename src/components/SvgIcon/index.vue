<template>
	<i class="svg-icon-container" :style="containerStyle" v-bind="$attrs">

		<svg v-if="!isExternal" aria-hidden="true" class="svg-content">
			<use :xlink:href="symbolId" />
		</svg>

		<Icon v-else :icon="name" class="svg-content" />

	</i>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
	name: {
		type: String,
		required: true
	},
	size: {
		type: [Number, String],
		default: 18
	},
	color: {
		type: String,
		default: 'currentColor'
	}
});

// 判断是否是RemixIcon
const isExternal = computed(() => props.name.includes(':'));
const symbolId = computed(() => `#icon-${props.name}`);
const containerStyle = computed(() => {
	const s = isNaN(Number(props.size)) ? props.size : `${props.size}px`;
	return {
		width: s,
		height: s,
		color: props.color,
	};
});
</script>

<style lang="scss" scoped>
.svg-icon-container {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	position: relative;
	vertical-align: middle;
	fill: currentColor;
	/* 确保本地 SVG 继承颜色 */
	stroke: none;
}

.svg-content {
	width: 100%;
	height: 100%;
	overflow: hidden;
}

/* 如果是 Iconify 组件，确保它填满容器 */
:deep(svg) {
	width: 100%;
	height: 100%;
}
</style>
