'use server';

import { api } from '@/lib/apiService';
import type {
    MasterEmployeeTypeInput,
    MasterEmployeeTypeResponse,
    OnloadGetEmployeeTypeDetailsRequest,
    SaveEmployeeTypeRequest
} from '@/types/hrms/master-employee-type';

/**
 * Get all master employee type records
 * POST /api/MasterEmployeeTypeFacade/onloadgetdetails
 */
export async function getMasterEmployeeTypeList(roleId = 0) {
    const url = '/api/MasterEmployeeTypeFacade/onloadgetdetails';
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
    return await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
}

export async function saveMasterEmployeeType(data: MasterEmployeeTypeInput) {
    const url = '/api/MasterEmployeeTypeFacade';
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
    return await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
}

export async function activateDeactivateMasterEmployeeType(data: {
    HRMET_Id: number;
    HRMET_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterEmployeeTypeFacade/deactivateRecordById';
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
    return await api.post<MasterEmployeeTypeResponse>('hrms', url, requestBody);
}
