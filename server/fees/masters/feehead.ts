'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeHeadsList } from '@/types/fees/masters';

export async function getfeehead(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/fee_head/30?${urlParams}`;
    return await api.get<IFeeHeadsList[]>('fees', url);
}

export async function addOrUpdateMasterfeehead(data: any) {
    const url = '/fee_head';
    return await api.post<any>('fees', url, data);
}

export async function toggleMasterfeehead(mi_id: number, id: number) {
    const url = `/fee_head/deactivate/${id}`;
    return await api.put('fees', url);
}
