'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { GroupDeptDessgMappingDetail, GroupDeptDessgMappingInput } from '@/types/hrms/group-dept-dessg-mapping';

/**
 * Get group department designation mapping list with search, sort, and pagination
 * GET /api/MasterGroupDeptDessgFacade/onloadgetdetails
 */
export async function getGroupDeptDessgMappingList(searchParams?: ApiSearchparams) {
    const searchableColumns = 'HRMGT_EmployeeGroupType,HRMD_DepartmentName,HRMDES_DesignationName';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/MasterGroupDeptDessgFacade/onloadgetdetails?${urlParams}`;
    return await api.get<GroupDeptDessgMappingDetail[]>('hrms', url);
}
/**
 * Save/Update group department designation mapping
 * POST /api/MasterGroupDeptDessgFacade/savedata
 */
export async function saveGroupDeptDessgMapping(data: any) {
    const url = '/api/MasterGroupDeptDessgFacade/savedata';
    return await api.post<any>('hrms', url, data);
}
/**
 * Toggle group department designation mapping (activate/deactivate)
 * PUT /api/MasterGroupDeptDessgFacade/deactivateRecordById/{id}
 */
export async function toggleGroupDeptDessgMapping(id: number) {
    const url = `/api/MasterGroupDeptDessgFacade/deactivateRecordById/${id}`;
    return await api.put<any>('hrms', url);
}
