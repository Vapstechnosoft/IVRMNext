// Master Employee Type API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterEmployeeTypeResponse,
    EmployeeTypeDetail,
    MasterEmployeeTypeInput,
    OnloadGetEmployeeTypeDetailsRequest,
    SaveEmployeeTypeRequest
} from '@/types/hrms/master-employee-type';

/**
 * Get onload details for master employee type
 * POST /api/MasterEmployeeTypeFacade/onloadgetdetails
 */
export async function getOnloadEmployeeTypeDetails(roleId: number = 0): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterEmployeeTypeFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetEmployeeTypeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMET_Id: 0,
            MI_Id: 30,
            HRMET_EmployeeType: "string",
            HRMET_ActiveFlag: true,
            employeeTypeList: [],
            retrunMsg: "string",
            roleId: roleId
        };
        
        console.log('=== Master Employee Type Onload API Request ===');
        console.log('Base URL:', baseURL);
        console.log('Full URL:', url);
        console.log('Role ID:', roleId);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const axiosResponse = await axios.post<MasterEmployeeTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Master Employee Type Onload API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));
        
        const response: ApiResponse<MasterEmployeeTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };
        
        console.log('Processed Response:', response);
        console.log('Response Success:', response.success);
        console.log('Response Message:', response.message);
        console.log('Response Data:', response.data);
        
        if (response.data) {
            console.log('Response Data Keys:', Object.keys(response.data));
            console.log('EmployeeTypeList:', response.data.employeeTypeList);
            console.log('EmployeeTypeList Length:', response.data.employeeTypeList?.length);
            
            if (response.data.employeeTypeList && response.data.employeeTypeList.length > 0) {
                console.log('First Employee Type Item:', response.data.employeeTypeList[0]);
                console.log('First Item Keys:', Object.keys(response.data.employeeTypeList[0]));
            }
        }
        
        return response;
    } catch (error: any) {
        console.error('=== Master Employee Type Onload API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterEmployeeTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch master employee type details',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get all master employee type records by role ID
 * GET /api/MasterEmployeeType/getalldetails/{roleId}
 */
export async function getMasterEmployeeTypeList(roleId: number): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    try {
        const url = `/api/MasterEmployeeType/getalldetails/${roleId}`;
        console.log('Fetching master employee type list from:', url);
        
        const response = await api.get<MasterEmployeeTypeResponse>(url);
        console.log('Master employee type list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master employee type list:', error);
        throw error;
    }
}

/**
 * Create or Update master employee type item
 * POST /api/MasterEmployeeTypeFacade
 * Using axios directly with proxy
 */
export async function saveMasterEmployeeType(data: MasterEmployeeTypeInput): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterEmployeeTypeFacade';
        const url = `${baseURL}${apiPath}`;
        
        const now = new Date().toISOString();
        const requestBody: SaveEmployeeTypeRequest = {
            CreatedDate: now,
            UpdatedDate: now,
            HRMET_Id: data.HRMET_Id || 0,
            MI_Id: data.MI_Id ?? 30,
            HRMET_EmployeeType: data.HRMET_EmployeeType,
            HRMET_ActiveFlag: data.HRMET_ActiveFlag,
            employeeTypeList: [
                {
                    CreatedDate: now,
                    UpdatedDate: now,
                    HRMET_Id: data.HRMET_Id || 0,
                    MI_Id: data.MI_Id ?? 30,
                    HRMET_EmployeeType: data.HRMET_EmployeeType,
                    HRMET_ActiveFlag: data.HRMET_ActiveFlag
                }
            ],
            retrunMsg: "string",
            roleId: data.MI_Id ?? 30
        };

        console.log('=== Save Employee Type API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterEmployeeTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Employee Type API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterEmployeeTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Employee Type saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Employee Type API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterEmployeeTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save employee type',
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
export async function testMasterEmployeeTypeAPI(roleId: number = 2): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    try {
        console.log('Testing Master Employee Type API connectivity...');
        const response = await getMasterEmployeeTypeList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master employee type record
 * POST /api/MasterEmployeeTypeFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterEmployeeType(data: { HRMET_Id: number; HRMET_ActiveFlag: boolean; MI_Id?: number }): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterEmployeeTypeFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const now = new Date().toISOString();
        const requestBody: SaveEmployeeTypeRequest = {
            CreatedDate: now,
            UpdatedDate: now,
            HRMET_Id: data.HRMET_Id,
            MI_Id: data.MI_Id ?? 30,
            HRMET_EmployeeType: "string",
            HRMET_ActiveFlag: data.HRMET_ActiveFlag,
            employeeTypeList: [
                {
                    CreatedDate: now,
                    UpdatedDate: now,
                    HRMET_Id: data.HRMET_Id,
                    MI_Id: data.MI_Id ?? 30,
                    HRMET_EmployeeType: "string",
                    HRMET_ActiveFlag: data.HRMET_ActiveFlag
                }
            ],
            retrunMsg: "string",
            roleId: data.MI_Id ?? 30
        };

        console.log('=== Activate/Deactivate Employee Type API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterEmployeeTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Employee Type API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterEmployeeTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Employee Type status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Employee Type API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterEmployeeTypeResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update employee type status',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}




