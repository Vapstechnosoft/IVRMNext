import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type {
    DesignationDetail,
    MasterDesignationInput,
    MasterDesignationResponse,
    OnloadGetDesignationDetailsRequest,
    SaveDesignationRequest
} from '@/types/hrms/master-designation';
import axios from 'axios';

export async function getMasterDesignationList(roleId: number): Promise<ApiResponse<MasterDesignationResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterDesignationFacade/onloadgetdetails';
    const url = `${baseURL}${apiPath}`;

    const requestBody: OnloadGetDesignationDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: 0,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: false,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: [],
        retrunMsg: 'string',
        roleId: roleId,
        DesignationDTO: []
    };

    const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Designations loaded successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterDesignation(data: MasterDesignationInput): Promise<ApiResponse<MasterDesignationResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDesignationFacade`;

    const requestBody: SaveDesignationRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: data.HRMDES_Id || 0,
        MI_Id: 30,
        HRMDES_DesignationName: data.HRMDES_DesignationName,
        HRMDES_BasicAmount: data.HRMDES_BasicAmount,
        HRMDES_SanctionedSeats: data.HRMDES_SanctionedSeats,
        HRMDES_DisplaySanctionedSeatsFlag: data.HRMDES_DisplaySanctionedSeatsFlag,
        HRMDES_Order: data.HRMDES_Order || 0,
        HRMDES_ActiveFlag: data.HRMDES_ActiveFlag,
        designationlList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0,
        DesignationDTO: []
    };

    const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Designation saved successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function activateDeactivateMasterDesignation(data: {
    HRMDES_Id: number;
    HRMDES_ActiveFlag: boolean;
    roleId?: number;
}): Promise<ApiResponse<MasterDesignationResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDesignationFacade/deactivateRecordById`;

    const requestBody: SaveDesignationRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: data.HRMDES_Id,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: true,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: data.HRMDES_ActiveFlag,
        designationlList: [],
        retrunMsg: 'string',
        roleId: data.roleId || 0,
        DesignationDTO: []
    };

    const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Designation status updated successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function getOnloadDesignationDetails(roleId: number): Promise<ApiResponse<MasterDesignationResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDesignationFacade/onloadgetdetails`;

    const requestBody: OnloadGetDesignationDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: 0,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: true,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: [],
        retrunMsg: 'string',
        roleId,
        DesignationDTO: []
    };

    const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Designations loaded successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function getDesignationById(id: number): Promise<ApiResponse<MasterDesignationResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDesignationFacade/getRecordById/${id}`;

    const axiosResponse = await axios.get<MasterDesignationResponse>(url, {
        headers: { Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Designation fetched successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function getOnchangeDesignationDetails(
    designationId: number,
    roleId: number
): Promise<ApiResponse<MasterDesignationResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDesignationFacade/Onchangedetails`;

    const requestBody: OnloadGetDesignationDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: designationId,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: true,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: [],
        retrunMsg: 'string',
        roleId,
        DesignationDTO: []
    };

    const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Designation details fetched successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterDesignationOrder(designations: DesignationDetail[]): Promise<ApiResponse<MasterDesignationResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDesignationFacade`;

    const requestBody: SaveDesignationRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMDES_Id: 0,
        MI_Id: 30,
        HRMDES_DesignationName: 'string',
        HRMDES_BasicAmount: 0,
        HRMDES_SanctionedSeats: 0,
        HRMDES_DisplaySanctionedSeatsFlag: false,
        HRMDES_Order: 0,
        HRMDES_ActiveFlag: true,
        designationlList: [],
        retrunMsg: 'string',
        roleId: 0,
        DesignationDTO: designations.map((des) => des.HRMDES_DesignationName)
    };

    const axiosResponse = await axios.post<MasterDesignationResponse>(url, requestBody, {
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
