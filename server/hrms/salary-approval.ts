// Salary Approval API Integration - Complete Implementation

import { clientEnv } from '@/env';
import type {
    SalaryApprovalApiResponse,
    SalaryApprovalOnloadRequest,
    SalaryApprovalOnloadResponse,
    SalaryApprovalRequest,
    SalaryApprovalResponse,
    SalaryApprovalSearchRequest,
    SalaryApprovalSearchResponse
} from '@/types/hrms/salary-approval';
import axios from 'axios';

const API_BASE_URL = clientEnv.NEXT_PUBLIC_API_BASE_URL;

/**
 * Get salary approval process onload data
 * POST /api/CumulativeSalaryReportFacade/onloadgetdetailsNew
 */
export async function getSalaryApprovalOnload(
    payload: SalaryApprovalOnloadRequest
): Promise<{ success: boolean; data: SalaryApprovalOnloadResponse | null; message?: string }> {
    try {
        const response = await axios.post<SalaryApprovalOnloadResponse>(
            `${API_BASE_URL}/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${payload.MI_Id}`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error: any) {
        console.error('Error fetching salary approval process data:', error);

        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to fetch salary approval process data'
        };
    }
}

/**
 * Search employees by selection for salary approval
 * POST /api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew
 */
export async function searchSalaryApprovalEmployees(
    payload: SalaryApprovalSearchRequest
): Promise<{ success: boolean; data: SalaryApprovalSearchResponse | null; message?: string }> {
    try {
        const response = await axios.post<SalaryApprovalSearchResponse>(
            `${API_BASE_URL}/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew`,
            payload,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('Error searching salary approval employees:', error);
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Search failed'
        };
    }
}

/**
 * Approve or reject salaries for selected employees
 * POST /api/CumulativeSalaryReportFacade/approveSalary
 */
export async function approveSalaries(
    payload: SalaryApprovalRequest
): Promise<{ success: boolean; data: SalaryApprovalResponse | null; message?: string }> {
    try {
        const response = await axios.post<SalaryApprovalResponse>(
            `${API_BASE_URL}/api/CumulativeSalaryReportFacade/approveSalary`,
            payload,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        return {
            success: response.data?.success ?? true,
            data: response.data,
            message: response.data?.message || `Salaries ${payload.approvalStatus.toLowerCase()} successfully`
        };
    } catch (error: any) {
        console.error('Error approving salaries:', error);
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to approve salaries'
        };
    }
}

/**
 * Test API connection for salary approval process
 */
export async function testSalaryApprovalProcessAPI(miId: number = 30): Promise<SalaryApprovalApiResponse> {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${miId}`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        return {
            success: response.status === 200,
            data: response.data,
            message: response.status === 200 ? 'API connection successful' : 'API connection failed'
        };
    } catch (error: any) {
        console.error('API test error:', error);

        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'API connection failed'
        };
    }
}
