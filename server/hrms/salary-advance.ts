// Salary Advance API Integration

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type {
    SalaryAdvanceDeleteRequest,
    SalaryAdvanceOnloadRequest,
    SalaryAdvanceOnloadResponse,
    SalaryAdvanceSaveRequest,
    SalaryAdvanceSaveResponse
} from '@/types/hrms/salary-advance';
import axios from 'axios';

/**
 * Get salary advance list with onload data
 * POST /api/HREmpSalaryAdvanceFacade
 */
export async function getSalaryAdvanceList(payload: SalaryAdvanceOnloadRequest): Promise<ApiResponse<SalaryAdvanceOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpSalaryAdvanceFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRESA_Id: 0,
            MI_Id: 30,
            HRME_Id: 0,
            HRESA_EntryDate: new Date().toISOString(),
            HRESA_AdvYear: new Date().getFullYear(),
            HRESA_AdvMonth: '',
            HRESA_AppliedAmount: 0,
            HRESA_Remarks: '',
            HRESA_ActiveFlag: true,
            HRESA_AdvStatus: '',
            HRESA_SanctinedAmount: 0,
            HRESA_ModeOfPayment: '',
            HRESA_ReferenceNo: 0,
            retrunMsg: '',
            roleId: payload.roleId
        };

        const axiosResponse = await axios.post<SalaryAdvanceOnloadResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryAdvanceOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading salary advance list ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load salary advance data',
            data: null
        };
    }
}

/**
 * Save/Update salary advance
 * POST /api/HREmpSalaryAdvanceFacade
 */
export async function saveSalaryAdvance(payload: SalaryAdvanceSaveRequest): Promise<ApiResponse<SalaryAdvanceSaveResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpSalaryAdvanceFacade';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryAdvanceSaveResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryAdvanceSaveResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? payload.HRESA_Id === 0
                        ? 'Salary advance created successfully'
                        : 'Salary advance updated successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving salary advance ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to save salary advance',
            data: null
        };
    }
}

/**
 * Delete salary advance
 * DELETE /api/HREmpSalaryAdvanceFacade
 */
export async function deleteSalaryAdvance(payload: SalaryAdvanceDeleteRequest): Promise<ApiResponse<any>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpSalaryAdvanceFacade';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.delete(url, {
            data: payload,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<any> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Salary advance deleted successfully'
                    : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error deleting salary advance ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to delete salary advance',
            data: null
        };
    }
}
