'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterCategoryList } from '@/types/admission/preadmission/masters';

export async function getMasterCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_category/30?${urlParams}`;
    return await api.get<IMasterCategoryList[]>('admission', url);
}

export async function addOrUpdateMasterCategory(data: any) {
    const url = '/master_category';
    return await api.post<any>('admission', url, data);
}

export async function toggleMasterCategory(mi_id: number, id: number) {
    const url = `/master_category/toggle/${mi_id}/${id}`;
    return await api.put('admission', url);
}
