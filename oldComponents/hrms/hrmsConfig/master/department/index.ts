// Master Department API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterDepartmentResponse,
    DepartmentDetail,
    MasterDepartmentInput,
    OnloadGetDepartmentDetailsRequest,
    SaveDepartmentRequest
} from '@/types/hrms/master-department';

/**
 * Get all master department records by role ID
 * GET /api/MasterDepartment/getalldetails/{roleId}
 */
export async function getMasterDepartmentList(roleId: number): Promise<ApiResponse<MasterDepartmentResponse>> {
    try {
        const url = `/api/MasterDepartment/getalldetails/${roleId}`;
        console.log('Fetching master department list from:', url);
        
        const response = await api.get<MasterDepartmentResponse>(url);
        console.log('Master department list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master department list:', error);
        throw error;
    }
}

/**
 * Create a new master department record
 * POST /api/MasterDepartmentFacade
 * Using axios directly with proxy
 */
export async function saveMasterDepartment(data: MasterDepartmentInput): Promise<ApiResponse<MasterDepartmentResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterDepartmentFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveDepartmentRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMD_Id: data.HRMD_Id || 0,
            MI_Id: 30,
            HRMD_DepartmentName: data.HRMD_DepartmentName,
            HRMD_Order: data.HRMD_Order || 0,
            HRMD_ActiveFlag: data.HRMD_ActiveFlag,
            departmentList: [],
            retrunMsg: "string",
            HRMDC_ID: 0,
            roleId: data.MI_Id,
            HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs,
            DeraptmentDTO: []
        };

        console.log('=== Save Department API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Department API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDepartmentResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Department saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Department API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDepartmentResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save department',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}


/**
 * Activate or Deactivate a master department record
 * POST /api/MasterDepartmentFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterDepartment(data: { HRMD_Id: number; HRMD_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterDepartmentResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterDepartmentFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: SaveDepartmentRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMD_Id: data.HRMD_Id,
            MI_Id: 30,
            HRMD_DepartmentName: "string",
            HRMD_Order: 0,
            HRMD_ActiveFlag: data.HRMD_ActiveFlag,
            departmentList: [],
            retrunMsg: "string",
            HRMDC_ID: 0,
            roleId: data.roleId || 0,
            HRMD_InternalTrainingMinimumHrs: 0,
            DeraptmentDTO: []
        };

        console.log('=== Activate/Deactivate Department API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Department API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDepartmentResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Department status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Department API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDepartmentResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update department status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get onload details for master department
 * POST /api/MasterDepartmentFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadDepartmentDetails(roleId: number): Promise<ApiResponse<MasterDepartmentResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterDepartmentFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetDepartmentDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMD_Id: 0,
            MI_Id: 30,
            HRMD_DepartmentName: "string",
            HRMD_Order: 0,
            HRMD_ActiveFlag: true,
            departmentList: [],
            retrunMsg: "string",
            HRMDC_ID: 0,
            roleId: roleId,
            HRMD_InternalTrainingMinimumHrs: 0,
            DeraptmentDTO: []
        };
        
        console.log('=== Onload Department Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Department Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDepartmentResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Departments loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Department Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDepartmentResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load departments',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get department record by ID
 * GET /api/MasterDepartmentFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getDepartmentById(id: number): Promise<ApiResponse<MasterDepartmentResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterDepartmentFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Department By ID API Request ===');
        console.log('URL:', url);
        console.log('Department ID:', id);

        const axiosResponse = await axios.get<MasterDepartmentResponse>(url, {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Get Department By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterDepartmentResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Department fetched successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Department By ID API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterDepartmentResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch department',
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
export async function testMasterDepartmentAPI(roleId: number = 2): Promise<ApiResponse<MasterDepartmentResponse>> {
    try {
        console.log('Testing Master Department API connectivity...');
        const response = await getMasterDepartmentList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}








