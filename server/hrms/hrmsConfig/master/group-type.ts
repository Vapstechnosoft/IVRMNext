'use server';

import { api } from '@/lib/apiService';
import type { GroupTypeDetail, MasterGroupTypeInput, MasterGroupTypeResponse } from '@/types/hrms/master-group-type';

/**
 * Get all master group type records (onload)
 * POST /api/MasterGroupTypeFacade/onloadgetdetails
 */
export async function getMasterGroupTypeList(roleId: number) {
    const url = '/api/MasterGroupTypeFacade/onloadgetdetails';
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
        roleId: roleId,
        GroupTypeDTO: []
    };
    return await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
}

/**
 * Create or Update a master group type record
 * POST /api/MasterGroupTypeFacade
 */
export async function saveMasterGroupType(data: MasterGroupTypeInput) {
    const url = '/api/MasterGroupTypeFacade';
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
    return await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
}

/**
 * Activate/Deactivate a master group type record
 * POST /api/MasterGroupTypeFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGroupType(data: {
    HRMGT_Id: number;
    HRMGT_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterGroupTypeFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMGT_Id: data.HRMGT_Id,
        MI_Id: data.MI_Id || 30,
        HRMGT_EmployeeGroupType: 'string',
        HRMGT_Code: 'string',
        HRMGT_Order: 0,
        HRMGT_ActiveFlag: data.HRMGT_ActiveFlag,
        grouptypeList: [
            {
                CreatedDate: new Date().toISOString(),
                UpdatedDate: new Date().toISOString(),
                HRMGT_Id: 0,
                MI_Id: 0,
                HRMGT_EmployeeGroupType: 'string',
                HRMGT_Code: 'string',
                HRMGT_Order: 0,
                HRMGT_ActiveFlag: true
            }
        ],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0,
        GroupTypeDTO: []
    };
    return await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master group type by ID
 * GET /api/MasterGroupTypeFacade/getRecordById/{id}
 */
export async function getMasterGroupTypeDetails(id: number) {
    const url = `/api/MasterGroupTypeFacade/getRecordById/${id}`;
    return await api.get<MasterGroupTypeResponse>('hrms', url);
}

export async function saveMasterGroupTypeOrder(groupTypes: GroupTypeDetail[]) {
    const url = '/api/MasterGroupTypeFacade';
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
    return await api.post<MasterGroupTypeResponse>('hrms', url, requestBody);
}
