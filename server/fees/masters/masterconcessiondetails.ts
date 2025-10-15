'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterConcessionDetailsList } from '@/types/fees/masters/masters';

export async function getMasterConcessionDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `FeeConcessionFacade/FeeMasterConcessionDetailsList/30?${urlParams}`;
    return await api.get<IMasterConcessionDetailsList[]>(url);
}

export async function addOrUpdateMasterConcessionDetails(data: any) {
    const url = 'FeeConcessionFacade/AddOrUpdateConcession';
    return await api.post<any>(url, data);
}

export async function toggleMasterConcessionDetails(mi_id: number, id: number) {
    const url = `FeeConcessionFacade/ToggleConcession/${id}`;
    return await api.put(url);
}
