'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterTermsList } from '@/types/fees/masters/masters';

export async function getFeeTermList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee-terms/30?${urlParams}`;
    return await api.get<IMasterTermsList[]>(url);
}

export async function addOrUpdateFeeTerm(data: any) {
    const url = '/FeeFineSlabFacade/AddOrUpdate';
    return await api.post<any>(url, data);
}

export async function toggleFeeTerm(mi_id: number, id: number) {
    const url = `/FeeFineSlabFacade/Toggle/${id}`;
    return await api.put(url);
}
