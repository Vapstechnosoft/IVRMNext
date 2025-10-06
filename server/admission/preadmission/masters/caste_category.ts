'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams, IDropdown } from '@/types';
import type { IMasterCasteCategoryList } from '@/types/admission/preadmission/masters';

export async function getMasterCasteCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_caste_category?${urlParams}`;
    return await api.getArray<IMasterCasteCategoryList>(url);
}

export async function getMasterCasteCategoryCodeDropdown() {
    const url = '/master_caste_category/caste_category_code_drop_down_list';
    return await api.getArray<IDropdown>(url);
}

export async function addOrUpdateMasterCasteCategory(data: any) {
    const url = '/master_caste_category';
    return await api.post<any>(url, data);
}
