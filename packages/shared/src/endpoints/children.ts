import { getApi } from "../api";
import type { ApiResponse, Child } from "../types";

export const childrenApi = {
  async getMyChildren(): Promise<Child[]> {
    const { data } = await getApi().get<ApiResponse<Child[]>>(
      "/children/my"
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getAllChildren(): Promise<Child[]> {
    const { data } = await getApi().get<ApiResponse<Child[]>>("/children");
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getChild(id: string): Promise<Child> {
    const { data } = await getApi().get<ApiResponse<Child>>(
      `/children/${id}`
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createChild(payload: {
    name: string;
    studentNumber: string;
    grade: number;
    parentEmails?: string[];
  }): Promise<Child> {
    const { data } = await getApi().post<ApiResponse<Child>>(
      "/children",
      payload
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};