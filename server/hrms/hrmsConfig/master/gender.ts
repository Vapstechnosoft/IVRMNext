import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type { MasterGenderInput, MasterGenderResponse } from '@/types/hrms/master-gender';
import axios from 'axios';

export async function getMasterGenderList(roleId: number): Promise<ApiResponse<MasterGenderResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterGenderFacade/onloadgetdetails';
    const url = `${baseURL}${apiPath}`;

    const requestBody: OnloadGetDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: 0,
        MI_Id: 30,
        IVRMMG_GenderName: 'string',
        IVRMMG_ActiveFlag: true,
        genderList: [],
        retrunMsg: 'string',
        roleId: roleId
    };

    const axiosResponse = await axios.post<MasterGenderResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Genders loaded successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterGender(data: MasterGenderInput): Promise<ApiResponse<MasterGenderResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterGenderFacade`;

    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: data.IVRMMG_Id || 0,
        MI_Id: 30,
        IVRMMG_GenderName: data.IVRMMG_GenderName,
        IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
        genderList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0
    };

    const axiosResponse = await axios.post<MasterGenderResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Gender saved successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

/**
 * Activate or Deactivate a master gender record
 * POST /api/MasterGenderFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGender(data: {
    IVRMMG_Id: number;
    IVRMMG_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterGenderResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGenderFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            IVRMMG_Id: data.IVRMMG_Id,
            MI_Id: 30,
            IVRMMG_GenderName: 'string',
            IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
            genderList: [],
            retrunMsg: 'string',
            roleId: 0
        };

        const axiosResponse = await axios.post<MasterGenderResponse>(url, requestBody, {
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
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Gender status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };
    } catch (error) {
        console.error('Error activating/deactivating master gender:', error);
        throw error;
    }
}
