'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassYearlyList } from '@/types/fees/masters/masters';

export async function getMasterYearlyCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmaY_Year,fmcC_ClassCategoryName,asmcL_ClassName');
    const url = `/fee_yearly_group/30?${urlParams}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getGroupListCategory(searchParams?: ApiSearchparams) {
    const _urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = '/fee_yearly_group/getgrouplist/30';
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function MasterClassYearlyCategory(data: any) {
    const url = '/fee_class_category/classcategorylist';
    return await api.post<any>('fees', url, data);
}

export async function addOrUpdateMasterGroupYearlyCategory(data: any) {
    const url = '/fee_yearly_group';
    return await api.post<any>('fees', url, data);
}

export async function toggleMasterclassYearlyCategory(mi_id: number, id: number) {
    const url = `/fee_yearly_group/toggle_fee_yearlygroup/${mi_id}/${id}`;
    return await api.put('fees', url);
}
