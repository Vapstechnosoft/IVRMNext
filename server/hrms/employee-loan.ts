// Employee Loan API Integration

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type {
    EmployeeLoanDeleteRequest,
    EmployeeLoanOnloadRequest,
    EmployeeLoanOnloadResponse,
    EmployeeLoanSaveRequest,
    EmployeeLoanSaveResponse
} from '@/types/hrms/employee-loan';
import axios from 'axios';

/**
 * Get employee loan list with onload data
 * POST /api/HREmpLoanFacade/onloadgetdetails
 */
export async function getEmployeeLoanList(payload: EmployeeLoanOnloadRequest): Promise<ApiResponse<EmployeeLoanOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpLoanFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        // Minimal request body for onload
        const requestBody = {
            MI_Id: 30,
            roleId: payload.roleId,
            HREL_Id: 0,
            HRME_Id: 0,
            HRMLN_Id: 0,
            HREL_LoanAmount: 0,
            HREL_ActiveFlag: true
        };

        const axiosResponse = await axios.post<EmployeeLoanOnloadResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeLoanOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading employee loan list ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load employee loan data',
            data: null
        };
    }
}

/**
 * Save/Update employee loan
 * POST /api/HREmpLoanFacade
 */
export async function saveEmployeeLoan(payload: EmployeeLoanSaveRequest): Promise<ApiResponse<EmployeeLoanSaveResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpLoanFacade';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeLoanSaveResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeLoanSaveResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? payload.HREL_Id === 0
                        ? 'Employee loan created successfully'
                        : 'Employee loan updated successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee loan ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to save employee loan',
            data: null
        };
    }
}

/**
 * Delete employee loan
 * POST /api/HREmpLoanFacade/deactivateRecordById
 */
export async function deleteEmployeeLoan(payload: EmployeeLoanDeleteRequest): Promise<ApiResponse<any>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HREmpLoanFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post(url, payload, {
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
                    ? 'Employee loan deleted successfully'
                    : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error deleting employee loan ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to delete employee loan',
            data: null
        };
    }
}
