'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFineSlabList } from '@/types/fees/masters/masters';

export async function getFineSlab(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'fs_FineSlabName,fs_FineType,fs_FromDay,fs_ToDay,fs_Amount');
    const url = `/FeeFineSlab/MasterFineSlabList/30?${urlParams}`;
    return await api.get<IFineSlabList[]>('fees', url);
}

export async function addOrUpdateFineSlab(data: any) {
    const url = '/FeeFineSlab/AddOrUpdate';
    return await api.post<any>('fees', url, data);
}

export async function toggleFineSlab(mi_id: number, id: number) {
    const url = `/FeeFineSlab/Toggle/${id}`;
    return await api.put('fees', url);
}
