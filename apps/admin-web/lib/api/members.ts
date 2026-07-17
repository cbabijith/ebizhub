import { Member, ApiResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.ebishub.com/api";

async function fetchApi<T>(path: string, options: RequestInit = {}, token?: string): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Request failed with status ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) {
        errorMsg = errBody.message;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const membersApi = {
  async list(params: { page?: number; limit?: number; search?: string } = {}, token: string): Promise<ApiResponse<Member[]>> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    return fetchApi<Member[]>(`/v1/members?${query.toString()}`, {}, token);
  },

  async getById(id: string, token: string): Promise<ApiResponse<Member>> {
    return fetchApi<Member>(`/v1/members/${id}`, {}, token);
  },

  async verify(id: string, token: string): Promise<ApiResponse<any>> {
    return fetchApi<any>(`/v1/members/${id}/verify`, { method: "POST" }, token);
  },

  async suspend(id: string, token: string): Promise<ApiResponse<any>> {
    return fetchApi<any>(`/v1/members/${id}/suspend`, { method: "POST" }, token);
  },
};
