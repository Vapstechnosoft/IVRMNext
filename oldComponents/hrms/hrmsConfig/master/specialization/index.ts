// Master Specialization API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterSpecializationResponse,
    SpecializationItem,
    MasterSpecializationInput,
    OnloadGetDetailsRequest,
    SaveSpecializationRequest
} from '@/types/hrms/master-specialization';

/**
 * Get all master specialization records by role ID
 * GET /api/MasterSpecialization/getalldetails/{roleId}
 */
export async function getMasterSpecializationList(roleId: number): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const url = `/api/MasterSpecialization/getalldetails/${roleId}`;
        console.log('Fetching master specialization list from:', url);
        
        const response = await api.get<MasterSpecializationResponse>(url);
        console.log('Master specialization list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master specialization list:', error);
        throw error;
    }
}
 
/**
 * Create or Update master specialization item
 * POST /api/masterSpecialisationFacade/savedata
 * Using axios directly with proxy
 */
export async function saveMasterSpecialization(data: MasterSpecializationInput): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/masterSpecialisationFacade/savedata';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveSpecializationRequest = {
            HRMSPL_Id: data.hrmspl_Id || 0,
            MI_Id: 30,
            UserId: 0,
            HRMSPL_SpecialisationName: data.hrmspl_SpecialisationName,
            HRMSPL_ActiveFlg: data.hrmspl_ActiveFlg,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: new Date().toISOString(),
            HRMSPL_UpdatedDate: new Date().toISOString(),
            alldata: [],
            editlist: [],
            duplicate: false,
            msg: "string",
            returnval: true
        };

        console.log('=== Save Specialization API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterSpecializationResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Specialization API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterSpecializationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Specialization saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Specialization API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterSpecializationResponse> = {
                success: false,
                message: error.response?.data?.msg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save specialization',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Edit/Update an existing master specialization record
 * POST /api/masterSpecialisationFacade/EditData
 */
export async function editMasterSpecialization(data: MasterSpecializationInput): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/masterSpecialisationFacade/EditData';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveSpecializationRequest = {
            HRMSPL_Id: data.hrmspl_Id || 0,
            MI_Id: 30,
            UserId: 0,
            HRMSPL_SpecialisationName: data.hrmspl_SpecialisationName,
            HRMSPL_ActiveFlg: data.hrmspl_ActiveFlg,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: new Date().toISOString(),
            HRMSPL_UpdatedDate: new Date().toISOString(),
            alldata: [],
            editlist: [],
            duplicate: false,
            msg: "string",
            returnval: true
        };

        console.log('=== Edit Specialization API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterSpecializationResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Edit Specialization API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterSpecializationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Specialization updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Edit Specialization API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterSpecializationResponse> = {
                success: false,
                message: error.response?.data?.msg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update specialization',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Activate or Deactivate a master specialization record
 * POST /api/masterSpecialisationFacade/masterDecative
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterSpecialization(data: { hrmspl_Id: number; hrmspl_ActiveFlg: boolean; mI_Id?: number }): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/masterSpecialisationFacade/masterDecative';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveSpecializationRequest = {
            HRMSPL_Id: data.hrmspl_Id,
            MI_Id: 30,
            UserId: 0,
            HRMSPL_SpecialisationName: "string",
            HRMSPL_ActiveFlg: data.hrmspl_ActiveFlg,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: new Date().toISOString(),
            HRMSPL_UpdatedDate: new Date().toISOString(),
            alldata: [],
            editlist: [],
            duplicate: false,
            msg: "string",
            returnval: true
        };

        console.log('=== Activate/Deactivate Specialization API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterSpecializationResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Specialization API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterSpecializationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.msg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Specialization status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Specialization API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterSpecializationResponse> = {
                success: false,
                message: error.response?.data?.msg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update specialization status',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get onload details for master specialization
 * POST /api/masterSpecialisationFacade/loaddata
 * Using axios directly
 */
export async function getOnloadDetails(roleId: number): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/masterSpecialisationFacade/loaddata';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetDetailsRequest = {
            HRMSPL_Id: 0,
            MI_Id: 30,
            UserId: roleId,
            HRMSPL_SpecialisationName: "string",
            HRMSPL_ActiveFlg: true,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: new Date().toISOString(),
            HRMSPL_UpdatedDate: new Date().toISOString(),
            alldata: [],
            editlist: [],
            duplicate: false,
            msg: "string",
            returnval: true
        };
        
        console.log('=== API Request Debug Info ===');
        console.log('Base URL from env:', baseURL);
        console.log('API Path:', apiPath);
        console.log('Full URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        console.log('Role ID:', roleId);

        const axiosResponse = await axios.post<MasterSpecializationResponse>(url, requestBody, {
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
        const response: ApiResponse<MasterSpecializationResponse> = {
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
            
            const errorResponse: ApiResponse<MasterSpecializationResponse> = {
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
 * Get specialization record by ID
 * GET /api/MasterSpecializationFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getSpecializationById(id: number): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterSpecializationFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Specialization By ID API Request ===');
        console.log('Base URL:', baseURL);
        console.log('API Path:', apiPath);
        console.log('Full URL:', url);
        console.log('Specialization ID:', id);

        const axiosResponse = await axios.get<MasterSpecializationResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Get Specialization By ID API Response ===');
        console.log('Response status:', axiosResponse.status);
        console.log('Response data:', axiosResponse.data);

        const response: ApiResponse<MasterSpecializationResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`,
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Specialization By ID API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        if (axios.isAxiosError(error)) {
            console.error('Is Axios Error: Yes');
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterSpecializationResponse> = {
                success: false,
                message: error.response?.data?.msg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch specialization by ID',
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
export async function testMasterSpecializationAPI(roleId: number = 2): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        console.log('Testing Master Specialization API connectivity...');
        const response = await getMasterSpecializationList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}

