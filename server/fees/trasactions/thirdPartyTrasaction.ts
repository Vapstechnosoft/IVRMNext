'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IFeeBankDetails,
    IFeeThirdPartyTransaction,
    IFeeThirdPartyTransactionGroupDropDown,
    IFeeThirdPartyTransactionHeadDropDown,
    IFeeThirdPartyTransactionStudentDetails,
    IThirdPartyTransactionEditdata
} from '@/types/fees/transactions/transactions';

export async function getThirdPartyTrasaction(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/ThirdPartyTransaction/30?${urlParams}`;
    return await api.get<IFeeThirdPartyTransaction[]>('fees', url);
}

export async function getThirdPartyTrasactionGroupDropDown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ThirdPartyTransaction/group_drop_down_list/30?${urlParams}`;
    return await api.get<IFeeThirdPartyTransactionGroupDropDown[]>('fees', url);
}

export async function getThirdPartyTrasactionHeadDropDown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ThirdPartyTransaction/head_drop_down_list/30?${urlParams}`;
    return await api.get<IFeeThirdPartyTransactionHeadDropDown[]>('fees', url);
}

export async function getThirdPartyTrasactionBankDropDown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ThirdPartyTransaction/bank_drop_down_list/30?${urlParams}`;
    return await api.get<IFeeBankDetails[]>('fees', url);
}

export async function getThirdPartyTrasactionStudentDropDown(asmaY_Id: number) {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/ThirdPartyTransaction/SelectOrSearchStudent/30/${asmaY_Id}`;
    console.info('ThirdPartyTransaction', url);
    return await api.get<IFeeThirdPartyTransactionStudentDetails[]>('fees', url);
}

export async function saveorUpdateThirdPartyTrasaction(data: any) {
    const url = '/ThirdPartyTransaction/add-or-update-thirdparty-transaction';
    console.info('saveorUpdateThirdPartyTrasaction api', url, data);
    return await api.post<any>('fees', url, data);
}

export async function get_Receipt_number() {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = '/ThirdPartyTransaction/get_Receipt_number/30';
    console.info('ThirdPartyTransaction', url);
    return await api.get<any>('fees', url);
}

export async function geteditThirdpartytrasaction(mi_id: number, asmaY_Id: number, fyp_id: number) {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ThirdPartyTransaction/OtherTransactionById/${mi_id}/${asmaY_Id}/${fyp_id}`;
    console.info('ThirdPartyTransaction', url);
    return await api.get<IThirdPartyTransactionEditdata[]>('fees', url);
}

export async function deleteThirdPartyTrasaction(fyp_id: number) {
    const url = `/ThirdPartyTransaction/delete/${fyp_id}`;
    console.info(url);
    return await api.delete('fees', url);
}
