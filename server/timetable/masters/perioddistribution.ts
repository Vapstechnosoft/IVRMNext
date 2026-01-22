'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getPeriodDistributionDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'staffName');
    const url = `/ClassMasterFacade/getPeriodDistributionData?${urlParams}`;
    return await api.get<any>('timetable', url);
}

export async function savePeriodDistribution(data: any) {
    const url = '/ClassMaster/savedetail/';
    return await api.post<any>('timetable', url, data);
}

export async function getPeriodDistributionEditDetails(id: number) {
    const url = '/ClassMaster/getdetails';
    return await api.post<any>('timetable', url, { TTFPD_Id: id });
}

export async function deactivatePeriodDistribution(data: any) {
    const url = '/ClassMaster/deactivate';
    return await api.post<any>('timetable', url, data);
}

export async function getClassByCategory(data: any) {
    const url = '/ClassMaster/getclass_catg';
    return await api.post<any>('timetable', url, data);
}
