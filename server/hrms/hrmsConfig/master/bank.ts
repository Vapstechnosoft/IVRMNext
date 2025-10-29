import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type { BankItem, MasterBankInput, MasterBankResponse } from '@/types/hrms/master-bank';
import axios from 'axios';

/**
 * Get onload details for master bank
 * POST /api/MasterBankFacade/onloadgetdetails
 */
export async function getMasterBankList(roleId: number): Promise<ApiResponse<MasterBankResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterBankFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMBD_Id: 0,
            MI_Id: 30,
            HRMBD_BankName: 'string',
            HRMBD_BankAccountNo: 'string',
            HRMBD_BankAddress: 'string',
            HRMBD_BranchName: 'string',
            HRMBD_IFSCCode: 'string',
            HRMBD_ActiveFlag: true,
            bankdetailList: [],
            retrunMsg: 'string',
            roleId: roleId
        };

        const axiosResponse = await axios.post<MasterBankResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterBankResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Data fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master bank list:', error);
        throw error;
    }
}

/**
 * Save or Update master bank record
 * POST /api/MasterBankFacade
 */
export async function saveMasterBank(data: MasterBankInput): Promise<ApiResponse<MasterBankResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterBankFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMBD_Id: data.HRMBD_Id || 0,
            MI_Id: data.MI_Id,
            HRMBD_BankName: data.HRMBD_BankName,
            HRMBD_BankAccountNo: data.HRMBD_BankAccountNo,
            HRMBD_BankAddress: data.HRMBD_BankAddress,
            HRMBD_BranchName: data.HRMBD_BranchName,
            HRMBD_IFSCCode: data.HRMBD_IFSCCode,
            HRMBD_ActiveFlag: data.HRMBD_ActiveFlag,
            bankdetailList: [],
            retrunMsg: 'string',
            roleId: data.MI_Id
        };

        const axiosResponse = await axios.post<MasterBankResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterBankResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master bank:', error);
        throw error;
    }
}

/**
 * Activate/Deactivate a master bank record
 * PUT /api/MasterBank/activate-deactivate
 */
export async function activateDeactivateMasterBank(data: {
    HRMBD_Id: number;
    HRMBD_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterBankResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterBank/activate-deactivate';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMBD_Id: data.HRMBD_Id,
            HRMBD_ActiveFlag: data.HRMBD_ActiveFlag,
            MI_Id: data.MI_Id || 0
        };

        const axiosResponse = await axios.put<MasterBankResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000
        });

        const response: ApiResponse<MasterBankResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Status updated successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master bank:', error);
        throw error;
    }
}

/**
 * Get details of a specific master bank by ID
 * GET /api/MasterBank/details/{id}
 */
export async function getMasterBankDetails(id: number): Promise<ApiResponse<BankItem>> {
    try {
        const url = `/api/MasterBank/details/${id}`;
        const response = await api.get<BankItem>('default', url);
        return response;
    } catch (error) {
        console.error('Error fetching master bank details:', error);
        throw error;
    }
}
