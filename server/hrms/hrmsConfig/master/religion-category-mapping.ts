'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterReligionCategoryMappingList } from '@/types/hrms/hrms-config/master';

/**
 * Get religion category mapping list with search, sort, and pagination
 * GET /api/MasterReligionCategory_MappingFacade/GetBasicData
 */
export async function getReligionCategoryMappingList(searchParams?: ApiSearchparams) {
    const searchableColumns = 'ivrmmR_Name,imcC_CategoryName';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/MasterReligionCategory_MappingFacade/GetBasicData?${urlParams}`;
    return await api.get<IMasterReligionCategoryMappingList[]>('hrms', url);
}

/**
 * Save/Update religion category mapping
 * POST /api/MasterReligionCategory_MappingFacade/SaveUpdate
 */
export async function saveReligionCategoryMapping(data: any) {
    const url = '/api/MasterReligionCategory_MappingFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

/**
 * Toggle religion category mapping (activate/deactivate)
 * PUT /api/MasterReligionCategory_MappingFacade/deactivate/{id}
 */
export async function toggleReligionCategoryMapping(id: number) {
    const url = `/api/MasterReligionCategory_MappingFacade/toggle/${id}`;
    return await api.put<any>('hrms', url);
}
