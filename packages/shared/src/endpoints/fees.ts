import { getApi } from "../api";
import type { ApiResponse, FeeStructure, Term } from "../types";

export const feesApi = {
  async getFeeStructures(params?: {
    year?: number;
    term?: Term;
  }): Promise<FeeStructure[]> {
    const { data } = await getApi().get<ApiResponse<FeeStructure[]>>(
      "/fees",
      { params }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getForGrade(
    grade: number,
    term: Term,
    year: number
  ): Promise<FeeStructure> {
    const { data } = await getApi().get<ApiResponse<FeeStructure>>(
      "/fees/for-grade",
      { params: { grade, term, year } }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async upsert(payload: {
    grade: number;
    term: Term;
    year: number;
    fees: { type: "school" | "uniform" | "lunch" | "bus"; amount: number }[];
  }): Promise<FeeStructure> {
    const { data } = await getApi().post<ApiResponse<FeeStructure>>(
      "/fees",
      payload
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};