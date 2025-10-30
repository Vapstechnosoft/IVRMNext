// Master Group Type API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterGroupTypeResponse,
    GroupTypeDetail,
    MasterGroupTypeInput,
    OnloadGetGroupTypeDetailsRequest
} from '@/types/hrms/master-group-type';

/**
 * Get all master group type records by role ID
 * GET /api/MasterGroupType/getalldetails/{roleId}
 */
export async function getMasterGroupTypeList(roleId: number): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const url = `/api/MasterGroupType/getalldetails/${roleId}`;
        console.log('Fetching master group type list from:', url);
        
        const response = await api.get<MasterGroupTypeResponse>(url);
        console.log('Master group type list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master group type list:', error);
        throw error;
    }
}

/**
 * Create or Update a master group type record
 * POST /api/MasterGroupTypeFacade
 * Using axios directly with proxy
 */
export async function saveMasterGroupType(data: MasterGroupTypeInput): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupTypeFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetGroupTypeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMGT_Id: data.HRMGT_Id || 0,
            MI_Id: 30,
            HRMGT_EmployeeGroupType: data.HRMGT_EmployeeGroupType,
            HRMGT_Code: data.HRMGT_Code,
            HRMGT_Order: data.HRMGT_Order || 0,
            HRMGT_ActiveFlag: data.HRMGT_ActiveFlag,
            grouptypeList: [],
            retrunMsg: "string",
            roleId: data.MI_Id || 0,
            GroupTypeDTO: []
        };

        console.log('=== Save Group Type API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGroupTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Group Type API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Group type saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Group Type API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGroupTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save group type',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Activate or Deactivate a master group type record
 * POST /api/MasterGroupTypeFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterGroupType(data: { HRMGT_Id: number; HRMGT_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupTypeFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetGroupTypeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMGT_Id: data.HRMGT_Id,
            MI_Id: 30,
            HRMGT_EmployeeGroupType: "string",
            HRMGT_Code: "string",
            HRMGT_Order: 0,
            HRMGT_ActiveFlag: data.HRMGT_ActiveFlag,
            grouptypeList: [],
            retrunMsg: "string",
            roleId: data.roleId || 0,
            GroupTypeDTO: []
        };

        console.log('=== Activate/Deactivate Group Type API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGroupTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Group Type API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Group type ${data.HRMGT_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Group Type API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGroupTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update group type status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get group type record by ID
 * GET /api/MasterGroupTypeFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getGroupTypeById(id: number): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterGroupTypeFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Group Type By ID API Request ===');
        console.log('URL:', url);
        console.log('Group Type ID:', id);

        const axiosResponse = await axios.get<MasterGroupTypeResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Get Group Type By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Group Type By ID API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterGroupTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch group type by ID',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get onload details for master group type
 * POST /api/MasterGroupTypeFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadGroupTypeDetails(roleId: number): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupTypeFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetGroupTypeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMGT_Id: 0,
            MI_Id: 30,
            HRMGT_EmployeeGroupType: "string",
            HRMGT_Code: "string",
            HRMGT_Order: 0,
            HRMGT_ActiveFlag: true,
            grouptypeList: [],
            retrunMsg: "string",
            roleId: roleId,
            GroupTypeDTO: []
        };
        
        console.log('=== Onload Group Type Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGroupTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Group Type Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Group types loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Group Type Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGroupTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load group types',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get onchange details for master group type
 * POST /api/MasterGroupTypeFacade/Onchangedetails
 * Using axios directly with proxy
 */
export async function getOnchangeGroupTypeDetails(groupTypeId: number, roleId: number): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupTypeFacade/Onchangedetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetGroupTypeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMGT_Id: groupTypeId,
            MI_Id: roleId,
            HRMGT_EmployeeGroupType: "string",
            HRMGT_Code: "string",
            HRMGT_Order: 0,
            HRMGT_ActiveFlag: true,
            grouptypeList: [],
            retrunMsg: "string",
            roleId: roleId,
            GroupTypeDTO: []
        };
        
        console.log('=== Onchange Group Type Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGroupTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onchange Group Type Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Group type details fetched successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onchange Group Type Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGroupTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch group type details',
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
export async function testMasterGroupTypeAPI(roleId: number = 2): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        console.log('Testing Master Group Type API connectivity...');
        const response = await getMasterGroupTypeList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}








