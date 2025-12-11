'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeAdjustmentGridList } from '@/types/fees/transactions/transactions';

export async function getFeeAdjutmentGridList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeAdjustment/get-adjustead-list?${urlParams}`;
    return await api.get<IFeeAdjustmentGridList[]>('fees', url);
}
