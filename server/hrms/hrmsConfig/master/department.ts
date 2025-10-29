import { clientEnv } from '@/env';
import type { ApiResponse } from '@/lib/apiService';
import type {
    DepartmentDetail,
    MasterDepartmentInput,
    MasterDepartmentResponse,
    OnloadGetDepartmentDetailsRequest,
    SaveDepartmentRequest
} from '@/types/hrms/master-department';
import axios from 'axios';

export async function getMasterDepartmentList(roleId: number): Promise<ApiResponse<MasterDepartmentResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const apiPath = '/api/MasterDepartmentFacade/onloadgetdetails';
    const url = `${baseURL}${apiPath}`;

    const requestBody: OnloadGetDepartmentDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: roleId,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };

    const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Departments loaded successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterDepartment(data: MasterDepartmentInput): Promise<ApiResponse<MasterDepartmentResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDepartmentFacade`;

    const requestBody: SaveDepartmentRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: data.HRMD_Id || 0,
        MI_Id: 30,
        HRMD_DepartmentName: data.HRMD_DepartmentName,
        HRMD_Order: data.HRMD_Order || 0,
        HRMD_ActiveFlag: data.HRMD_ActiveFlag,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: data.MI_Id || 0,
        HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs,
        DeraptmentDTO: []
    };

    const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300 ? 'Department saved successfully' : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function activateDeactivateMasterDepartment(data: {
    HRMD_Id: number;
    HRMD_ActiveFlag: boolean;
    roleId?: number;
}): Promise<ApiResponse<MasterDepartmentResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDepartmentFacade/deactivateRecordById`;

    const requestBody: SaveDepartmentRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: data.HRMD_Id,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: data.HRMD_ActiveFlag,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: data.roleId || 0,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    };

    const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Department status updated successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function getOnloadDepartmentDetails(roleId: number): Promise<ApiResponse<MasterDepartmentResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDepartmentFacade/onloadgetdetails`;

    const requestBody: OnloadGetDepartmentDetailsRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: []
    } as unknown as OnloadGetDepartmentDetailsRequest;

    const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Departments loaded successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function getDepartmentById(id: number): Promise<ApiResponse<MasterDepartmentResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDepartmentFacade/getRecordById/${id}`;

    const axiosResponse = await axios.get<MasterDepartmentResponse>(url, {
        headers: { Accept: 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500
    });

    return {
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        message:
            axiosResponse.data.retrunMsg ||
            (axiosResponse.status >= 200 && axiosResponse.status < 300
                ? 'Department fetched successfully'
                : `HTTP ${axiosResponse.status}`),
        data: axiosResponse.data
    };
}

export async function saveMasterDepartmentOrder(departments: DepartmentDetail[]): Promise<ApiResponse<MasterDepartmentResponse>> {
    const baseURL = clientEnv.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseURL}/api/MasterDepartmentFacade`;

    const requestBody: SaveDepartmentRequest = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMD_Id: 0,
        MI_Id: 30,
        HRMD_DepartmentName: 'string',
        HRMD_Order: 0,
        HRMD_ActiveFlag: true,
        departmentList: [],
        retrunMsg: 'string',
        HRMDC_ID: 0,
        roleId: 0,
        HRMD_InternalTrainingMinimumHrs: 0,
        DeraptmentDTO: departments.map((dept) => ({
            HRMD_Id: dept.HRMD_Id,
            MI_Id: 30,
            HRMD_DepartmentName: dept.HRMD_DepartmentName,
            HRMD_Order: dept.HRMD_Order,
            HRMD_ActiveFlag: dept.HRMD_ActiveFlag,
            HRMDC_ID: dept.HRMDC_ID,
            HRMD_InternalTrainingMinimumHrs: dept.HRMD_InternalTrainingMinimumHrs
        }))
    };

    const axiosResponse = await axios.post<MasterDepartmentResponse>(url, requestBody, {
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
