import { clientEnv } from '@/env';
import { type ApiResponse, api } from '@/lib/apiService';
import type { LeaveYearDetail, MasterLeaveYearInput, MasterLeaveYearResponse } from '@/types/hrms/master-leave-year';
import axios from 'axios';

/**
 * Get onload details for master leave year
 * POST /api/MasterLeaveYearFacade/onloadgetdetails
 */
export async function getMasterLeaveYearList(roleId: number): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterLeaveYearFacade/onloadgetdetails';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMLY_Id: 1,
            MI_Id: 30,
            HRMLY_LeaveYear: '2025-2026',
            HRMLY_FromDate: '2025-04-01T00:00:00',
            HRMLY_ToDate: '2026-03-31T00:00:00',
            HRMLY_ActiveFlag: true,
            leaveYearList: [],
            retrunMsg: '',
            roleId: roleId,
            ASMAY_From_Date: null,
            ASMAY_To_Date: null,
            HRMLY_LeaveYearOrder: 1,
            yeardetailList: [],
            LeaveorderDTO: []
        };

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Data fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master leave year list:', error);
        throw error;
    }
}

/**
 * Create or Update a master leave year record
 * POST /api/MasterLeaveYearFacade (create)
 * POST /api/MasterLeaveYear/editRecord (update)
 */
export async function saveMasterLeaveYear(data: MasterLeaveYearInput): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const isEdit = data.HRMLY_Id && data.HRMLY_Id > 0;
        const apiPath = isEdit ? '/api/MasterLeaveYear/editRecord' : '/api/MasterLeaveYearFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMLY_Id: data.HRMLY_Id || 0,
            MI_Id: 30,
            HRMLY_LeaveYear: data.HRMLY_LeaveYear,
            HRMLY_FromDate: data.HRMLY_FromDate,
            HRMLY_ToDate: data.HRMLY_ToDate,
            HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
            leaveYearList: [],
            retrunMsg: '',
            roleId: data.MI_Id || 1,
            ASMAY_From_Date: null,
            ASMAY_To_Date: null,
            HRMLY_LeaveYearOrder: data.HRMLY_LeaveYearOrder || 1,
            yeardetailList: [],
            LeaveorderDTO: []
        };

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || 'Operation completed',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving master leave year:', error);
        throw error;
    }
}

/**
 * Get details of a specific master leave year by ID
 * GET /api/MasterLeaveYearFacade/getRecordById/{id}
 */
export async function getMasterLeaveYearDetails(id: number): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = `/api/MasterLeaveYearFacade/getRecordById/${id}`;
        const url = `${baseURL}${apiPath}`;

        const axiosResponse = await axios.get<MasterLeaveYearResponse>(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: axiosResponse.status >= 200 && axiosResponse.status < 300,
            message: axiosResponse.data.retrunMsg || 'Leave year details fetched successfully',
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error fetching master leave year details:', error);
        throw error;
    }
}

/**
 * Activate or Deactivate a master leave year record
 * POST /api/MasterLeaveYearFacade/deactivateRecordById
 */
export async function activateDeactivateMasterLeaveYear(data: {
    HRMLY_Id: number;
    HRMLY_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterLeaveYearFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            CreatedDate: new Date().toISOString(),
            UpdatedDate: new Date().toISOString(),
            HRMLY_Id: data.HRMLY_Id,
            MI_Id: 30,
            HRMLY_LeaveYear: 'string',
            HRMLY_FromDate: new Date().toISOString(),
            HRMLY_ToDate: new Date().toISOString(),
            HRMLY_ActiveFlag: data.HRMLY_ActiveFlag,
            leaveYearList: [],
            retrunMsg: 'string',
            roleId: 0,
            ASMAY_From_Date: null,
            ASMAY_To_Date: null,
            HRMLY_LeaveYearOrder: 1,
            yeardetailList: [],
            LeaveorderDTO: []
        };

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: isSuccess,
            message:
                axiosResponse.data.retrunMsg || (isSuccess ? 'Leave year status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error activating/deactivating master leave year:', error);
        throw error;
    }
}

export async function saveMasterLeaveYearOrder(leaveYears: LeaveYearDetail[]): Promise<ApiResponse<MasterLeaveYearResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterLeaveYearFacade';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMLY_Id: 0,
            MI_Id: 30,
            HRMLY_LeaveYear: 'string',
            HRMLY_FromDate: '',
            HRMLY_ToDate: '',
            HRMLY_ActiveFlag: true,
            leaveYearList: [],
            retrunMsg: '',
            roleId: 0,
            ASMAY_From_Date: null,
            ASMAY_To_Date: null,
            HRMLY_LeaveYearOrder: 0,
            yeardetailList: [],
            LeaveorderDTO: leaveYears.map((ly) => ({
                HRMLY_Id: ly.HRMLY_Id,
                MI_Id: 30,
                HRMLY_LeaveYear: ly.HRMLY_LeaveYear,
                HRMLY_FromDate: ly.HRMLY_FromDate,
                HRMLY_ToDate: ly.HRMLY_ToDate,
                HRMLY_ActiveFlag: ly.HRMLY_ActiveFlag,
                HRMLY_LeaveYearOrder: ly.HRMLY_LeaveYearOrder
            }))
        };

        const axiosResponse = await axios.post<MasterLeaveYearResponse>(url, requestBody, {
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

        const response: ApiResponse<MasterLeaveYearResponse> = {
            success: isSuccess,
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Order saved successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };

        return response;
    } catch (error) {
        console.error('Error saving leave year order:', error);
        throw error;
    }
}
