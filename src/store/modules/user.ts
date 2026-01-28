import { setToken } from "@/api/user";
import { defineStore } from "pinia";

export interface UserInfo {
  username: string;
  avatar: string;
  email?: string;
  roles?: string[];
}

const useUserStore = defineStore("user", {
	state: () => ({
		token: "",
		userInfo: {
			username: "Admin",
			avatar: "",
			email: "",
			roles: [],
		} as UserInfo,
	}),
	actions: {
		getToken(data: string) {
			this.token = data;
			setToken(data);
		},
		setUserInfo(info: UserInfo) {
			this.userInfo = { ...this.userInfo, ...info };
		},
		logout() {
			localStorage.removeItem("access_token");
			localStorage.removeItem("layout-settings");
			this.token = "";
			this.userInfo = {
				username: "",
				avatar: "",
				email: "",
				roles: [],
			};
		}
	},
	persist: true
});

export default useUserStore;
