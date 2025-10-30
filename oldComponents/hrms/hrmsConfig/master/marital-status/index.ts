// Master Marital Status API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterMaritalStatusResponse,
    MaritalStatusDetail,
    MasterMaritalStatusInput,
    OnloadGetMaritalStatusDetailsRequest
} from '@/types/hrms/master-marital-status';

/**
 * Get all master marital status records by role ID
 * GET /api/MasterMaritalStatus/getalldetails/{roleId}
 */
export async function getMasterMaritalStatusList(roleId: number): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    try {
        const url = `/api/MasterMaritalStatus/getalldetails/${roleId}`;
        console.log('Fetching master marital status list from:', url);
        
        const response = await api.get<MasterMaritalStatusResponse>(url);
        console.log('Master marital status list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master marital status list:', error);
        throw error;
    }
}

/**
 * Create or Update a master marital status record
 * POST /api/MasterMaritalStatusFacade
 * Using axios directly with proxy
 */
export async function saveMasterMaritalStatus(data: MasterMaritalStatusInput): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterMaritalStatusFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetMaritalStatusDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            IVRMMMS_Id: data.ivrmmmS_Id || 0,
            MI_Id: 34,
            IVRMMMS_MaritalStatus: data.ivrmmmS_MaritalStatus,
            IVRMMMS_ActiveFlag: data.ivrmmmS_ActiveFlag,
            maritalstatusList: [],
            retrunMsg: "string",
            roleId: data.mI_Id || 0
        };

        console.log('=== Save Marital Status API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterMaritalStatusResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Marital Status API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterMaritalStatusResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Marital status saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Marital Status API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterMaritalStatusResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save marital status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Activate or Deactivate a master marital status record
 * POST /api/MasterMaritalStatusFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterMaritalStatus(data: { IVRMMMS_Id: number; IVRMMMS_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterMaritalStatusFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetMaritalStatusDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            IVRMMMS_Id: data.IVRMMMS_Id,
            MI_Id: 34,
            IVRMMMS_MaritalStatus: "string",
            IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
            maritalstatusList: [],
            retrunMsg: "string",
            roleId: data.roleId || 0
        };

        console.log('=== Activate/Deactivate Marital Status API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterMaritalStatusResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Marital Status API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterMaritalStatusResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Marital status ${data.IVRMMMS_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Marital Status API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterMaritalStatusResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update marital status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get marital status record by ID
 * GET /api/MasterMaritalStatusFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getMaritalStatusById(id: number): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterMaritalStatusFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Marital Status By ID API Request ===');
        console.log('URL:', url);
        console.log('Marital Status ID:', id);

        const axiosResponse = await axios.get<MasterMaritalStatusResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Get Marital Status By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterMaritalStatusResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Marital Status By ID API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterMaritalStatusResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch marital status by ID',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get onload details for master marital status
 * POST /api/MasterMaritalStatusFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadMaritalStatusDetails(roleId: number): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterMaritalStatusFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetMaritalStatusDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            IVRMMMS_Id: 0,
            MI_Id: 34,
            IVRMMMS_MaritalStatus: "string",
            IVRMMMS_ActiveFlag: true,
            maritalstatusList: [],
            retrunMsg: "string",
            roleId: roleId
        };
        
        console.log('=== Onload Marital Status Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterMaritalStatusResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Marital Status Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterMaritalStatusResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Marital statuses loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Marital Status Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterMaritalStatusResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load marital statuses',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Test function to verify API connectivity
 */
export async function testMasterMaritalStatusAPI(roleId: number = 2): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    try {
        console.log('Testing Master Marital Status API connectivity...');
        const response = await getMasterMaritalStatusList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}
