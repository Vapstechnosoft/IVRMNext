'use server';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';

export async function addOrUpdateInsallmentDueDate(data: any) {
    const url = '/fee_installment/Getduedates';
    return await api.post<any>('fees', url, data);
}

export async function toggleMasterfeeInstallmentDueDate(_mi_id: 30, id: number) {
    const url = `/demo/${id}`;
    return await api.put('fees', url);
}
export async function getfeeInstallmentDueDate(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/fee_installment/GetUsedInstallmentList/30?${urlParams}`;
    return await api.get<IMasterFeesInstallmentDueDateList>('fees', url);
}
