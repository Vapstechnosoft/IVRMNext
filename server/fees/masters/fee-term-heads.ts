'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IMasterHeadDropdownList,
    IMasterInstallmentsDropdownList,
    IMasterTermDropdownList,
    IMasterTermFeeHeadList
} from '@/types/fees/masters/masters';

export async function getFeeTermHeadList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee_term_heads/30?${urlParams}`;

    return await api.get<IMasterTermFeeHeadList[]>('fees', url);
}

export async function addOrUpdateFeeTermHead(data: any) {
    const url = '/FeeMasterTermsFacade/TermHeadInstallmentMaping';

    console.info('addOrUpdateFeeTermHead URL:', url);
    return await api.post<any>('fees', url, data);
}

export async function toggleFeeTermHead(mi_id: number, id: number) {
    const url = `/FeeFineSlabFacade/Toggle/${id}`;
    return await api.put('fees', url);
}

export async function getheadsdropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee_head_Dropdown/30?${urlParams}`;
    return await api.get<IMasterHeadDropdownList[]>('fees', url);
}

export async function getinstallmentsdropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee_installment_Dropdown/30?${urlParams}`;
    return await api.get<IMasterInstallmentsDropdownList[]>('fees', url);
}

export async function gettermsdropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee_term_Dropdown/30?${urlParams}`;
    return await api.get<IMasterTermDropdownList[]>('fees', url);
}
