// Master Bank API Integration

import axios from 'axios';
import { env } from '@/env';
import { ApiResponse } from '@/lib/apiService';
import type { 
    MasterBankRequest,
    MasterBankResponse
} from '@/types/hrms/master-bank';

// Master Bank Input interface (defined locally to avoid circular dependency)
export interface MasterBankInput {
    HRMBD_Id?: number;
    MI_Id?: number;
    HRMBD_BankName: string;
    HRMBD_BankAccountNo: string;
    HRMBD_BankAddress: string;
    HRMBD_BranchName: string;
    HRMBD_IFSCCode: string;
    HRMBD_ActiveFlag: boolean;
    roleId?: number;
}

/**
 * Get onload details for master bank
 * POST /api/MasterBankFacade/onloadgetdetails
 */
export async function getOnloadBankDetails(roleId: number = 0): Promise<ApiResponse<MasterBankResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterBankFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: MasterBankRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMBD_Id: 0,
            MI_Id: 30,
            HRMBD_BankName: "string",
            HRMBD_BankAccountNo: "string",
            HRMBD_BankAddress: "string",
            HRMBD_BranchName: "string",
            HRMBD_IFSCCode: "string",
            HRMBD_ActiveFlag: true,
            bankdetailList: [],
            retrunMsg: "string",
            roleId: roleId
        };
        
        console.log('=== Master Bank Onload API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterBankResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Master Bank Onload API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterBankResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Master Bank Onload API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterBankResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch master bank details',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Save or Update master bank record
 * POST /api/MasterBankFacade
 * If HRMBD_Id is 0, creates new record; otherwise updates existing record
 */
export async function saveMasterBank(data: MasterBankInput): Promise<ApiResponse<MasterBankResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterBankFacade';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: MasterBankRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMBD_Id: data.HRMBD_Id || 0,
            MI_Id: 30,
            HRMBD_BankName: data.HRMBD_BankName,
            HRMBD_BankAccountNo: data.HRMBD_BankAccountNo,
            HRMBD_BankAddress: data.HRMBD_BankAddress,
            HRMBD_BranchName: data.HRMBD_BranchName,
            HRMBD_IFSCCode: data.HRMBD_IFSCCode,
            HRMBD_ActiveFlag: data.HRMBD_ActiveFlag,
            bankdetailList: [],
            retrunMsg: "string",
            roleId: data.roleId || 0
        };
        
        console.log('=== Master Bank Save API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterBankResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Master Bank Save API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterBankResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Bank saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Master Bank Save API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterBankResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to save master bank',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Get bank record by ID
 * GET /api/MasterBankFacade/getRecordById/{id}
 */
export async function getBankById(id: number): Promise<ApiResponse<MasterBankResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterBankFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;
        
        console.log('=== Master Bank Get By ID API Request ===');
        console.log('URL:', url);
        console.log('Bank ID:', id);

        const axiosResponse = await axios.get<MasterBankResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Master Bank Get By ID API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterBankResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Master Bank Get By ID API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterBankResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch bank by ID',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}

/**
 * Activate or Deactivate a master bank record
 * POST /api/MasterBankFacade/deactivateRecordById
 */
export async function activateDeactivateMasterBank(data: { HRMBD_Id: number; HRMBD_ActiveFlag: boolean; roleId?: number }): Promise<ApiResponse<MasterBankResponse>> {
    try {
        const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterBankFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;
        
        const requestBody: MasterBankRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMBD_Id: data.HRMBD_Id,
            MI_Id: 30,
            HRMBD_BankName: "string",
            HRMBD_BankAccountNo: "string",
            HRMBD_BankAddress: "string",
            HRMBD_BranchName: "string",
            HRMBD_IFSCCode: "string",
            HRMBD_ActiveFlag: data.HRMBD_ActiveFlag,
            bankdetailList: [],
            retrunMsg: "string",
            roleId: data.roleId || 0
        };
        
        console.log('=== Master Bank Activate/Deactivate API Request ===');
        console.log('URL:', url);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const axiosResponse = await axios.post<MasterBankResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('=== Master Bank Activate/Deactivate API Response ===');
        console.log('Status:', axiosResponse.status);
        console.log('Response data:', JSON.stringify(axiosResponse.data, null, 2));

        const response: ApiResponse<MasterBankResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data?.retrunMsg || (axiosResponse.status >= 200 && axiosResponse.status < 300 ? `Bank ${data.HRMBD_ActiveFlag ? 'activated' : 'deactivated'} successfully` : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error: any) {
        console.error('=== Master Bank Activate/Deactivate API Error ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            
            const errorResponse: ApiResponse<MasterBankResponse> = {
                success: false,
                message: error.response?.data?.retrunMsg || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to update bank status',
                data: null
            };
            return errorResponse;
        }
        
        throw error;
    }
}
