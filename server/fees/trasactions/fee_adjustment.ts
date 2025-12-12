'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeAdjustmentGridList } from '@/types/fees/transactions/transactions';

export async function getFeeAdjutmentGridList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeAdjustment/get-adjustead-list?${urlParams}`;
    return await api.get<IFeeAdjustmentGridList[]>('fees', url);
}

export async function deleteFeeAdjustment(fr_id: number) {
    const url = `/FeeAdjustment/deletedetails/${fr_id}`;

    return await api.delete('fees', url);
}
