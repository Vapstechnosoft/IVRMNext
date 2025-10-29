import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type { MasterSpecializationInput, MasterSpecializationResponse, SpecializationItem } from '@/types/hrms/master-specialization';
import axios from 'axios';

/**
 * Get all master specialization records (onload)
 * POST /api/masterSpecialisationFacade/loaddata
 */
export async function getMasterSpecializationList(roleId: number): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/masterSpecialisationFacade/loaddata';
        const url = `${baseURL}${apiPath}`;

        const requestBody: OnloadGetDetailsRequest = {
            HRMSPL_Id: 0,
            MI_Id: 30,
            UserId: roleId,
            HRMSPL_SpecialisationName: 'string',
            HRMSPL_ActiveFlg: true,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: new Date().toISOString(),
            HRMSPL_UpdatedDate: new Date().toISOString(),
            alldata: [],
            editlist: [],
            duplicate: false,
            msg: 'string',
            returnval: true
        };

        const axiosResponse = await axios.post<MasterSpecializationResponse>(url, requestBody, {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        return {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data.msg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Specializations loaded successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };
    } catch (error) {
        console.error('Error fetching master specialization list:', error);
        throw error;
    }
}

/**
 * Create or Update master specialization item
 * POST /api/MasterSpecializationFacade
 */
export async function saveMasterSpecialization(data: MasterSpecializationInput): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterSpecializationFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMSPL_Id: data.HRMSPL_Id || 0,
            MI_Id: 30,
            UserId: 0,
            HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName,
            HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: new Date().toISOString(),
            HRMSPL_UpdatedDate: new Date().toISOString(),
            alldata: [],
            editlist: [],
            duplicate: false,
            msg: '',
            returnval: true
        };

        const axiosResponse = await axios.post<MasterSpecializationResponse>(url, requestBody, {
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
            (!axiosResponse.data.msg || !axiosResponse.data.msg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterSpecializationResponse> = {
            success: isSuccess,
            message: axiosResponse.data.msg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master specialization:', error);
        throw error;
    }
}

/**
 * Get details of a specific master specialization by ID
 * GET /api/MasterSpecialization/details/{id}
 */
export async function getMasterSpecializationDetails(id: number): Promise<ApiResponse<SpecializationItem>> {
    try {
        const url = `/api/MasterSpecialization/details/${id}`;
        const response = await api.get<SpecializationItem>('default', url);
        return response;
    } catch (error) {
        console.error('Error fetching master specialization details:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master specialization record
 * POST /api/masterSpecialisationFacade/deactivateRecordById
 */
export async function activateDeactivateMasterSpecialization(data: {
    HRMSPL_Id: number;
    HRMSPL_ActiveFlg: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterSpecializationResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/masterSpecialisationFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMSPL_Id: data.HRMSPL_Id,
            MI_Id: 30,
            UserId: 0,
            HRMSPL_SpecialisationName: 'string',
            HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
            HRMSPL_CreatedBy: 0,
            HRMSPL_UpdatedBy: 0,
            HRMSPL_CreatedDate: new Date().toISOString(),
            HRMSPL_UpdatedDate: new Date().toISOString(),
            alldata: [],
            editlist: [],
            duplicate: false,
            msg: 'string',
            returnval: true
        };

        const axiosResponse = await axios.post<MasterSpecializationResponse>(url, requestBody, {
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
            (!axiosResponse.data.msg || !axiosResponse.data.msg.toLowerCase().includes('error'));

        const response: ApiResponse<MasterSpecializationResponse> = {
            success: isSuccess,
            message: axiosResponse.data.msg || (isSuccess ? 'Specialization status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master specialization:', error);
        throw error;
    }
}
