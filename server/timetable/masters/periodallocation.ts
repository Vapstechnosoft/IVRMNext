'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IPeriodAllocationMasterDay } from '@/types/timetable/masters/masters';

export async function getAllPeriodDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmP_PeriodName');
    const url = `/PeriodAllocationFacade/GetMasterDayClassWiseGridData?${urlParams}`;
    return await api.get<IPeriodAllocationMasterDay[]>('timetable', url);
}

export async function savePeriod(data: any) {
    const url = '/PeriodAllocationFacade/PeriodAllocationMasterPeriodSave';
    return await api.post<any>('timetable', url, data);
}

export async function savePeriodClass(data: any) {
    const url = '/PeriodAllocation/savedetail/';
    return await api.post<any>('timetable', url, data);
}

export async function deactivatePeriod(data: any) {
    const url = '/PeriodAllocation/deactivate';
    return await api.post<any>('timetable', url, data);
}

export async function deactivatePeriodClass(data: any) {
    const url = '/PeriodAllocation/deactivate1';
    return await api.post<any>('timetable', url, data);
}

export async function getPeriodClass(data: any) {
    const url = '/PeriodAllocation/getperiod_class';
    return await api.post<any>('timetable', url, data);
}

export async function getClassByCategory(data: any) {
    const url = '/PeriodAllocation/getclass_catg';
    return await api.post<any>('timetable', url, data);
}

export async function getCategory(data: any) {
    const url = '/PeriodAllocation/get_catg';
    return await api.post<any>('timetable', url, data);
}
