'use server';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterFeesInstallmentList } from '@/types/fees/masters/masters';

export async function addOrUpdateInsallment(data: any) {
    const url = '/demo';
    return await api.post<any>('fees', url, data);
}

export async function toggleMasterfeeInstallment(_mi_id: 30, id: number) {
    const url = `/demo/${id}`;
    return await api.put('fees', url);
}

export async function getfeeInstallment(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeheadFacade/30?${urlParams}`;
    return await api.get<IMasterFeesInstallmentList[]>('fees', url);
}
