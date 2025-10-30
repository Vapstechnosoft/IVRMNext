'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeOpeningBalanceList } from '@/types/fees/transactions/transactions';

export async function getFeeOpeningBalance(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeOpeningBalanceFacade/30?${urlParams}`;
    return await api.get<IFeeOpeningBalanceList[]>('fees', url);
}

export async function addOrUpdateFeeOpeningBalance(data: any) {
    const url = '/FeeOpeningBalanceFacade';
    return await api.post<any>('fees', url, data);
}

export async function toggleFeeOpeningBalance(id: number) {
    const url = `/FeeOpeningBalanceFacade/paymentDecative/${id}`;
    return await api.put('fees', url);
}
