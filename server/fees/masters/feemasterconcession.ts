'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterConcessionList } from '@/types/fees/masters';

export async function getMasterConcession(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `FeeConcessionFacade/FeeMasterConcessionList/30?${urlParams}`;
    return await api.get<IMasterConcessionList[]>(url);
}

export async function addOrUpdateMasterConcession(data: any) {
    const url = 'FeeConcessionFacade/AddOrUpdateConcession';
    return await api.post<any>(url, data);
}

export async function toggleMasterConcession(mi_id: number, id: number) {
    const url = `FeeConcessionFacade/ToggleConcession/${id}`;
    return await api.put(url);
}
