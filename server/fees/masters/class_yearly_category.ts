'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassYearlyList } from '@/types/fees/masters/masters';

export async function getMasterClassYearlyCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/fee_class_category/yearlyclasscategorylist/30?${urlParams}`;
    return await api.get<IMasterClassYearlyList[]>(url);
}

export async function getAcademicYearDropdown() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IMasterClassYearlyList[]>(url);
}

export async function getClassCategory() {
    const url = '/fee_class_category/classcategorylist/30';
    return await api.get<IMasterClassYearlyList[]>(url);
}

export async function MasterClassYearlyCategory(data: any) {
    const url = '/api/fee_class_category/classcategorylist';
    return await api.post<any>(url, data);
}

export async function addOrUpdateMasterClassYearlyCategory(data: any) {
    const url = '/demo';
    return await api.post<any>(url, data);
}

export async function toggleMasterclassYearlyCategory(mi_id: number, id: number) {
    const url = `/demo/${mi_id}/${id}`;
    return await api.put(url);
}
