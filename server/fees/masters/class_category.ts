'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams, IDropdown } from '@/types';
import type { IMasterCasteCategoryList } from '@/types/admission/preadmission/masters';

export async function getMasterClassCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/demo?${urlParams}`;
    return await api.getArray<IMasterCasteCategoryList>(url);
}

export async function getMasterClassCategoryCodeDropdown() {
    const url = '/demo';
    return await api.get<IDropdown>(url);
}

export async function addOrUpdateMasterClassCategory(data: any) {
    const url = '/demo';
    return await api.post<any>(url, data);
}

export async function toggleMasterclassCategory(mi_id: number, id: number) {
    const url = `/demo/${mi_id}/${id}`;
    return await api.put(url);
}
