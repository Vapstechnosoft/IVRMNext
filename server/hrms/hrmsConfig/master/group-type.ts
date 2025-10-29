import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type { GroupTypeDetail, MasterGroupTypeInput, MasterGroupTypeResponse } from '@/types/hrms/master-group-type';
import axios from 'axios';

/**
 * Get all master group type records (onload)
 * POST /api/MasterGroupTypeFacade/onloadgetdetails
 */
export async function getMasterGroupTypeList(roleId: number): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupTypeFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody: OnloadGetGroupTypeDetailsRequest = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMGT_Id: 0,
            MI_Id: 30,
            HRMGT_EmployeeGroupType: 'string',
            HRMGT_Code: 'string',
            HRMGT_Order: 0,
            HRMGT_ActiveFlag: true,
            grouptypeList: [],
            retrunMsg: 'string',
            roleId: roleId,
            GroupTypeDTO: []
        };

        const axiosResponse = await axios.post<MasterGroupTypeResponse>(url, requestBody, {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        return {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message:
                axiosResponse.data.retrunMsg ||
                (axiosResponse.status >= 200 && axiosResponse.status < 300
                    ? 'Group types loaded successfully'
                    : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };
    } catch (error) {
        console.error('Error fetching master group type list:', error);
        throw error;
    }
}

/**
 * Create or Update a master group type record
 * POST /api/MasterGroupTypeFacade
 */
export async function saveMasterGroupType(data: MasterGroupTypeInput): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupTypeFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMGT_Id: data.HRMGT_Id || 0,
            MI_Id: 30,
            HRMGT_EmployeeGroupType: data.HRMGT_EmployeeGroupType,
            HRMGT_Code: data.HRMGT_Code,
            HRMGT_Order: data.HRMGT_Order || 0,
            HRMGT_ActiveFlag: data.HRMGT_ActiveFlag,
            grouptypeList: [],
            retrunMsg: 'string',
            roleId: data.MI_Id || 0,
            GroupTypeDTO: []
        };

        const axiosResponse = await axios.post<MasterGroupTypeResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master group type:', error);
        throw error;
    }
}

/**
 * Activate/Deactivate a master group type record
 * PUT /api/MasterGroupType/activate-deactivate
 */
export async function activateDeactivateMasterGroupType(data: {
    HRMGT_Id: number;
    HRMGT_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupType/activate-deactivate';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMGT_Id: data.HRMGT_Id,
            HRMGT_ActiveFlag: data.HRMGT_ActiveFlag,
            MI_Id: data.MI_Id || 0
        };

        const axiosResponse = await axios.put<MasterGroupTypeResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000
        });

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Status updated successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master group type:', error);
        throw error;
    }
}

/**
 * Get details of a specific master group type by ID
 * GET /api/MasterGroupType/details/{id}
 */
export async function getMasterGroupTypeDetails(id: number): Promise<ApiResponse<GroupTypeDetail>> {
    try {
        const url = `/api/MasterGroupType/details/${id}`;
        const response = await api.get<GroupTypeDetail>('default', url);
        return response;
    } catch (error) {
        console.error('Error fetching master group type details:', error);
        throw error;
    }
}

export async function saveMasterGroupTypeOrder(groupTypes: GroupTypeDetail[]): Promise<ApiResponse<MasterGroupTypeResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGroupTypeFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMGT_Id: 0,
            MI_Id: 30,
            HRMGT_EmployeeGroupType: 'string',
            HRMGT_Code: 'string',
            HRMGT_Order: 0,
            HRMGT_ActiveFlag: true,
            grouptypeList: [],
            retrunMsg: 'string',
            roleId: 0,
            GroupTypeDTO: groupTypes.map((gt) => ({
                HRMGT_Id: gt.HRMGT_Id,
                MI_Id: 30,
                HRMGT_EmployeeGroupType: gt.HRMGT_EmployeeGroupType,
                HRMGT_Code: gt.HRMGT_Code,
                HRMGT_Order: gt.HRMGT_Order,
                HRMGT_ActiveFlag: gt.HRMGT_ActiveFlag
            }))
        };

        const axiosResponse = await axios.post<MasterGroupTypeResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterGroupTypeResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Order saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving group type order:', error);
        throw error;
    }
}
