import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import { getToken } from "./auth";

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000,
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg } = response.data;
    if (code === 200) {
      return response.data;
    }
    if (code === 401) {
      window.location.href = "/#/login?expired=1";
    }
    ElMessage.error(msg || "请求失败");
    return Promise.reject(new Error(msg || "请求失败"));
  },
  (error) => {
    ElMessage.error(error.message || "网络错误");
    return Promise.reject(error);
  },
);

const http = {
  get: <T = unknown>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig) =>
    instance.get<T, T>(url, { params, ...config }),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.post<T, T>(url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.put<T, T>(url, data, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => instance.delete<T, T>(url, config),
};

export default http;
