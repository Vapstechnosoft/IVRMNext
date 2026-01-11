'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IBreakTimeSettingsDTO } from '@/types/timetable/masters/masters';

export async function getBreakTimeSettingsDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmB_BreakName');
    const url = `/BreakTimeSettings/getalldetails?${urlParams}`;
    console.info('BreakTimeSettings', url);
    return await api.get<any>('timetable', url);
}

export async function saveBreakTimeSettings(data: IBreakTimeSettingsDTO) {
    const url = '/BreakTimeSettings/savedetail';
    return await api.post<any>('timetable', url, data);
}

export async function deleteBreakTimeSettings(ttmb_id: number) {
    const url = `/BreakTimeSettings/deletepages/${ttmb_id}`;
    return await api.delete<any>('timetable', url);
}

export async function deactivateBreakTimeSettings(data: any) {
    const url = '/BreakTimeSettings/deactivate';
    return await api.post<any>('timetable', url, data);
}

export async function getBreakTimeSettingsById(ttmb_id: number) {
    const url = `/BreakTimeSettings/getdetails/${ttmb_id}`;
    return await api.get<any>('timetable', url);
}

export async function getMaximumPeriodsCount(data: any) {
    const url = '/BreakTimeSettings/getmaximumperiodscount';
    return await api.post<any>('timetable', url, data);
}

export async function getClassByCategory(data: any) {
    const url = '/BreakTimeSettings/getclass_catg';
    return await api.post<any>('timetable', url, data);
}

export async function getCategoryByAcademicYear(data: any) {
    const url = '/BreakTimeSettings/get_catg';
    return await api.post<any>('timetable', url, data);
}
