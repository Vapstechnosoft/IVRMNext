'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupList } from '@/types/fees/masters/masters';

export async function getMasterGroup(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterGroupFacade/30?${urlParams}`;
    return await api.getArray<IMasterGroupList>(url);
}

export async function addOrUpdateMasterGroup(data: any) {
    const url = '/MasterGroupFacade';
    return await api.post<any>(url, data);
}

export async function toggleMasterGroup(id: number) {
    const url = `/ModeMasterGroupFacade/paymentDecative/${id}`;
    return await api.put(url);
}
