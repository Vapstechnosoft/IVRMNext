'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupList } from '@/types/fees/masters/masters';

export async function getMasterGroup(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/fee_group/30?${urlParams}`;
    return await api.get<IMasterGroupList[]>(url);
}

export async function addOrUpdateMasterGroup(data: any) {
    const url = '/fee_group';
    return await api.post<any>(url, data);
}

export async function toggleMasterGroup(id: number) {
    const url = `/fee_group/toggle_master_feegroup/30/${id}`;
    return await api.put(url);
}
