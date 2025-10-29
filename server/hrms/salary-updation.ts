// Salary Updation API Integration

import { clientEnv } from '@/env';
import type {
    ApiResponse,
    SalaryUpdationDeleteRequest,
    SalaryUpdationOnloadRequest,
    SalaryUpdationOnloadResponse,
    SalaryUpdationSaveRequest,
    SalaryUpdationSaveResponse
} from '@/types/hrms/salary-updation';
import axios from 'axios';

/**
 * Get salary updation list
 * GET /api/salaryUpdation/getalldetails/{roleId}
 */
export async function getSalaryUpdationList(payload: SalaryUpdationOnloadRequest): Promise<ApiResponse<SalaryUpdationOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/salaryUpdation/getalldetails/${payload.roleId}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.get<SalaryUpdationOnloadResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryUpdationOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading salary updation list ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load salary updation data',
            data: undefined
        };
    }
}

/**
 * Save salary updation
 * POST /api/salaryUpdation
 */
export async function saveSalaryUpdation(payload: SalaryUpdationSaveRequest): Promise<ApiResponse<SalaryUpdationSaveResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/salaryUpdation';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryUpdationSaveResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryUpdationSaveResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? payload.HRESU_Id === 0
                        ? 'Salary updation created successfully'
                        : 'Salary updation updated successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving salary updation ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to save salary updation',
            data: undefined
        };
    }
}

/**
 * Delete salary updation
 * DELETE /api/salaryUpdation
 */
export async function deleteSalaryUpdation(payload: SalaryUpdationDeleteRequest): Promise<ApiResponse<any>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/salaryUpdation';
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
                    ? 'Salary updation deleted successfully'
                    : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error deleting salary updation ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to delete salary updation',
            data: undefined
        };
    }
}
