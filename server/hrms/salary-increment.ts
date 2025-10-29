// Salary Increment API Integration

import { clientEnv } from '@/env';
import type {
    ApiResponse,
    SalaryIncrementDeleteRequest,
    SalaryIncrementDeleteResponse,
    SalaryIncrementOnloadRequest,
    SalaryIncrementOnloadResponse,
    SalaryIncrementSaveRequest,
    SalaryIncrementSaveResponse
} from '@/types/hrms/salary-increment';
import axios from 'axios';

/**
 * Get salary increment onload data
 * POST /api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails
 */
export async function getSalaryIncrementOnload(payload: SalaryIncrementOnloadRequest): Promise<ApiResponse<SalaryIncrementOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryIncrementOnloadResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryIncrementOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error fetching salary increment onload data ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load salary increment data',
            data: undefined
        };
    }
}

/**
 * Save salary increment
 * POST /api/EmployeeSalaryIncreementProcessFacade
 */
export async function saveSalaryIncrement(payload: SalaryIncrementSaveRequest): Promise<ApiResponse<SalaryIncrementSaveResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeSalaryIncreementProcessFacade';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryIncrementSaveResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryIncrementSaveResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? payload.HREIC_Id === 0
                        ? 'Salary increment created successfully'
                        : 'Salary increment updated successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving salary increment ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to save salary increment',
            data: undefined
        };
    }
}

/**
 * Delete salary increment
 * POST /api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById
 */
export async function deleteSalaryIncrement(payload: SalaryIncrementDeleteRequest): Promise<ApiResponse<SalaryIncrementDeleteResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryIncrementDeleteResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryIncrementDeleteResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Salary increment deleted successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error deleting salary increment ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to delete salary increment',
            data: undefined
        };
    }
}
