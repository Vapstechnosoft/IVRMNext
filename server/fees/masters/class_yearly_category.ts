'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassYearlyList } from '@/types/fees/masters/masters';

export async function getMasterClassYearlyCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/fee_class_category/yearlyclasscategorylist/30?${urlParams}`;
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getAcademicYearDropdown() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getClassCategory() {
    const url = '/fee_class_category/classcategorylist/30';
    return await api.get<IMasterClassYearlyList[]>('fees', url);
}

export async function getGroupListCategory(mi_id: number, asmay_id: number, data: any) {
    const url = `/fee_class_category/class_drop_down_list?mi_id=${mi_id}&asmay_id=${asmay_id}`;

    return await api.post<any>('fees', url, data);
}

export async function addOrUpdateMasterClassYearlyCategory(data: any) {
    const url = '/fee_class_category/AddOrUpdateYearlyClassCategory';
    return await api.post<any>('fees', url, data);
}

export async function toggleMasterclassYearlyCategory(id: number) {
    const url = `/fee_class_category/AddOrUpdateYearlyClassCategory/${id}`;
    return await api.put('fees', url);
}
