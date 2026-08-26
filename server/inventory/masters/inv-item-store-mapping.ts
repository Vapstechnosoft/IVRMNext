'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvItemStoreMappingLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_ItemStoreMapping/getloaddata?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvItemStoreMapping(data: any) {
    const url = `/INV_ItemStoreMapping/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvItemStoreMapping(data: any) {
    const url = `/INV_ItemStoreMapping/deactive`;
    return await api.post<any>('inventory', url, data);
}
