// Master Professional Tax API Integration

import { api, ApiResponse } from '@/lib/apiService';
import axios from 'axios';
import { env } from '@/env';
import type { 
    MasterProfessionalTaxResponse,
    ProfessionalTaxDetail,
    MasterProfessionalTaxInput,
    OnloadGetProfessionalTaxDetailsRequest
} from '@/types/hrms/master-professional-tax';

/**
 * Get all master professional tax records by role ID
 * GET /api/MasterProfessionalTax/getalldetails/{roleId}
 */
export async function getMasterProfessionalTaxList(roleId: number): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const url = `/api/MasterProfessionalTax/getalldetails/${roleId}`;
        console.log('Fetching master professional tax list from:', url);
        
        const response = await api.get<MasterProfessionalTaxResponse>(url);
        console.log('Master professional tax list response:', response);
        
        return response;
    } catch (error) {
        console.error('Error fetching master professional tax list:', error);
        throw error;
    }
}

/**
 * Create or Update a master professional tax record
 * POST /api/MasterProfessionalTaxFacade
 * Using axios directly with proxy
 */
export async function saveMasterProfessionalTax(data: MasterProfessionalTaxInput): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterProfessionalTaxFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetProfessionalTaxDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMPT_Id: data.hrmpT_Id || 0,
            MI_Id: 30,
            HRMPT_SalaryFrom: data.hrmpT_SalaryFrom,
            HRMPT_SalaryTo: data.hrmpT_SalaryTo,
            HRMPT_PTax: data.hrmpT_PTax,
            HRMPT_ActiveFlag: data.hrmpT_ActiveFlag,
            pTaxrList: [],
            retrunMsg: "string",
            roleId: data.mI_Id || 0
        };

        console.log('=== Save Professional Tax API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterProfessionalTaxResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Save Professional Tax API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        // Check if retrunMsg indicates an error
        const isSuccess = axiosResponse.status >= 200 && axiosResponse.status < 300 && 
                         (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Professional tax saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Save Professional Tax API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterProfessionalTaxResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save professional tax',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Activate or Deactivate a master professional tax record
 * POST /api/MasterProfessionalTaxFacade/deactivateRecordById
 * Using axios directly with proxy
 */
export async function activateDeactivateMasterProfessionalTax(data: { HRMPT_Id: number; HRMPT_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterProfessionalTaxFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetProfessionalTaxDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMPT_Id: data.HRMPT_Id,
            MI_Id: 30,
            HRMPT_SalaryFrom: 0,
            HRMPT_SalaryTo: 0,
            HRMPT_PTax: 0,
            HRMPT_ActiveFlag: data.HRMPT_ActiveFlag,
            pTaxrList: [],
            retrunMsg: "string",
            roleId: data.roleId || 0
        };

        console.log('=== Activate/Deactivate Professional Tax API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterProfessionalTaxResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Activate/Deactivate Professional Tax API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Professional tax ${data.HRMPT_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Activate/Deactivate Professional Tax API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterProfessionalTaxResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update professional tax status',
                data: null
            };
            return errorResponse;
        }

        throw error;
    }
}

/**
 * Get professional tax record by ID
 * GET /api/MasterProfessionalTaxFacade/getRecordById/{id}
 * Using axios directly with proxy
 */
export async function getProfessionalTaxById(id: number): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterProfessionalTaxFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Get Professional Tax By ID API Request ===');
        console.log('URL:', url);
        console.log('Professional Tax ID:', id);

        const axiosResponse = await axios.get<MasterProfessionalTaxResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Get Professional Tax By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Get Professional Tax By ID API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterProfessionalTaxResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch professional tax by ID',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get onload details for master professional tax
 * POST /api/MasterProfessionalTaxFacade/onloadgetdetails
 * Using axios directly with proxy
 */
export async function getOnloadProfessionalTaxDetails(roleId: number): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterProfessionalTaxFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: OnloadGetProfessionalTaxDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMPT_Id: 0,
            MI_Id: 30,
            HRMPT_SalaryFrom: 0,
            HRMPT_SalaryTo: 0,
            HRMPT_PTax: 0,
            HRMPT_ActiveFlag: true,
            pTaxrList: [],
            retrunMsg: "string",
            roleId: roleId
        };
        
        console.log('=== Onload Professional Tax Details API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterProfessionalTaxResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('=== Onload Professional Tax Details API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Data:', axiosResponse.data);

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Professional tax slabs loaded successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Onload Professional Tax Details API Error ===');
        console.error('Error:', error);
        
        if (axios.isAxiosError(error)) {
            const errorResponse: ApiResponse<MasterProfessionalTaxResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load professional tax slabs',
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
export async function testMasterProfessionalTaxAPI(roleId: number = 2): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        console.log('Testing Master Professional Tax API connectivity...');
        const response = await getMasterProfessionalTaxList(roleId);
        console.log('API Test Result:', response);
        return response;
    } catch (error) {
        console.error('API Test Failed:', error);
        throw error;
    }
}
