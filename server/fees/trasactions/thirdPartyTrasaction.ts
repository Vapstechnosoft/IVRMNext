'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IFeeBankDetails,
    IFeeThirdPartyTransaction,
    IFeeThirdPartyTransactionGroupDropDown,
    IFeeThirdPartyTransactionHeadDropDown
} from '@/types/fees/transactions/transactions';

export async function getThirdPartyTrasaction(searchParams?: ApiSearchparams) {
    //const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = '/ThirdPartyTransaction/30';
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
