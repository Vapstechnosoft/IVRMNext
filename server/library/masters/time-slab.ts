'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterTimeSlab(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterTimeSlab/getdetails/0?${urlParams}`;
    const response = await api.get<any>('library', url);
    return response;
}

export async function getMasterTimeSlabList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterTimeSlab/get-master-timeslab-list?${urlParams}`;
    const response = await api.get<any>('library', url);
    return response;
}

export async function addOrUpdateMasterTimeSlab(data: any) {
    const url = '/MasterTimeSlab/save-class-timedata';
    return await api.post<any>('library', url, data);
}

export async function deactivateMasterTimeSlab(id: number) {
    const url = `/MasterTimeSlab/toggle-master-timeslab/${id}`;
    return await api.post<any>('library', url, {});
}
