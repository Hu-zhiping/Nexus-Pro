import { defineStore } from "pinia";
import { setToken, removeToken } from "@/utils/auth";
import { doLogin } from "@/api/user";
import type { ApiResult, LoginResult } from "@/api/user";
import useMenuStore from "@/store/modules/menu";

// ==================== 类型定义 ====================

export interface UserProfile {
  id?: string | number;
  username: string;
  nickname?: string;
  avatar?: string;
  roles?: string[];
}

// ==================== Store ====================

const useUserStore = defineStore("user", {
  state: () => ({
    /** 访问令牌 */
    accessToken: "",
    /** 用户信息 */
    profile: {} as UserProfile,
  }),

  getters: {
    /**
     * 是否已登录
     */
    isAuthenticated(): boolean {
      return !!this.accessToken;
    },

    /**
     * 显示名称（优先昵称）
     */
    displayName(): string {
      return this.profile.nickname || this.profile.username || "";
    },

    /**
     * 用户角色列表
     */
    roleList(): string[] {
      return this.profile.roles || [];
    },

    /**
     * 是否包含指定角色
     */
    hasRole(): (roleCode: string) => boolean {
      return (roleCode: string) => this.roleList.includes(roleCode);
    },
  },

  actions: {
    /**
     * 设置令牌
     */
    setAccessToken(token: string) {
      this.accessToken = token;
      setToken(token);
    },

    /**
     * 设置用户信息
     */
    setProfile(profile: UserProfile) {
      this.profile = profile;
    },

    /**
     * 用户登录
     */
    async signIn(credentials: { username: string; password: string }) {
      try {
        const response = (await doLogin(credentials)) as ApiResult<LoginResult>;
        const { token, userInfo } = response.data;

        if (token) {
          this.setAccessToken(token);
          if (userInfo) this.setProfile(userInfo);
          return true;
        }
        return false;
      } catch (error) {
        console.error("[UserStore] 登录失败:", error);
        return false;
      }
    },

    /**
     * 用户登出
     */
    signOut(redirectToLogin = true) {
      removeToken();
      this.accessToken = "";
      this.profile = {} as UserProfile;
      useMenuStore().$reset();

      if (redirectToLogin) {
        window.location.href = "/login";
      }
    },

    /**
     * 更新用户信息
     */
    updateProfile(partial: Partial<UserProfile>) {
      this.profile = { ...this.profile, ...partial };
    },
  },

  persist: {
    pick: ["accessToken", "profile"],
  },
});

export default useUserStore;
