'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeHeadsList } from '@/types/fees/masters';

export async function getFineSlab(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeFineSlabFacade/MasterFineSlabList/30?${urlParams}`;
    return await api.getArray<IFeeHeadsList>(url);
}

export async function addOrUpdateFineSlab(data: any) {
    const url = '/FeeFineSlabFacade/AddOrUpdate';
    return await api.post<any>(url, data);
}

export async function toggleFineSlab(mi_id: number, id: number) {
    const url = `/FeeFineSlabFacade/Toggle/${id}`;
    return await api.put(url);
}
