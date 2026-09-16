import { getApi } from "../api";
import type { ApiResponse, Result, Term } from "../types";

export const resultsApi = {
  async getMyChildrenResults(): Promise<Result[]> {
    const { data } = await getApi().get<ApiResponse<Result[]>>(
      "/results/my"
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getByChild(childId: string): Promise<Result[]> {
    const { data } = await getApi().get<ApiResponse<Result[]>>(
      `/results/child/${childId}`
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async upsert(payload: {
    childId: string;
    term: Term;
    year: number;
    subjects: { name: string; score: number }[];
    position?: number;
    teacherRemarks?: string;
  }): Promise<Result> {
    const { data } = await getApi().post<ApiResponse<Result>>(
      "/results",
      payload
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};