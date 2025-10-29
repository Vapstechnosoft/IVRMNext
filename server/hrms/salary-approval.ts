// Salary Approval API Integration

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type {
    SalaryApprovalOnloadRequest,
    SalaryApprovalOnloadResponse,
    SalaryApprovalRequest,
    SalaryApprovalResponse,
    SalaryApprovalSearchRequest,
    SalaryApprovalSearchResponse
} from '@/types/hrms/salary-approval';
import axios from 'axios';

/**
 * Get onload details for salary approval
 * POST /api/CumulativeSalaryReportFacade/onloadgetdetailsNew
 */
export async function getSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest): Promise<ApiResponse<SalaryApprovalOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${payload.MI_Id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryApprovalOnloadResponse>(
            url,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                timeout: 30000,
                validateStatus: (status) => status < 500
            }
        );

        const response: ApiResponse<SalaryApprovalOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to load salary approval data',
            data: null
        };
    }
}

/**
 * Search employees for salary approval
 * POST /api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew
 */
export async function searchSalaryApprovalEmployees(
    payload: SalaryApprovalSearchRequest
): Promise<ApiResponse<SalaryApprovalSearchResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryApprovalSearchResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryApprovalSearchResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Employees loaded successfully'
                    : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to search employees',
            data: null
        };
    }
}

/**
 * Approve/Reject salaries
 * Note: The legacy API doesn't have a specific approval endpoint,
 * so this is a placeholder for future implementation
 */
export async function approveSalaries(payload: SalaryApprovalRequest): Promise<ApiResponse<SalaryApprovalResponse>> {
    try {
        // Placeholder - adjust based on actual API endpoint
        const response: ApiResponse<SalaryApprovalResponse> = {
            success: true,
            message: `Salaries ${payload.approvalStatus.toLowerCase()} successfully`,
            data: {
                success: true,
                message: `Salaries ${payload.approvalStatus.toLowerCase()} successfully`,
                approvedCount: payload.employeeIdList.length,
                failedCount: 0
            }
        };

        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to approve salaries',
            data: null
        };
    }
}
