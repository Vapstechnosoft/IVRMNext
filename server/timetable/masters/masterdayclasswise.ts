'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterDayClassWise } from '@/types/timetable/masters/masters';

export async function getMasterDayClassWiseDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'academicyr,classname');
    const url = `/MasterDayFacade/MasterDayClasswiseDetails?${urlParams}`;
    return await api.get<IMasterDayClassWise[]>('timetable', url);
}

export async function addOrUpdateMasterDay(data: any) {
    const url = '/MasterDayFacade/MasterdayAddOrUpdate';
    return await api.post<any>('timetable', url, data);
}

export async function ToggleMasterDayClasswise(ttmd_id: number) {
    const url = `/MasterDayFacade/MasterDaydayClasswiseActivateDeactivate/${ttmd_id}`;
    return await api.put<any>('timetable', url);
}
