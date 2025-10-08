'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterCasteCategoryDropDown, IMasterCasteList } from '@/types/admission/preadmission/masters';

export async function getMasterCaste(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_caste/30?${urlParams}`;
    return await api.get<IMasterCasteList[]>(url);
}

export async function getMasterCasteCategoryDropdown() {
    const url = '/master_caste/master_caste_category_drop_down_list';
    return await api.get<IMasterCasteCategoryDropDown[]>(url);
}

export async function addOrUpdateMasterCaste(data: any) {
    const url = '/master_caste';
    return await api.post<any>(url, data);
}
