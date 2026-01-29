<template>
	<el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="top" :show-message="true"
		class="login-form">
		<el-row :gutter="20">
			<el-col :span="24">
				<el-form-item>
					<h2>登录</h2>
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="loginForm.username" type="text" size="large" placeholder="请输入用户名" />
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item label="密码" prop="password">
					<el-input v-model="loginForm.password" type="password" size="large" :show-password="true"
						placeholder="请输入密码" />
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item>
					<div class="remember">
						<el-checkbox label="记住我" size="large" />
						<el-link type="primary" :underline="false">忘记密码</el-link>
					</div>
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item>
					<el-button type="primary" style="width: 100%" size="large" :loading="loading"
						@click="submitForm(loginFormRef)">
						登录
					</el-button>
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item>
					<el-button style="width: 100%" size="large" :loading="false">注册</el-button>
				</el-form-item>
			</el-col>

			<el-divider> 其它登录方式 </el-divider>
			<el-col :span="24">
				<el-form-item>
					<div class="other">
						<el-icon :size="30" color="rgb(153, 153, 153)">
							<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em"
								height="1em" viewBox="0 0 1024 1024" data-icon="ant-design:github-filled"
								class="iconify iconify--ant-design">
								<path fill="currentColor"
									d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5C64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9c26.4 39.1 77.9 32.5 104 26c5.7-23.5 17.9-44.5 34.7-60.8c-140.6-25.2-199.2-111-199.2-213c0-49.5 16.3-95 48.3-131.7c-20.4-60.5 1.9-112.3 4.9-120c58.1-5.2 118.5 41.6 123.2 45.3c33-8.9 70.7-13.6 112.9-13.6c42.4 0 80.2 4.9 113.5 13.9c11.3-8.6 67.3-48.8 121.3-43.9c2.9 7.7 24.7 58.3 5.5 118c32.4 36.8 48.9 82.7 48.9 132.3c0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9c177.1-59.7 304.6-227 304.6-424.1c0-247.2-200.4-447.3-447.5-447.3z">
								</path>
							</svg>
						</el-icon>
						<el-icon :size="30" color="rgb(153, 153, 153)">
							<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em"
								height="1em" viewBox="0 0 1024 1024" data-icon="ant-design:wechat-filled"
								class="iconify iconify--ant-design">
								<path fill="currentColor"
									d="M690.1 377.4c5.9 0 11.8.2 17.6.5c-24.4-128.7-158.3-227.1-319.9-227.1C209 150.8 64 271.4 64 420.2c0 81.1 43.6 154.2 111.9 203.6a21.5 21.5 0 0 1 9.1 17.6c0 2.4-.5 4.6-1.1 6.9c-5.5 20.3-14.2 52.8-14.6 54.3c-.7 2.6-1.7 5.2-1.7 7.9c0 5.9 4.8 10.8 10.8 10.8c2.3 0 4.2-.9 6.2-2l70.9-40.9c5.3-3.1 11-5 17.2-5c3.2 0 6.4.5 9.5 1.4c33.1 9.5 68.8 14.8 105.7 14.8c6 0 11.9-.1 17.8-.4c-7.1-21-10.9-43.1-10.9-66c0-135.8 132.2-245.8 295.3-245.8zm-194.3-86.5c23.8 0 43.2 19.3 43.2 43.1s-19.3 43.1-43.2 43.1c-23.8 0-43.2-19.3-43.2-43.1s19.4-43.1 43.2-43.1zm-215.9 86.2c-23.8 0-43.2-19.3-43.2-43.1s19.3-43.1 43.2-43.1s43.2 19.3 43.2 43.1s-19.4 43.1-43.2 43.1zm586.8 415.6c56.9-41.2 93.2-102 93.2-169.7c0-124-120.8-224.5-269.9-224.5c-149 0-269.9 100.5-269.9 224.5S540.9 847.5 690 847.5c30.8 0 60.6-4.4 88.1-12.3c2.6-.8 5.2-1.2 7.9-1.2c5.2 0 9.9 1.6 14.3 4.1l59.1 34c1.7 1 3.3 1.7 5.2 1.7a9 9 0 0 0 6.4-2.6a9 9 0 0 0 2.6-6.4c0-2.2-.9-4.4-1.4-6.6c-.3-1.2-7.6-28.3-12.2-45.3c-.5-1.9-.9-3.8-.9-5.7c.1-5.9 3.1-11.2 7.6-14.5zM600.2 587.2c-19.9 0-36-16.1-36-35.9c0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9c0 19.8-16.2 35.9-36 35.9zm179.9 0c-19.9 0-36-16.1-36-35.9c0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9a36.08 36.08 0 0 1-36 35.9z">
								</path>
							</svg>
						</el-icon>
						<el-icon :size="30" color="rgb(153, 153, 153)">
							<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em"
								height="1em" viewBox="0 0 1024 1024" data-icon="ant-design:alipay-circle-filled"
								class="iconify iconify--ant-design">
								<path fill="currentColor"
									d="M308.6 545.7c-19.8 2-57.1 10.7-77.4 28.6c-61 53-24.5 150 99 150c71.8 0 143.5-45.7 199.8-119c-80.2-38.9-148.1-66.8-221.4-59.6zm460.5 67c100.1 33.4 154.7 43 166.7 44.8A445.9 445.9 0 0 0 960 512c0-247.4-200.6-448-448-448S64 264.6 64 512s200.6 448 448 448c155.9 0 293.2-79.7 373.5-200.5c-75.6-29.8-213.6-85-286.8-120.1c-69.9 85.7-160.1 137.8-253.7 137.8c-158.4 0-212.1-138.1-137.2-229c16.3-19.8 44.2-38.7 87.3-49.4c67.5-16.5 175 10.3 275.7 43.4c18.1-33.3 33.4-69.9 44.7-108.9H305.1V402h160v-56.2H271.3v-31.3h193.8v-80.1s0-13.5 13.7-13.5H557v93.6h191.7v31.3H557.1V402h156.4c-15 61.1-37.7 117.4-66.2 166.8c47.5 17.1 90.1 33.3 121.8 43.9z">
								</path>
							</svg>
						</el-icon>
						<el-icon :size="30" color="rgb(153, 153, 153)">
							<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em"
								height="1em" viewBox="0 0 1024 1024" data-icon="ant-design:weibo-circle-filled"
								class="iconify iconify--ant-design">
								<path fill="currentColor"
									d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64zm-44.4 672C353.1 736 236 680.4 236 588.9c0-47.8 30.2-103.1 82.3-155.3c69.5-69.6 150.6-101.4 181.1-70.8c13.5 13.5 14.8 36.8 6.1 64.6c-4.5 14 13.1 6.3 13.1 6.3c56.2-23.6 105.2-25 123.1.7c9.6 13.7 8.6 32.8-.2 55.1c-4.1 10.2 1.3 11.8 9 14.1c31.7 9.8 66.9 33.6 66.9 75.5c.2 69.5-99.7 156.9-249.8 156.9zm207.3-290.8a34.9 34.9 0 0 0-7.2-34.1a34.68 34.68 0 0 0-33.1-10.7a18.24 18.24 0 0 1-7.6-35.7c24.1-5.1 50.1 2.3 67.7 21.9c17.7 19.6 22.4 46.3 14.9 69.8a18.13 18.13 0 0 1-22.9 11.7a18.18 18.18 0 0 1-11.8-22.9zm106 34.3s0 .1 0 0a21.1 21.1 0 0 1-26.6 13.7a21.19 21.19 0 0 1-13.6-26.7c11-34.2 4-73.2-21.7-101.8a104.04 104.04 0 0 0-98.9-32.1a21.14 21.14 0 0 1-25.1-16.3a21.07 21.07 0 0 1 16.2-25.1c49.4-10.5 102.8 4.8 139.1 45.1c36.3 40.2 46.1 95.1 30.6 143.2zm-334.5 6.1c-91.4 9-160.7 65.1-154.7 125.2c5.9 60.1 84.8 101.5 176.2 92.5c91.4-9.1 160.7-65.1 154.7-125.3c-5.9-60.1-84.8-101.5-176.2-92.4zm80.2 141.7c-18.7 42.3-72.3 64.8-117.8 50.1c-43.9-14.2-62.5-57.7-43.3-96.8c18.9-38.4 68-60.1 111.5-48.8c45 11.7 68 54.2 49.6 95.5zm-93-32.2c-14.2-5.9-32.4.2-41.2 13.9c-8.8 13.8-4.7 30.2 9.3 36.6c14.3 6.5 33.2.3 42-13.8c8.8-14.3 4.2-30.6-10.1-36.7zm34.9-14.5c-5.4-2.2-12.2.5-15.4 5.8c-3.1 5.4-1.4 11.5 4.1 13.8c5.5 2.3 12.6-.3 15.8-5.8c3-5.6 1-11.8-4.5-13.8z">
								</path>
							</svg>
						</el-icon>
					</div>
				</el-form-item>
			</el-col>
		</el-row>
	</el-form>
</template>
<script lang="ts" setup>
import { doLogin } from "@/api/user.ts";
import useUserStore from "@/store/modules/user";
// import {FormInstance, FormRules} from "element-plus";
import { FormInstance, FormRules } from "element-plus";
import { ref, reactive } from "vue";

interface LoginForm {
	username: string;
	password: string;
}

// 定义一个表单实例
const loginFormRef = ref<FormInstance>();
const loginForm = reactive<LoginForm>({
	username: "admin",
	password: "admin123"
});

const rules = reactive<FormRules<LoginForm>>({
	username: [{ required: true, message: "该项为必填项", trigger: "blur" }],
	password: [{ required: true, message: "该项为必填项", trigger: "blur" }]
});

// 登录加载状态
const loading = ref(false);

const router = useRouter();

// 表单提交
const submitForm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	await formEl.validate(async valid => {
		if (valid) {
			loading.value = true;
			try {
				const res = await doLogin(loginForm);
				console.log(res);
				const { token } = res.data;
				const userStore = useUserStore();
				userStore.getToken(token);
				ElMessage.success("登录成功");
				// 延迟跳转，让用户看到加载效果
				setTimeout(() => {
					loading.value = false;
					router.push({ name: "dashboard" });
				}, 800);
			} catch (error) {
				loading.value = false;
				ElMessage.error("登录失败，请检查用户名和密码");
			}
		}
	});
};
</script>

<style lang="scss" scoped>
.login-form {
	width: 100%;
	padding: 20px;
	//border: 1px solid red;

	h2 {
		width: 100%;
		text-align: center;
		font-size: 24px;
		line-height: 32px;
		font-weight: 700;
	}

	.remember {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.other {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
}
</style>
