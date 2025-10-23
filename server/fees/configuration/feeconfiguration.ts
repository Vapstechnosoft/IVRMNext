'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeConfig } from '@/types/fees/configuration/feesconfiguration';

export async function getfeeconfig(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterConfigFacade/30?${urlParams}`;
    return await api.get<IFeeConfig[]>('fees', url);
}

export async function addOrUpdatefeeconfig(data: any) {
    const url = '/FeeMasterConfigFacade';
    return await api.post<any>('fees', url, data);
}

export async function toggleMasterfeeconfig(mi_id: number, id: number) {
    const url = `/FeeMasterConfigFacade/deactivate/${id}`;
    return await api.put('fees', url);
}
