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
 * POST /api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=30
 */
export async function getSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest) {
    const url = '/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=30';
    const response = await api.post<SalaryApprovalOnloadResponse>('hrms', url, {});
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as SalaryApprovalOnloadResponse
    };
}

/**
 * Search employees by selection for salary approval
 * POST /api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew
 */
export async function searchSalaryApprovalEmployees(payload: SalaryApprovalSearchRequest) {
    const url = '/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew';
    
    // Prepare request body - ensure arrays are [0] when empty, as API expects
    const requestBody = {
        MI_Id: payload.MI_Id || 0,
        HRES_Year: payload.HRES_Year || 'string',
        HRES_Month: payload.HRES_Month || 'string',
        hrmdeS_IdList: payload.hrmdeS_IdList && payload.hrmdeS_IdList.length > 0 ? payload.hrmdeS_IdList : [0],
        hrmD_IdList: payload.hrmD_IdList && payload.hrmD_IdList.length > 0 ? payload.hrmD_IdList : [0],
        groupTypeIdList: payload.groupTypeIdList && payload.groupTypeIdList.length > 0 ? payload.groupTypeIdList : [0],
        LogInUserId: payload.LogInUserId || 0
    };
    
    const response = await api.post<SalaryApprovalSearchResponse>('hrms', url, requestBody);
    
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response;
    }
    
    // Wrap raw response data
    return {
        success: true,
        message: 'Data loaded successfully',
        data: response as unknown as SalaryApprovalSearchResponse
    };
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
