'use server';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupsGrouping } from '@/types/fees/masters/masters';

export async function getFeeGroup(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeGroupGroupingFacade/feegroups/30?${urlParams}`;
    return await api.get<IMasterGroupsGrouping[]>('fees', url);
}

export async function getFeeGroupGrouping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'fmgG_GroupName,fmgG_GroupCode,selectedFeeGroups');
    const url = `/FeeGroupGroupingFacade/getallfeegroups/30?${urlParams}`;
    return await api.get<IMasterGroupsGrouping[]>('fees', url);
}

export async function addOrUpdateGroupGrouping(data: any) {
    const url = '/FeeGroupGroupingFacade/SaveOrUpdateFeeGroup';
    return await api.post<any>('fees', url, data);
}

export async function deleteGroupGrouping(id: number) {
    const url = `/FeeGroupGroupingFacade/feegroups/${id}`;
    return await api.delete('fees', url);
}
