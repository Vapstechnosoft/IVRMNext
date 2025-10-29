import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type {
    MasterEmployeeTypeInput,
    MasterEmployeeTypeResponse,
    OnloadGetEmployeeTypeDetailsRequest,
    SaveEmployeeTypeRequest
} from '@/types/hrms/master-employee-type';
import axios from 'axios';

/**
 * Get all master employee type records
 * POST /api/MasterEmployeeTypeFacade/onloadgetdetails
 */
export async function getMasterEmployeeTypeList(roleId = 0): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterEmployeeTypeFacade/onloadgetdetails`;

    const requestBody: OnloadGetEmployeeTypeDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMET_Id: 0,
        MI_Id: 30,
        HRMET_EmployeeType: 'string',
        HRMET_ActiveFlag: true,
        employeeTypeList: [],
        retrunMsg: 'string',
        roleId
    };

    const axiosResponse = await axios.post<MasterEmployeeTypeResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data?.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Success' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterEmployeeType(data: MasterEmployeeTypeInput): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterEmployeeTypeFacade`;
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
        retrunMsg: 'string',
        roleId: data.MI_Id ?? 30
    };

    const axiosResponse = await axios.post<MasterEmployeeTypeResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Employee Type saved successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function activateDeactivateMasterEmployeeType(data: {
    HRMET_Id: number;
    HRMET_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterEmployeeTypeResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterEmployeeTypeFacade/deactivateRecordById`;
    const now = new Date().toISOString();

    const requestBody: SaveEmployeeTypeRequest = {
        CreatedDate: now,
        UpdatedDate: now,
        HRMET_Id: data.HRMET_Id,
        MI_Id: data.MI_Id ?? 30,
        HRMET_EmployeeType: 'string',
        HRMET_ActiveFlag: data.HRMET_ActiveFlag,
        employeeTypeList: [
            {
                CreatedDate: now,
                UpdatedDate: now,
                HRMET_Id: data.HRMET_Id,
                MI_Id: data.MI_Id ?? 30,
                HRMET_EmployeeType: 'string',
                HRMET_ActiveFlag: data.HRMET_ActiveFlag
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id ?? 30
    };

    const axiosResponse = await axios.post<MasterEmployeeTypeResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Employee Type status updated successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}
