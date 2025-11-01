'use server';

import { api } from '@/lib/apiService';
import type { MasterMaritalStatusInput, MasterMaritalStatusResponse } from '@/types/hrms/master-marital-status';

export async function getMasterMaritalStatusList(roleId: number) {
    const url = '/api/MasterMaritalStatusFacade/onloadgetdetails';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMMS_Id: 0,
        MI_Id: 30,
        IVRMMMS_MaritalStatus: 'string',
        IVRMMMS_ActiveFlag: true,
        maritalstatusList: [],
        retrunMsg: 'string',
        roleId: roleId
    };
    return await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
}

export async function saveMasterMaritalStatus(data: MasterMaritalStatusInput) {
    const url = '/api/MasterMaritalStatusFacade';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMMS_Id: data.IVRMMMS_Id || 0,
        MI_Id: 30,
        IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus,
        IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
        maritalstatusList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0
    };
    return await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
}

/**
 * Activate or Deactivate a master marital status record
 * POST /api/MasterMaritalStatusFacade/deactivateRecordById
 */
export async function activateDeactivateMasterMaritalStatus(data: {
    IVRMMMS_Id: number;
    IVRMMMS_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterMaritalStatusFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMMS_Id: data.IVRMMMS_Id,
        MI_Id: 30,
        IVRMMMS_MaritalStatus: 'string',
        IVRMMMS_ActiveFlag: data.IVRMMMS_ActiveFlag,
        maritalstatusList: [],
        retrunMsg: 'string',
        roleId: 0
    };
    return await api.post<MasterMaritalStatusResponse>('hrms', url, requestBody);
}
