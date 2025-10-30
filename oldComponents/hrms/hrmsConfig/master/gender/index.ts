// Master Gender API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterGenderResponse,
    GenderItem,
    MasterGenderInput,
    OnloadGetDetailsRequest,
    SaveGenderRequest
} from '@/types/hrms/master-gender';

/**
 * Get all master gender records by role ID
 * GET /api/MasterGender/getalldetails/{roleId}
 */
export async function getMasterGenderList(roleId: number): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        const url = `/api/MasterGender/getalldetails/${roleId}`;
        console.log('Fetching master gender list from:', url);
        
        const response = await api.get<MasterGenderResponse>(url);
        console.log('Master gender list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master gender list:', error);
        throw error;
    }
}
 
/**
 * Create or Update master gender item
 * POST /api/MasterGenderFacade
 * Using axios directly with proxy
 */
export async function saveMasterGender(data: MasterGenderInput): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGenderFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveGenderRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            IVRMMG_Id: data.ivrmmG_Id || 0,
            MI_Id: 30,
            IVRMMG_GenderName: data.ivrmmG_GenderName,
            IVRMMG_ActiveFlag: data.ivrmmG_ActiveFlag,
            genderList: [],
            retrunMsg: "string",
            roleId: data.mI_Id || 0
        };

        console.log('=== Save Gender API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGenderResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Gender API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGenderResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Gender saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Gender API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGenderResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save gender',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Edit/Update an existing master gender record
 * POST /api/MasterGender/editRecord
 */
export async function editMasterGender(data: MasterGenderInput): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        const url = `/api/MasterGender/editRecord`;
        console.log('Editing master gender:', url, data);

        const response = await api.post<MasterGenderResponse>(url, data);
        console.log('Edit master gender response:', response);

        return response;
    } catch (error) {
        console.error('Error editing master gender:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master gender record
 * POST /api/MasterGenderFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterGender(data: { ivrmmG_Id: number; ivrmmG_ActiveFlag: boolean; mI_Id?: number }): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGenderFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveGenderRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            IVRMMG_Id: data.ivrmmG_Id,
            MI_Id: 30,
            IVRMMG_GenderName: "string",
            IVRMMG_ActiveFlag: data.ivrmmG_ActiveFlag,
            genderList: [],
            retrunMsg: "string",
            roleId: data.mI_Id || 0
        };

        console.log('=== Activate/Deactivate Gender API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGenderResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Gender API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGenderResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Gender status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Gender API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGenderResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update gender status',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get onload details for master gender
 * POST /api/MasterGenderFacade/onloadgetdetails
 * Using axios directly
 */
export async function getOnloadDetails(roleId: number): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        // Hardcoded proxy URL for development - bypasses CORS issues
        // TODO: Update .env.dev and restart Next.js to use environment variable
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGenderFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            IVRMMG_Id: 0,
            MI_Id: 30,
            IVRMMG_GenderName: "string",
            IVRMMG_ActiveFlag: true,
            genderList: [],
            retrunMsg: "string",
            roleId: roleId
        };
        
        console.log('=== API Request Debug Info ===');
        console.log('Base URL from env:', baseURL);
        console.log('API Path:', apiPath);
        console.log('Full URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        console.log('Role ID:', roleId);

        const axiosResponse = await axios.post<MasterGenderResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000, // 10 second timeout
            validateStatus: function (status) {
                return status < 500; // Resolve only if the status code is less than 500
            }
        });
        
        console.log('=== API Response Debug Info ===');
        console.log('Response status:', axiosResponse.status);
        console.log('Response headers:', axiosResponse.headers);
        console.log('Response data:', axiosResponse.data);

        // Transform axios response to match ApiResponse format
        const response: ApiResponse<MasterGenderResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== API Error Debug Info ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error config:', error.config);
        
        if (axios.isAxiosError(error)) {
            console.error('Is Axios Error: Yes');
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            console.error('Response headers:', error.response?.headers);
            console.error('Request URL:', error.config?.url);
            console.error('Request method:', error.config?.method);
            console.error('Request data:', error.config?.data);
            
            const errorResponse: ApiResponse<MasterGenderResponse> = {
                success: false,
                message: error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message || 
                        'Failed to fetch onload details',
                data: null
            };
            return errorResponse;
        }
        
        console.error('Is Axios Error: No');
        throw error;
    }
}

/**
 * Get gender record by ID
 * GET /api/MasterGenderFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getGenderById(id: number): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterGenderFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Gender By ID API Request ===');
        console.log('Base URL:', baseURL);
        console.log('API Path:', apiPath);
        console.log('Full URL:', url);
        console.log('Gender ID:', id);

        const axiosResponse = await axios.get<MasterGenderResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Get Gender By ID API Response ===');
        console.log('Response status:', axiosResponse.status);
        console.log('Response data:', axiosResponse.data);

        const response: ApiResponse<MasterGenderResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Gender By ID API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        if (axios.isAxiosError(error)) {
            console.error('Is Axios Error: Yes');
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterGenderResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch gender by ID',
                data: null
            };
            return errorResponse;
        }
        
        console.error('Is Axios Error: No');
        throw error;
    }
}

/**
 * Test function to verify API connectivity
 */
export async function testMasterGenderAPI(roleId: number = 2): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        console.log('Testing Master Gender API connectivity...');
        const response = await getMasterGenderList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}
