'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterTermsList } from '@/types/fees/masters/masters';

export async function getFeeTermList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'fmT_Name');
    const url = `/FeeMasterTerms/fee_terms/30?${urlParams}`;

    return await api.get<IMasterTermsList[]>('fees', url);
}

export async function addOrUpdateFeeTerm(data: any) {
    const url = '/FeeMasterTerms/SaveTerm';
    return await api.post<any>('fees', url, data);
}

export async function toggleFeeTerm(mi_id: number, id: number) {
    const url = `/FeeMasterTerms/toggle_fee_term/30/${id}`;
    return await api.put('fees', url);
}
