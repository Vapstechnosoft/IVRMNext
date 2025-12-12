'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupDeptDessgMappingList } from '@/types/hrms/hrms-config/master';

/**
 * Get group department designation mapping list with search, sort, and pagination
 * GET /api/MasterGroupDeptDessgFacade/GetBasicData
 */
export async function getGroupDeptDessgMappingList(searchParams?: ApiSearchparams) {
    const searchableColumns = 'hrmgT_EmployeeGroupType,hrmD_DepartmentName,hrmdeS_DesignationName';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/MasterGroupDeptDessgFacade/GetBasicData?${urlParams}`;
    return await api.get<IMasterGroupDeptDessgMappingList[]>('hrms', url);
}

/**
 * Save/Update group department designation mapping
 * POST /api/MasterGroupDeptDessgFacade/SaveData
 */
export async function saveGroupDeptDessgMapping(data: any) {
    const url = '/api/MasterGroupDeptDessgFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

/**
 * Toggle group department designation mapping (activate/deactivate)
 * PUT /api/MasterGroupDeptDessgFacade/MasterDeactivate/{id}
 */
export async function toggleGroupDeptDessgMapping(id: number) {
    const url = `/api/MasterGroupDeptDessgFacade/toggle/${id}`;
    return await api.put<any>('hrms', url);
}
