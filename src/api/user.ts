import http from "@/utils/request.ts";

export const doLogin = (data: any) => {
	return http.post("/api/admin/login", data);
};

// 菜单
export const getMenuList = () => {
	return http.post("/api/admin/getMenuList");
};

export const setToken = (token: string) => {
	localStorage.setItem("access_token", token);
};

export const getToken = () => {
	return localStorage.getItem("access_token");
};



// 获取用户列表 - 方式1：分别传递body和query参数
export const getUserList = (bodyData: any, queryParams?: any) => {
	return http.post("/user/list", bodyData, { params: queryParams });
}

// 获取用户列表 - 方式3：固定URL参数
export const getUserListWithFixedParams = (
	param1: string,
	param2: string,
	bodyData: any,
	queryParams?: any
) => {
	return http.post(`/user/list/${param1}/${param2}`, bodyData, { params: queryParams });
}

// 获取用户列表 - 方式2：传递完整配置对象
export const getUserListAdvanced = (config: {
	body?: any,
	query?: any,
	urlParams?: string[] // 如果需要在URL路径中插入参数
}) => {
	const { body, query, urlParams } = config;
	let url = "/user/list";

	// 如果需要在URL路径中添加参数，比如 /user/list/1/active
	if (urlParams && urlParams.length > 0) {
		url += "/" + urlParams.join("/");
	}

	return http.post(url, body, { params: query });
}

// 创建用户
export const createUser = (data: any) => {
	return http.post("/user", data);
}

// 更新用户
export const updateUser = (id: string, data: any) => {
	return http.put(`/user/${id}`, data);
}

// 删除用户
export const deleteUser = (id: string) => {
	return http.delete(`/user/${id}`);
}

// 更新用户状态
export const updateUserStatus = (id: string, status: number) => {
	return http.put(`/user/${id}/status`, { status });
}