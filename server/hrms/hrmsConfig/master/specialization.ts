'use server';

import { api } from '@/lib/apiService';
import type { MasterSpecializationInput, MasterSpecializationResponse } from '@/types/hrms/master-specialization';

/**
 * Get all master specialization records (onload)
 * POST /api/masterSpecialisationFacade/loaddata
 */
export async function getMasterSpecializationList(roleId: number) {
    const url = '/api/masterSpecialisationFacade/loaddata';
    const requestBody = {
        HRMSPL_Id: 0,
        MI_Id: 30,
        UserId: roleId,
        HRMSPL_SpecialisationName: 'string',
        HRMSPL_ActiveFlg: true,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: new Date().toISOString(),
        HRMSPL_UpdatedDate: new Date().toISOString(),
        alldata: [],
        editlist: [],
        duplicate: false,
        msg: 'string',
        returnval: true
    };
    return await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
}

/**
 * Create or Update master specialization item
 * POST /api/masterSpecialisationFacade/savedata (create)
 * POST /api/masterSpecialisationFacade/EditData (update)
 */
export async function saveMasterSpecialization(data: MasterSpecializationInput) {
    const isEdit = data.HRMSPL_Id && data.HRMSPL_Id > 0;
    const url = isEdit ? '/api/masterSpecialisationFacade/EditData' : '/api/masterSpecialisationFacade/savedata';
    const requestBody = {
        HRMSPL_Id: data.HRMSPL_Id || 0,
        MI_Id: 30,
        UserId: 0,
        HRMSPL_SpecialisationName: data.HRMSPL_SpecialisationName,
        HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: new Date().toISOString(),
        HRMSPL_UpdatedDate: new Date().toISOString(),
        alldata: [],
        editlist: [],
        duplicate: false,
        msg: '',
        returnval: true
    };
    return await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
}

/**
 * Get details of a specific master specialization by ID
 * GET /api/MasterSpecialisationFacade/getRecordById/{id}
 */
export async function getMasterSpecializationDetails(id: number) {
    const url = `/api/MasterSpecialisationFacade/getRecordById/${id}`;
    return await api.get<MasterSpecializationResponse>('hrms', url);
}

/**
 * Activate or Deactivate a master specialization record
 * POST /api/masterSpecialisationFacade/masterDecative
 */
export async function activateDeactivateMasterSpecialization(data: {
    HRMSPL_Id: number;
    HRMSPL_ActiveFlg: boolean;
    MI_Id?: number;
}) {
    const url = '/api/masterSpecialisationFacade/masterDecative';
    const requestBody = {
        HRMSPL_Id: data.HRMSPL_Id,
        MI_Id: 30,
        UserId: 0,
        HRMSPL_SpecialisationName: 'string',
        HRMSPL_ActiveFlg: data.HRMSPL_ActiveFlg,
        HRMSPL_CreatedBy: 0,
        HRMSPL_UpdatedBy: 0,
        HRMSPL_CreatedDate: new Date().toISOString(),
        HRMSPL_UpdatedDate: new Date().toISOString(),
        alldata: [],
        editlist: [],
        duplicate: false,
        msg: 'string',
        returnval: true
    };
    return await api.post<MasterSpecializationResponse>('hrms', url, requestBody);
}
