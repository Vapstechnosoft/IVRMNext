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
 * GET /api/HRMS_Trans_SalaryApprovalProcess/onloadgetdetails/{mid}
 */
export async function getSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest) {
    const mid = payload.MI_Id || 30;
    const url = `/api/HRMS_Trans_SalaryApprovalProcess/onloadgetdetails/${mid}`;
    try {
        const response = await api.get<SalaryApprovalOnloadResponse>('hrms', url);
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response;
        }
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as SalaryApprovalOnloadResponse
        };
        return wrappedResponse;
    } catch (error: any) {
        console.error('💥 [SALARY APPROVAL - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        // Return error response instead of throwing to prevent UI crashes
        // This allows the frontend to handle the error gracefully
        return {
            success: false,
            message:
                error?.message ||
                error?.response?.data?.message ||
                'Failed to load salary approval data. Please check if the API endpoint is available.',
            data: null
        } as ApiResponse<SalaryApprovalOnloadResponse>;
    }
}
/**
 * Search employees by selection for salary approval
 * POST /api/HRMS_Trans_SalaryApprovalProcess/getEmployeedetailsBySelection
 */
export async function searchSalaryApprovalEmployees(payload: SalaryApprovalSearchRequest) {
    const url = '/api/HRMS_Trans_SalaryApprovalProcess/getEmployeedetailsBySelection';
    // Prepare request body - ensure arrays are [0] when empty, as API expects
    // Use empty strings for Year and Month when not provided
    const trimmedMonth = payload.HRES_Month ? payload.HRES_Month.trim() : '';
    const trimmedYear = payload.HRES_Year ? payload.HRES_Year.trim() : '';
    const requestBody = {
        MI_Id: payload.MI_Id || 30,
        HRES_Year: trimmedYear,
        HRES_Month: trimmedMonth,
        hrmdeS_IdList: payload.hrmdeS_IdList && payload.hrmdeS_IdList.length > 0 ? payload.hrmdeS_IdList : [0],
        hrmD_IdList: payload.hrmD_IdList && payload.hrmD_IdList.length > 0 ? payload.hrmD_IdList : [0],
        groupTypeIdList: payload.groupTypeIdList && payload.groupTypeIdList.length > 0 ? payload.groupTypeIdList : [0],
        LogInUserId: payload.LogInUserId || 0
    };
    try {
        const response = await api.post<SalaryApprovalSearchResponse>('hrms', url, requestBody);
        // The backend returns raw data, not wrapped in ApiResponse format
        // Wrap it to match the expected ApiResponse structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const _employeeCount = (response.data as SalaryApprovalSearchResponse)?.ReportData?.length || 0;
            return response;
        }
        // Wrap raw response data
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: response as unknown as SalaryApprovalSearchResponse
        };
        // Detailed inspection of ReportData
        const reportData = wrappedResponse.data?.ReportData;
        if (reportData && Array.isArray(reportData)) {
            if (reportData.length > 0) {
            }
        }
        const employeeCount = Array.isArray(reportData) ? reportData.length : 0;
        if (employeeCount > 0 && reportData) {
        } else {
            if ((response as any)?.employeeDetails) {
            }
        }
        return wrappedResponse;
    } catch (error) {
        console.error('💥 [SALARY APPROVAL - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
/**
 * Approve or reject salaries for selected employees
 * POST /api/CumulativeSalaryReportFacade/approveSalary
 */
export async function approveSalaries(payload: SalaryApprovalRequest) {
    const url = '/api/CumulativeSalaryReportFacade/approveSalary';
    try {
        const response = await api.post<SalaryApprovalResponse>('hrms', url, payload);
        return response;
    } catch (error) {
        console.error('💥 [SALARY APPROVAL - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
/**
 * Test API connection for salary approval process
 */
export async function testSalaryApprovalProcessAPI(miId = 30) {
    const url = `/api/HRMS_Trans_SalaryApprovalProcess/onloadgetdetails/${miId}`;
    return await api.get<SalaryApprovalOnloadResponse>('hrms', url);
}
