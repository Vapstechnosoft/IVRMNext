import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type { GradeDetail, MasterGradeInput, MasterGradeResponse, OnchangeGradeDetailsRequest } from '@/types/hrms/master-grade';
import axios from 'axios';

export async function getMasterGradeList(roleId: number): Promise<ApiResponse<MasterGradeResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterGradeFacade/onloadgetdetails';
    const url = `${baseURL}${apiPath}`;

    const requestBody: OnloadGetGradeDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: 0,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: true,
        gradelList: [],
        retrunMsg: 'string',
        roleId: roleId,
        GradeDTO: []
    };

    const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Grades loaded successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterGrade(data: MasterGradeInput): Promise<ApiResponse<MasterGradeResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterGradeFacade`;

    const requestBody: OnchangeGradeDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: data.HRMG_Id || 0,
        MI_Id: 30,
        HRMG_GradeName: data.HRMG_GradeName,
        HRMG_GradeDisplayName: data.HRMG_GradeDisplayName,
        HRMG_PayScaleRange: `${data.HRMG_PayScaleFrom}-${data.HRMG_IncrementOf}-${data.HRMG_PayScaleTo}`,
        HRMG_PayScaleFrom: data.HRMG_PayScaleFrom,
        HRMG_IncrementOf: data.HRMG_IncrementOf,
        HRMG_PayScaleTo: data.HRMG_PayScaleTo,
        HRMG_Order: data.HRMG_Order || 0,
        HRMG_ActiveFlag: data.HRMG_ActiveFlag,
        gradelList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0,
        GradeDTO: []
    };

    const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
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
        message: axiosResponse.data.retrunMsg || (isSuccess ? 'Grade saved successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

/**
 * Activate or Deactivate a master grade record
 * POST /api/MasterGradeFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGrade(data: {
    HRMG_Id: number;
    HRMG_ActiveFlag: boolean;
    MI_Id?: number;
}): Promise<ApiResponse<MasterGradeResponse>> {
    try {
        const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
        const apiPath = '/api/MasterGradeFacade/deactivateRecordById';
        const url = `${baseURL}${apiPath}`;

        const requestBody = {
            HRMG_Id: data.HRMG_Id,
            MI_Id: 30,
            HRMG_GradeName: 'string',
            HRMG_GradeDisplayName: 'string',
            HRMG_PayScaleRange: 'string',
            HRMG_PayScaleFrom: 0,
            HRMG_IncrementOf: 0,
            HRMG_PayScaleTo: 0,
            HRMG_Order: 0,
            HRMG_ActiveFlag: data.HRMG_ActiveFlag,
            gradelList: [],
            retrunMsg: 'string',
            roleId: 0,
            GradeDTO: []
        };

        const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
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
            message: axiosResponse.data.retrunMsg || (isSuccess ? 'Grade status updated successfully' : `HTTP ${axiosResponse.status}`),
            data: axiosResponse.data
        };
    } catch (error) {
        console.error('Error activating/deactivating master grade:', error);
        throw error;
    }
}

export async function saveMasterGradeOrder(grades: GradeDetail[]): Promise<ApiResponse<MasterGradeResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterGradeFacade`;

    const requestBody: OnchangeGradeDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMG_Id: 0,
        MI_Id: 30,
        HRMG_GradeName: 'string',
        HRMG_GradeDisplayName: 'string',
        HRMG_PayScaleRange: 'string',
        HRMG_PayScaleFrom: 0,
        HRMG_IncrementOf: 0,
        HRMG_PayScaleTo: 0,
        HRMG_Order: 0,
        HRMG_ActiveFlag: true,
        gradelList: [],
        retrunMsg: 'string',
        roleId: 0,
        GradeDTO: grades.map((grade) => ({
            HRMG_Id: grade.HRMG_Id,
            MI_Id: 30,
            HRMG_GradeName: grade.HRMG_GradeName,
            HRMG_GradeDisplayName: grade.HRMG_GradeDisplayName,
            HRMG_PayScaleRange: grade.HRMG_PayScaleRange,
            HRMG_PayScaleFrom: grade.HRMG_PayScaleFrom,
            HRMG_IncrementOf: grade.HRMG_IncrementOf,
            HRMG_PayScaleTo: grade.HRMG_PayScaleTo,
            HRMG_Order: grade.HRMG_Order,
            HRMG_ActiveFlag: grade.HRMG_ActiveFlag
        }))
    };

    const axiosResponse = await axios.post<MasterGradeResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Order saved successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}
