'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterDayClassWise } from '@/types/timetable/masters/masters';

export async function getMasterDayClassWiseDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmP_PeriodName,ttmP_ActiveFlag,ttmP_Id');
    const url = `/PeriodAllocationFacade/GetMasterDayClassWiseGridData?${urlParams}`;
    return await api.get<IMasterDayClassWise[]>('timetable', url);
}

export async function addOrUpdateMasterDay(data: any) {
    const url = '/MasterDayFacade/MasterdayAddOrUpdate';
    return await api.post<any>('timetable', url, data);
}

export async function ToggleMasterDay(ttmd_id: number) {
    const url = `/MasterDayFacade/MasterDaydayActivateDeactivate/30/${ttmd_id}`;
    return await api.put<any>('timetable', url);
}
