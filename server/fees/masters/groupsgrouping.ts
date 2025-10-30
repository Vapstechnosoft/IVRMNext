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
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeGroupGroupingFacade/getallfeegroups/30?${urlParams}`;
    return await api.get<IMasterGroupsGrouping[]>('fees', url);
}

export async function addOrUpdateGroupGrouping(data: any) {
    const url = '/FeeGroupGroupingFacade/SaveOrUpdateFeeGroup';
    return await api.post<any>('fees', url, data);
}

export async function toggleGroupGrouping(id: number) {
    const url = `/FeeGroupGroupingFacade/feegroups/${id}`;
    return await api.put('fees', url);
}

// If backend supports a hard-delete, call DELETE on the same endpoint.
// Add a dedicated delete helper so the client can request an actual delete
// rather than toggling an active flag.
export async function deleteGroupGrouping(id: number) {
    const url = `/FeeGroupGroupingFacade/feegroups/${id}`;
    return await api.delete('fees', url);
}
