'use server';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupsGrouping } from '@/types/fees/masters/masters';

export async function getFeeGroup(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/demo/30?${urlParams}`;
    return await api.getArray<IMasterGroupsGrouping>('fees', url);
}

export async function getFeeGroupGrouping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/demo/30?${urlParams}`;
    return await api.getArray<IMasterGroupsGrouping>('fees', url);
}

export async function addOrUpdateGroupGrouping(data: any) {
    const url = '/demo';
    return await api.post<any>('fees', url, data);
}

export async function toggleGroupGrouping(id: number) {
    const url = `/demo/${id}`;
    return await api.put('fees', url);
}
