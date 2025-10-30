// Master Grade API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterGradeResponse,
    GradeDetail,
    MasterGradeInput,
    OnchangeGradeDetailsRequest
} from '@/types/hrms/master-grade';

/**
 * Get all master grade records by role ID
 * GET /api/MasterGrade/getalldetails/{roleId}
 */
export async function getMasterGradeList(roleId: number): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        const url = `/api/MasterGrade/getalldetails/${roleId}`;
        console.log('Fetching master grade list from:', url);
        
        const response = await api.get<MasterGradeResponse>(url);
        console.log('Master grade list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master grade list:', error);
        throw error;
    }
}

/**
 * Create or Update a master grade record
 * POST /api/MasterGradeFacade
 * Using axios directly with proxy
 */
export async function saveMasterGrade(data: MasterGradeInput): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGradeFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnchangeGradeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMG_Id: data.HRMG_Id || 0,
            MI_Id: 30,
            HRMG_GradeName: data.HRMG_GradeName,
            HRMG_GradeDisplayName: data.HRMG_GradeDisplayName,
            HRMG_PayScaleRange: `${data.HRMG_PayScaleFrom}-${data.HRMG_IncrementOf}-${data.HRMG_PayScaleTo}`,
            HRMG_PayScaleFrom: data.HRMG_PayScaleFrom,
            HRMG_IncrementOf: data.HRMG_IncrementOf,
            HRMG_PayScaleTo: data.HRMG_PayScaleTo,
            HRMG_Order: data.HRMG_Order || 0,
            HRMG_ActiveFlag: data.HRMG_ActiveFlag,
            gradelList: [],
            retrunMsg: "string",
            roleId: data.MI_Id || 0,
            GradeDTO: []
        };

        console.log('=== Save Grade API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Grade API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterGradeResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Grade saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Grade API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGradeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save grade',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Activate or Deactivate a master grade record
 * POST /api/MasterGradeFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterGrade(data: { HRMG_Id: number; HRMG_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGradeFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnchangeGradeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMG_Id: data.HRMG_Id,
            MI_Id: 30,
            HRMG_GradeName: "string",
            HRMG_GradeDisplayName: "string",
            HRMG_PayScaleRange: "string",
            HRMG_PayScaleFrom: 0,
            HRMG_IncrementOf: 0,
            HRMG_PayScaleTo: 0,
            HRMG_Order: 0,
            HRMG_ActiveFlag: data.HRMG_ActiveFlag,
            gradelList: [],
            retrunMsg: "string",
            roleId: data.roleId || 0,
            GradeDTO: []
        };

        console.log('=== Activate/Deactivate Grade API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Grade API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGradeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Grade ${data.HRMG_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Grade API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGradeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update grade status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get onload details for master grade
 * POST /api/MasterGradeFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadGradeDetails(roleId: number): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGradeFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnchangeGradeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMG_Id: 0,
            MI_Id: 30,
            HRMG_GradeName: "string",
            HRMG_GradeDisplayName: "string",
            HRMG_PayScaleRange: "string",
            HRMG_PayScaleFrom: 0,
            HRMG_IncrementOf: 0,
            HRMG_PayScaleTo: 0,
            HRMG_Order: 0,
            HRMG_ActiveFlag: true,
            gradelList: [],
            retrunMsg: "string",
            roleId: roleId,
            GradeDTO: []
        };
        
        console.log('=== Onload Grade Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Grade Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGradeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Grades loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Grade Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGradeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load grades',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get grade record by ID
 * GET /api/MasterGradeFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getGradeById(id: number): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterGradeFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Grade By ID API Request ===');
        console.log('URL:', url);
        console.log('Grade ID:', id);

        const axiosResponse = await axios.get<MasterGradeResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Get Grade By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterGradeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Grade By ID API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterGradeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch grade by ID',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get onchange details for master grade
 * POST /api/MasterGradeFacade/Onchangedetails
 * Using axios directly with proxy
 */
export async function getOnchangeGradeDetails(gradeId: number, roleId: number): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGradeFacade/Onchangedetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnchangeGradeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMG_Id: gradeId,
            MI_Id: 30,
            HRMG_GradeName: "string",
            HRMG_GradeDisplayName: "string",
            HRMG_PayScaleRange: "string",
            HRMG_PayScaleFrom: 0,
            HRMG_IncrementOf: 0,
            HRMG_PayScaleTo: 0,
            HRMG_Order: 0,
            HRMG_ActiveFlag: true,
            gradelList: [],
            retrunMsg: "string",
            roleId: roleId,
            GradeDTO: []
        };
        
        console.log('=== Onchange Grade Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onchange Grade Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterGradeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Grade details fetched successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onchange Grade Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterGradeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch grade details',
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
export async function testMasterGradeAPI(roleId: number = 2): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        console.log('Testing Master Grade API connectivity...');
        const response = await getMasterGradeList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}








