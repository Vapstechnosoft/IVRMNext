'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeClassList, IFeeSectionList, IFeeTransactionWaivedOffList } from '@/types/fees/transactions/transactions';

export async function addOrUpdateTransactionWaivedOff(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee_terms/30?${urlParams}`;
    return await api.get<IFeeTransactionWaivedOffList[]>('fees', url);
}

export async function addOrUpdateFeeTerm(data: any) {
    const url = '/FeeFineSlabFacade/AddOrUpdate';
    return await api.post<any>('fees', url, data);
}

export async function toggleFeeTerm(id: number) {
    const url = `/FeeFineSlabFacade/Toggle/${id}`;
    return await api.put('fees', url);
}

export async function getsectiondetails() {
    const url = 'FeeStudentTransaction/section-details';
    return await api.get<IFeeSectionList[]>('fees', url);
}

export async function getClassdetails() {
    const url = 'FeeStudentTransaction/class-details';
    return await api.get<IFeeClassList[]>('fees', url);
}
