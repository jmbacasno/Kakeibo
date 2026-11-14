import api from '../../services/api';
import { ApiSuccessResponse, DashboardData } from '../../types/models';

export interface FetchDashboardParams {
  month: number;
  year: number;
}

export async function fetchSummary({ month, year }: FetchDashboardParams): Promise<DashboardData> {
  const res = await api.get<ApiSuccessResponse<DashboardData>>('/dashboard', {
    params: { month, year },
  });
  return res.data.data;
}

export const dashboardService = {
  fetchSummary,
};

export default dashboardService;
