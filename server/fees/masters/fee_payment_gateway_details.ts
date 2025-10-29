'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterPaymentGatewayList, IMasterpaymentGatewayDropdownList } from '@/types/fees/masters/masters';

export async function getpaymentgatewaydetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeePaymentGatewayDetailsFacade/getpagedetails/30?${urlParams}`;
    return await api.get<IMasterPaymentGatewayList[]>('fees', url);
}

export async function addOrUpdatepaymentgatewaydetails(data: any) {
    const url = '/FeePaymentGatewayDetailsFacade';
    return await api.post<any>('fees', url, data);
}

export async function togglepaymentgatewaydetails(mi_id: number, id: number) {
    const url = `/FeePaymentGatewayDetailsFacade/deletePaymentGatewayDetails/${id}`;
    return await api.put('fees', url);
}

export async function getpaymentgateway_dropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeePaymentGatewayDetailsFacade/paymentgatewaylist/30?${urlParams}`;
    return await api.get<IMasterpaymentGatewayDropdownList[]>('fees', url);
}
