'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { ITimeTableMasterCategory } from '@/types/timetable/masters/masters';

export async function getMasterCategoryDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmB_BuildingName');
    const url = `/MasterBuildingFacade/GetMasterBuildingGridList?${urlParams}`;
    console.info('MasterDayFacade', url);
    return await api.get<ITimeTableMasterCategory[]>('timetable', url);
}

export async function addOrUpdateMasterCategory(data: any) {
    const url = '/MasterBuildingFacade/AddorUpdateMasterBuilding';
    return await api.post<any>('timetable', url, data);
}

export async function ToggleMasterCategory(ttmd_id: number) {
    const url = `/MasterBuildingFacade/MasterBuildingActivateDeactivate//${ttmd_id}`;
    return await api.put<any>('timetable', url);
}
