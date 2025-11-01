'use server';

import { api } from '@/lib/apiService';
import type { ApiResponse } from '@/lib/apiService';
import type {
    SalaryApprovalOnloadRequest,
    SalaryApprovalOnloadResponse,
    SalaryApprovalRequest,
    SalaryApprovalResponse,
    SalaryApprovalSearchRequest,
    SalaryApprovalSearchResponse
} from '@/types/hrms/salary-approval';

/**
 * Get salary approval process onload data
 * POST /api/CumulativeSalaryReportFacade/onloadgetdetailsNew
 */
export async function getSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest) {
    const url = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${payload.MI_Id}`;
    return await api.post<SalaryApprovalOnloadResponse>('hrms', url, {});
}

/**
 * Search employees by selection for salary approval
 * POST /api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew
 */
export async function searchSalaryApprovalEmployees(payload: SalaryApprovalSearchRequest) {
    const url = '/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew';
    return await api.post<SalaryApprovalSearchResponse>('hrms', url, payload);
}

/**
 * Approve or reject salaries for selected employees
 * POST /api/CumulativeSalaryReportFacade/approveSalary
 */
export async function approveSalaries(payload: SalaryApprovalRequest) {
    const url = '/api/CumulativeSalaryReportFacade/approveSalary';
    return await api.post<SalaryApprovalResponse>('hrms', url, payload);
}

/**
 * Test API connection for salary approval process
 */
export async function testSalaryApprovalProcessAPI(miId: number = 30) {
    const url = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${miId}`;
    return await api.post<SalaryApprovalResponse>('hrms', url, {});
}
