'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeAdjustmentGridList } from '@/types/fees/transactions/transactions';

export async function getFeeAdjutmentGridList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeAdjustment/get-adjustead-list?${urlParams}`;
    return await api.get<IFeeAdjustmentGridList[]>('fees', url);
}

export async function getFeeAdjustmentClassDropDown(data: any) {
    const url = '/FeeAdjustment/getclass';
    return await api.post<any>('fees', url, data);
}

export async function getFeeAdjustmentSectionDropDown(data: any) {
    const url = '/FeeAdjustment/getsection';
    return await api.post<any>('fees', url, data);
}
export async function getFeeAdjustmentStudentDropDown(data: any) {
    const url = '/FeeAdjustment/getstudent';
    return await api.post<any>('fees', url, data);
}
export async function getFeeAdjustmentGroupDropDown(data: any) {
    const url = '/FeeAdjustment/getbothgroup';
    return await api.post<any>('fees', url, data);
}
export async function getFeeAdjustmentFromHeadDropDown(data: any) {
    const url = '/FeeAdjustment/getfromhead';
    return await api.post<any>('fees', url, data);
}
export async function getFeeAdjustmentToHeadDropDown(data: any) {
    const url = '/FeeAdjustment/gettohead';
    return await api.post<any>('fees', url, data);
}
export async function deleteFeeAdjustment(fr_id: number) {
    const url = `/FeeAdjustment/deletedetails/${fr_id}`;

    return await api.delete('fees', url);
}
