'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { ReligionCategoryMappingDetail } from '@/types/hrms/religion-category-mapping';

/**
 * Get religion category mapping list with search, sort, and pagination
 * GET /api/ReligionCategory_MappingFacade/onloadgetdetails
 */
export async function getReligionCategoryMappingList(searchParams?: ApiSearchparams) {
    const searchableColumns = 'IVRMMR_Name,IMCC_CategoryName';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/ReligionCategory_MappingFacade/onloadgetdetails?${urlParams}`;
    return await api.get<ReligionCategoryMappingDetail[]>('hrms', url);
}

/**
 * Save/Update religion category mapping
 * POST /api/ReligionCategory_MappingFacade
 */
export async function saveReligionCategoryMapping(data: any) {
    const url = '/api/ReligionCategory_MappingFacade';
    return await api.post<any>('hrms', url, data);
}

/**
 * Toggle religion category mapping (activate/deactivate)
 * PUT /api/ReligionCategory_MappingFacade/deactivateRecordById/{id}
 */
export async function toggleReligionCategoryMapping(id: number) {
    const url = `/api/ReligionCategory_MappingFacade/deactivateRecordById/${id}`;
    return await api.put<any>('hrms', url);
}
