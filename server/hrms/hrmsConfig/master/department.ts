'use server';

import { api } from '@/lib/apiService';
import type {
    DepartmentDetail,
    MasterDepartmentInput,
    MasterDepartmentResponse,
    OnloadGetDepartmentDetailsRequest,
    SaveDepartmentRequest
} from '@/types/hrms/master-department';

export async function getMasterDepartmentList(roleId: number) {
    const url = '/api/MasterDepartmentFacade/onloadgetdetails';
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
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}

export async function saveMasterDepartment(data: MasterDepartmentInput) {
    const url = '/api/MasterDepartmentFacade';
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
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}

export async function activateDeactivateMasterDepartment(data: {
    HRMD_Id: number;
    HRMD_ActiveFlag: boolean;
    roleId?: number;
}) {
    const url = '/api/MasterDepartmentFacade/deactivateRecordById';
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
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}

export async function getOnloadDepartmentDetails(roleId: number) {
    const url = '/api/MasterDepartmentFacade/onloadgetdetails';
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
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}

export async function getDepartmentById(id: number) {
    const url = `/api/MasterDepartmentFacade/getRecordById/${id}`;
    return await api.get<MasterDepartmentResponse>('hrms', url);
}

export async function saveMasterDepartmentOrder(departments: DepartmentDetail[]) {
    const url = '/api/MasterDepartmentFacade';
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
        DeraptmentDTO: departments.map((dept) => dept.HRMD_DepartmentName)
    };
    return await api.post<MasterDepartmentResponse>('hrms', url, requestBody);
}
