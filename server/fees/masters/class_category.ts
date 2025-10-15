'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterCasteCategoryList } from '@/types/admission/preadmission/masters';

export async function getMasterClassCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/fee_class_category/30?${urlParams}`;

    return await api.get<IMasterCasteCategoryList[]>(url);
}

export async function addOrUpdateMasterClassCategory(data: any) {
    const url = '/fee_class_category/';
    return await api.post<any>(url, data);
}

export async function toggleMasterclassCategory(id: number) {
    const url = `/api/fee_class_category/deactivate/${id}`;
    return await api.put(url);
}
