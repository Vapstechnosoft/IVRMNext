import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type { MasterMaritalStatusInput, MasterMaritalStatusResponse } from '@/types/hrms/master-marital-status';
import axios from 'axios';

export async function getMasterMaritalStatusList(roleId: number): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterMaritalStatusFacade/onloadgetdetails';
    const url = `${baseURL}${apiPath}`;

    const requestBody: OnloadGetMaritalStatusDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMMS_Id: 0,
        MI_Id: 30,
        IVRMMMS_MaritalStatus: 'string',
        IVRMMMS_ActiveFlag: true,
        maritalstatusList: [],
        retrunMsg: 'string',
        roleId: roleId
    };

    const axiosResponse = await axios.post<MasterMaritalStatusResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Marital statuses loaded successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterMaritalStatus(data: MasterMaritalStatusInput): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterMaritalStatusFacade`;

    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMMS_Id: data.IVRMMMS_Id || 0,
        MI_Id: 30,
        IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus,
        IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
        maritalstatusList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0
    };

    const axiosResponse = await axios.post<MasterMaritalStatusResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    const isSuccess =
        axiosResponse.status >= 200 &&
        axiosResponse.status < 300 &&
        (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

    return {
        success: isSuccess,
        message: axiosResponse.data.retrunMsg || (isSuccess ? 'Marital status saved successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

/**
 * Activate or Deactivate a master marital status record
 * POST /api/MasterMaritalStatusFacade/deactivateRecordById
 */
export async function activateDeactivateMasterMaritalStatus(data: {
    IVRMMMS_Id: number;
    IVRMMMS_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterMaritalStatusResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterMaritalStatusFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            IVRMMMS_Id: data.IVRMMMS_Id,
            MI_Id: 30,
            IVRMMMS_MaritalStatus: 'string',
            IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
            maritalstatusList: [],
            retrunMsg: 'string',
            roleId: 0
        };

        const axiosResponse = await axios.post<MasterMaritalStatusResponse>(url, requestBody, {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const isSuccess =
            axiosResponse.status >= 200 &&
            axiosResponse.status < 300 &&
            (!axiosResponse.data.retrunMsg || !axiosResponse.data.retrunMsg.toLowerCase().includes('error'));

        return {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Marital status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };
    } catch (error) {
        console.error('Error activating/deactivating master marital status:', error);
        throw error;
    }
}
