'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IAcademicYearDropDown,
    IMasterCategoryDropDown,
    IMasterClassCategoryList,
    IMasterClassDropDown
} from '@/types/admission/preadmission/masters';

export async function getMasterClassCategory(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_class_category/30?${urlParams}`;
    return await api.get<IMasterClassCategoryList[]>(url);
}

export async function getAcademicYearDropdown() {
    const url = '/master_class_category/academic_year_drop_down_list/30';
    return await api.get<IAcademicYearDropDown[]>(url);
}

export async function getMasterCategoryDropdown() {
    const url = '/master_class_category/master_category_drop_down_list/30';
    return await api.get<IMasterCategoryDropDown[]>(url);
}

export async function getMasterClassDropdown() {
    const url = '/master_class_category/master_class_drop_down_list/30';
    return await api.get<IMasterClassDropDown[]>(url);
}

export async function getMasterSectionDropdown() {
    const url = '/master_class_category/master_section_drop_down_list/30';
    return await api.get<IMasterClassDropDown[]>(url);
}

export async function addMasterClassCategory(data: any) {
    const url = '/master_class_category';
    return await api.post<any>(url, data);
}

export async function toggleMasterClassCategory(id: number) {
    const url = `/master_class_category/toggle/30/${id}`;
    return await api.put(url);
}
