'use server';

import { api } from '@/lib/apiService';
import type { MasterGenderInput, MasterGenderResponse } from '@/types/hrms/master-gender';

export async function getMasterGenderList(roleId: number) {
    const url = '/api/MasterGenderFacade/onloadgetdetails';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: 0,
        MI_Id: 30,
        IVRMMG_GenderName: 'string',
        IVRMMG_ActiveFlag: true,
        genderList: [],
        retrunMsg: 'string',
        roleId: roleId
    };
    return await api.post<MasterGenderResponse>('hrms', url, requestBody);
}

export async function saveMasterGender(data: MasterGenderInput) {
    const isEdit = data.IVRMMG_Id && data.IVRMMG_Id > 0;
    const url = isEdit ? '/api/MasterGender/editRecord' : '/api/MasterGenderFacade';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: data.IVRMMG_Id || 0,
        MI_Id: 30,
        IVRMMG_GenderName: data.IVRMMG_GenderName,
        IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
        genderList: [],
        retrunMsg: 'string',
        roleId: data.MI_Id || 0
    };
    return await api.post<MasterGenderResponse>('hrms', url, requestBody);
}

/**
 * Activate or Deactivate a master gender record
 * POST /api/MasterGenderFacade/deactivateRecordById
 */
export async function activateDeactivateMasterGender(data: {
    IVRMMG_Id: number;
    IVRMMG_ActiveFlag: boolean;
    MI_Id?: number;
}) {
    const url = '/api/MasterGenderFacade/deactivateRecordById';
    const requestBody = {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        IVRMMG_Id: data.IVRMMG_Id,
        MI_Id: 30,
        IVRMMG_GenderName: 'string',
        IVRMMG_ActiveFlag: data.IVRMMG_ActiveFlag,
        genderList: [],
        retrunMsg: 'string',
        roleId: 0
    };
    return await api.post<MasterGenderResponse>('hrms', url, requestBody);
}
