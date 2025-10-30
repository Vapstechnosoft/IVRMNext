import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type {
    MasterProfessionalTaxInput,
    MasterProfessionalTaxResponse,
    ProfessionalTaxDetail
} from '@/types/hrms/master-professional-tax';
import axios from 'axios';

/**
 * Get onload details for master professional tax
 * POST /api/MasterProfessionalTaxFacade/onloadgetdetails
 */
export async function getMasterProfessionalTaxList(roleId: number): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterProfessionalTaxFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMPT_Id: 0,
            MI_Id: 30,
            HRMPT_SalaryFrom: 0,
            HRMPT_SalaryTo: 0,
            HRMPT_PTax: 0,
            HRMPT_ActiveFlag: true,
            pTaxrList: [],
            retrunMsg: 'string',
            roleId: roleId,
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString()
        };

        const axiosResponse = await axios.post<MasterProfessionalTaxResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Data fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master professional tax list:', error);
        throw error;
    }
}

/**
 * Save or Update master professional tax record
 * POST /api/MasterProfessionalTaxFacade
 */
export async function saveMasterProfessionalTax(data: MasterProfessionalTaxInput): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterProfessionalTaxFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMPT_Id: data.HRMPT_Id || 0,
            MI_Id: 30,
            HRMPT_SalaryFrom: Number(data.HRMPT_SalaryFrom) || 0,
            HRMPT_SalaryTo: Number(data.HRMPT_SalaryTo) || 0,
            HRMPT_PTax: Number(data.HRMPT_PTax) || 0,
            HRMPT_ActiveFlag: data.HRMPT_ActiveFlag ?? true,
            pTaxrList: [],
            retrunMsg: 'string',
            roleId: data.MI_Id || 30
        };

        const axiosResponse = await axios.post<MasterProfessionalTaxResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master professional tax:', error);
        throw error;
    }
}

/**
 * Get details of a specific master professional tax by ID
 * GET /api/MasterProfessionalTaxFacade/getRecordById/{id}
 */
export async function getMasterProfessionalTaxDetails(id: number): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterProfessionalTaxFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.get<MasterProfessionalTaxResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Professional tax details fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master professional tax details:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master professional tax record
 * POST /api/MasterProfessionalTaxFacade/deactivateRecordById
 */
export async function activateDeactivateMasterProfessionalTax(data: {
    HRMPT_Id: number;
    HRMPT_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterProfessionalTaxResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterProfessionalTaxFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMPT_Id: data.HRMPT_Id,
            MI_Id: 30,
            HRMPT_SalaryFrom: 0,
            HRMPT_SalaryTo: 0,
            HRMPT_PTax: 0,
            HRMPT_ActiveFlag: data.HRMPT_ActiveFlag,
            pTaxrList: [],
            retrunMsg: 'string',
            roleId: 0,
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString()
        };

        const axiosResponse = await axios.post<MasterProfessionalTaxResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterProfessionalTaxResponse> = {
            success: isSuccess,
            message:
                axiosResponse.data.retrunMsg ||
                (isSuccess ? 'Professional tax status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master professional tax:', error);
        throw error;
    }
}
