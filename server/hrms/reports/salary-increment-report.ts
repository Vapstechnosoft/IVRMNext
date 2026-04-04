'use server';

import { api, type ApiResponse } from '@/lib/apiService';
import { type SalaryIncrementReportItem, type SalaryIncrementReportRequest } from '@/types/hrms/reports/salary-increment-report';

/**
 * Get salary increment report
 * POST /api/TransEmployeeSalaryIncreementProcess/get_increment_report
 */
export async function getSalaryIncrementReport(payload: SalaryIncrementReportRequest): Promise<ApiResponse<SalaryIncrementReportItem[]>> {
    const url = '/api/TransEmployeeSalaryIncreementProcess/get_increment_report';
    try {
        const response = await api.post<SalaryIncrementReportItem[]>('hrms', url, payload);
        return response;
    } catch (error) {
        console.error('Error fetching increment report:', error);
        throw error;
    }
}
