'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassYearlyList } from '@/types/fees/masters/masters';

export async function getMasterCategoryDropdown(searchParams: ApiSearchparams | undefined) {
    const url = '/master_class_category/master_category_drop_down_list/30';
    return await api.get<IMasterClassYearlyList>(url);
}

export async function getAcademicYearDropdown() {
    const url = '/master_class_category/academic_year_drop_down_list/30';
    return await api.get<IMasterClassYearlyList>(url);
}

export async function addOrUpdateMasterClassYearlyCategory(data: any) {
    const url = '/demo';
    return await api.post<any>(url, data);
}
export async function getMasterClassYearlyCategory(data: any) {
    const url = '/demo';
    return await api.post<any>(url, data);
}

export async function toggleMasterclassYearlyCategory(mi_id: number, id: number) {
    const url = `/demo/${mi_id}/${id}`;
    return await api.put(url);
}

export async function getMasterClassYearlyDataCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/demo?${urlParams}`;
    return await api.getArray<IMasterClassYearlyList>(url);
}
