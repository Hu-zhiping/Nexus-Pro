import router from "@/router";
import { ElMessage } from 'element-plus';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

interface ApiConfig {
	baseURL: string;
	timeout: number;
}

const config: ApiConfig = {
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 10000
};

class Http {
	private instance: AxiosInstance;

	constructor(config: ApiConfig) {
		this.instance = axios.create(config);

		this.instance.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				const token = localStorage.getItem("access_token");
				if (token) {
					config.headers["Authorization"] = "Bearer " + token;
				}
				return config;
			},
			(error: any) => {
				return Promise.reject(error);
			}
		);

		this.instance.interceptors.response.use(
			(response: AxiosResponse<any, any>) => {
				const { code, msg } = response.data;
				if (code && code == 200) {
					return response.data;
				}
				// token过期
				if (code === 401) {
					router.push("/login?expired=1");
				}
				ElMessage.error(msg || "系统错误");
				return Promise.reject(new Error(msg || "系统错误"));
			},
			(error: any) => {
				ElMessage.error(error.msg || "系统错误");
				return Promise.reject(error);
			}
		);
	}

	// 封装 GET 请求，包含查询参数
	get(url: string, params?: Record<string, any>, config?: AxiosRequestConfig) {
		return this.instance.get(url, { params, ...config });
	}

	// 封装 POST 请求
	post(url: string, data?: any, config?: AxiosRequestConfig) {
		return this.instance.post(url, data, config);
	}

	// 封装 PUT 请求
	put(url: string, data?: any, config?: AxiosRequestConfig) {
		return this.instance.put(url, data, config);
	}

	// 封装 DELETE 请求
	delete(url: string, config?: AxiosRequestConfig) {
		return this.instance.delete(url, config);
	}
}

const http: Http = new Http(config);
export default http;
