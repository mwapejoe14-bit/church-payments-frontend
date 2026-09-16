import { getApi } from "../api";
import type {
  ApiResponse,
  DashboardSummary,
  MonthlyReport,
  ReportRow,
} from "../types";

export const reportsApi = {
  async getReports(): Promise<ReportRow[]> {
    const { data } = await getApi().get<ApiResponse<ReportRow[]>>("/reports");
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getMonthlyReport(params?: {
    month?: number;
    year?: number;
  }): Promise<MonthlyReport[]> {
    const { data } = await getApi().get<ApiResponse<MonthlyReport[]>>(
      "/reports/monthly",
      { params }
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const { data } = await getApi().get<ApiResponse<DashboardSummary>>(
      "/reports/dashboard"
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};