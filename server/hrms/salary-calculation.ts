// Salary Calculation API Integration

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type {
    SalaryCalculationGenerateRequest,
    SalaryCalculationGenerateResponse,
    SalaryCalculationOnloadRequest,
    SalaryCalculationOnloadResponse
} from '@/types/hrms/salary-calculation';
import axios from 'axios';

/**
 * Get onload details for salary calculation (dropdowns, config, etc.)
 * POST /api/employeeSalaryCalculationFacade/onloadgetdetailsNew
 */
export async function getSalaryCalculationOnload(
    payload: SalaryCalculationOnloadRequest
): Promise<ApiResponse<SalaryCalculationOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/employeeSalaryCalculationFacade/onloadgetdetailsNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryCalculationOnloadResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryCalculationOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                (axiosResponse.data as any)?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading salary calculation onload data ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load salary calculation data',
            data: null
        };
    }
}

/**
 * Generate salary for selected employees
 * POST /api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew
 */
export async function generateSalaryForSelectedEmployees(
    data: SalaryCalculationGenerateRequest
): Promise<ApiResponse<SalaryCalculationGenerateResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/employeeSalaryCalculationFacade/calculateSelectedEmployeeSalaryNew';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<SalaryCalculationGenerateResponse>(url, data, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<SalaryCalculationGenerateResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                axiosResponse.data?.message ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Salary calculation completed successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error generating salary ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to generate salary',
            data: null
        };
    }
}
