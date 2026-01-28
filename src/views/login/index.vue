<template>
	<el-row class="login-container">
		<el-col :lg="16" :md="12" :sm="24" class="login-section--left">
			<div class="login-section-content">
				<!-- 左侧内容 -->
				<p>欢迎来到登录页面</p>
			</div>
		</el-col>
		<el-col :lg="8" :md="12" :sm="24" class="login-section--right">
			<LoginForm class="login-form" />
		</el-col>
	</el-row>
</template>

<script lang="ts" setup>
import LoginForm from "@/views/login/components/LoginForm.vue";
</script>

<style scoped lang="scss">
.login-container {
	position: relative;
	height: 100vh;

	.login-section--left {
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
		color: white; // 设置文本颜色为白色以提高可读性
		text-align: center; // 使文本居中
	}

	.login-section--right {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
	}

	.login-form {
		max-width: 400px; // 限制表单的最大宽度
		width: 100%; // 使表单宽度自适应
	}
}
</style>
