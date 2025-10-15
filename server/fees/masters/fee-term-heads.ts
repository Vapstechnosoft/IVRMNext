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
    const url = `/FeeMasterTermsFacade/fee-term-heads/30?${urlParams}`;
    return await api.get<IMasterTermFeeHeadList[]>(url);
}

export async function addOrUpdateFeeTermHead(data: any) {
    const url = '/FeeFineSlabFacade/AddOrUpdate';
    return await api.post<any>(url, data);
}

export async function toggleFeeTermHead(mi_id: number, id: number) {
    const url = `/FeeFineSlabFacade/Toggle/${id}`;
    return await api.put(url);
}

export async function getheadsdropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee-head-Dropdown/30?${urlParams}`;
    return await api.get<IMasterHeadDropdownList[]>(url);
}

export async function getinstallmentsdropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee-installment-Dropdown/30?${urlParams}`;
    return await api.get<IMasterInstallmentsDropdownList[]>(url);
}

export async function gettermsdropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee-term-Dropdown/30?${urlParams}`;
    return await api.get<IMasterTermDropdownList[]>(url);
}
