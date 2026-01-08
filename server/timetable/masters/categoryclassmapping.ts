'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { ICategoryClassMapping } from '@/types/timetable/masters/masters';

export async function getCategoryClassMappingDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmB_BuildingName');
    const url = `/MasterBuildingFacade/GetMasterBuildingGridList?${urlParams}`;
    console.info('MasterDayFacade', url);
    return await api.get<ICategoryClassMapping[]>('timetable', url);
}

export async function addOrUpdateCategoryClassMapping(data: any) {
    const url = '/MasterBuildingFacade/AddorUpdateMasterBuilding';
    return await api.post<any>('timetable', url, data);
}

export async function ToggleCategoryClassMapping(ttmd_id: number) {
    const url = `/MasterBuildingFacade/MasterBuildingActivateDeactivate//${ttmd_id}`;
    return await api.put<any>('timetable', url);
}
