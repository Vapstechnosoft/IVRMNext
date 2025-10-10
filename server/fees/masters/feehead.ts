'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeHeadsList } from '@/types/fees/masters';

export async function getfeehead(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeheadFacade/30?${urlParams}`;
    return await api.getArray<IFeeHeadsList>(url);
}

export async function addOrUpdateMasterfeehead(data: any) {
    const url = '/FeeheadFacade';
    return await api.post<any>(url, data);
}

export async function toggleMasterfeehead(mi_id: number, id: number) {
    const url = `/FeeheadFacade/deactivate/${id}`;
    return await api.put(url);
}
