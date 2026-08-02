const TOKEN_KEY = "nexus-pro-token";

/** 获取访问令牌 */
export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

/** 设置访问令牌 */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** 清除访问令牌 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
