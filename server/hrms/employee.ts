// Employee Register API Integration

import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type { EmployeeDetailResponse, EmployeeOnloadResponse, EmployeeSaveRequest, EmployeeSaveResponse } from '@/types/hrms/employee';
import axios from 'axios';

/**
 * Get onload details for employee register (dropdowns, etc.)
 * POST /api/EmployeeRegistrationNew/onloadgetdetails
 */
export async function getEmployeeOnload(): Promise<ApiResponse<EmployeeOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            MI_Id: 30,
            LogInUserId: 5
        };

        const axiosResponse = await axios.post<EmployeeOnloadResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Data loaded successfully' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading employee onload data ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load employee data',
            data: null
        };
    }
}

/**
 * Save or update employee
 * POST /api/EmployeeRegistrationFacade
 */
export async function saveEmployee(data: EmployeeSaveRequest): Promise<ApiResponse<EmployeeSaveResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationFacade';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<EmployeeSaveResponse>(url, data, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeSaveResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data.retrunMsg || (data.HRME_Id === 0 ? 'Employee created successfully' : 'Employee updated successfully'),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving employee ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to save employee',
            data: null
        };
    }
}

/**
 * Get employee by ID
 * POST /api/EmployeeRegistrationNew/getEmployeedetailsBySelection
 */
export async function getEmployeeById(id: number): Promise<ApiResponse<EmployeeDetailResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/getEmployeedetailsBySelection';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            id: id
        };

        const axiosResponse = await axios.post<EmployeeDetailResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<EmployeeDetailResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Employee data loaded successfully'
                    : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading employee by ID ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load employee data',
            data: null
        };
    }
}

/**
 * Delete/Deactivate employee
 * POST /api/EmployeeRegistrationNew/deleteEmployeedetails
 */
export async function deleteEmployee(id: number): Promise<ApiResponse<any>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/EmployeeRegistrationNew/deleteEmployeedetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            id: id
        };

        const axiosResponse = await axios.post(url, requestBody, {
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
                    ? 'Employee deleted successfully'
                    : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error deleting employee ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to delete employee',
            data: null
        };
    }
}
