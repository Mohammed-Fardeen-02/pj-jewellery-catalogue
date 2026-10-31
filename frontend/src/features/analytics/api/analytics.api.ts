import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { DashboardAnalyticsResponse } from "@/types";

export const analyticsApi = {
  async getDashboard(range: string = "30d", token?: string): Promise<DashboardAnalyticsResponse> {
    return apiClient.get<DashboardAnalyticsResponse>(ENDPOINTS.admin.analyticsDashboard(range), {
      token,
    });
  },
};
