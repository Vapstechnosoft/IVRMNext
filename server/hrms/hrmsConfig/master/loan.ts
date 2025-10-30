import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type { MasterLoanDetail, MasterLoanInput, MasterLoanResponse } from '@/types/hrms/master-loan';
import axios from 'axios';

/**
 * Get onload details for master loan
 * POST /api/HRMasterLoanFacade/onloadgetdetails
 */
export async function getMasterLoanList(roleId: number): Promise<ApiResponse<MasterLoanResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HRMasterLoanFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMLN_Id: 0,
            MI_Id: 30,
            HRML_LoanType: 'string',
            HRML_Max: 0,
            HRMLN_ActiveFlag: true,
            gmasterloanList: [],
            retrunMsg: 'string',
            roleId: roleId,
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString()
        };

        const axiosResponse = await axios.post<MasterLoanResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterLoanResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Data fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master loan list:', error);
        throw error;
    }
}

/**
 * Save or Update master loan record
 * POST /api/HRMasterLoanFacade
 */
export async function saveMasterLoan(data: MasterLoanInput): Promise<ApiResponse<MasterLoanResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HRMasterLoanFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMLN_Id: data.HRMLN_Id || 0,
            MI_Id: 30,
            HRML_LoanType: data.HRML_LoanType,
            HRML_Max: Number(data.HRML_Max) || 0,
            HRMLN_ActiveFlag: data.HRMLN_ActiveFlag,
            gmasterloanList: [],
            retrunMsg: 'string',
            roleId: data.MI_Id || 0,
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString()
        };

        const axiosResponse = await axios.post<MasterLoanResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterLoanResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master loan:', error);
        throw error;
    }
}

/**
 * Get details of a specific master loan by ID
 * GET /api/MasterLoanFacade/getRecordById/{id}
 */
export async function getMasterLoanDetails(id: number): Promise<ApiResponse<MasterLoanResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterLoanFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.get<MasterLoanResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterLoanResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Loan details fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master loan details:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master loan record
 * POST /api/HRMasterLoanFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLoan(data: {
    HRMLN_Id: number;
    HRMLN_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterLoanResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/HRMasterLoanFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMLN_Id: data.HRMLN_Id,
            MI_Id: 30,
            HRML_LoanType: 'string',
            HRML_Max: 0,
            HRMLN_ActiveFlag: data.HRMLN_ActiveFlag,
            gmasterloanList: [],
            retrunMsg: 'string',
            roleId: 0,
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString()
        };

        const axiosResponse = await axios.post<MasterLoanResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterLoanResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Loan status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master loan:', error);
        throw error;
    }
}
