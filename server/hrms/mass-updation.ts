// Mass Updation API Integration

import { clientEnv } from '@/env';
import type {
    ApiResponse,
    MassUpdationOnloadRequest,
    MassUpdationOnloadResponse,
    MassUpdationSaveRequest,
    MassUpdationSaveResponse,
    MassUpdationSearchRequest
} from '@/types/hrms/mass-updation';
import axios from 'axios';

/**
 * Get mass updation onload data
 * POST /api/massUpdationFacade/onloadgetdetails
 */
export async function getMassUpdationOnload(payload: MassUpdationOnloadRequest): Promise<ApiResponse<MassUpdationOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/massUpdationFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<MassUpdationOnloadResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MassUpdationOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error loading mass updation data ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to load mass updation data',
            data: undefined
        };
    }
}

/**
 * Save mass updation
 * POST /api/massUpdationFacade
 */
export async function saveMassUpdation(payload: MassUpdationSaveRequest): Promise<ApiResponse<MassUpdationSaveResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/massUpdationFacade';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<MassUpdationSaveResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MassUpdationSaveResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Mass updation completed successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error saving mass updation ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to save mass updation',
            data: undefined
        };
    }
}

/**
 * Search employees for mass updation
 * POST /api/massUpdationFacade/FilterEmployeeData
 */
export async function searchMassUpdationEmployees(payload: MassUpdationSearchRequest): Promise<ApiResponse<MassUpdationOnloadResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/massUpdationFacade/FilterEmployeeData';
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.post<MassUpdationOnloadResponse>(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MassUpdationOnloadResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data?.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Employees loaded successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Error searching employees ===');
        console.error('Error:', error);

        return {
            success: false,
            message: error.message || 'Failed to search employees',
            data: undefined
        };
    }
}
