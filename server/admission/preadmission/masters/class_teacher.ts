'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassDropDown, IMasterClassTeacherList } from '@/types/admission/preadmission/masters';

export async function getMasterClassTeacher(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmcL_ClassName,asmaY_Year,asmC_SectionName');
    const url = `/class_teacher_mapping?${urlParams}`;
    return await api.get<IMasterClassTeacherList[]>('admission', url);
}
export async function getMasterSectionDropdown() {
    const url = '/master_caste/master_caste_category_drop_down_list';
    return await api.get<IMasterClassDropDown[]>('admission', url);
}
export async function ToggleMasterClassTeacherForm(id: number) {
    const url = `class_teacher_mapping/toggle/${id}`;
    return await api.put('admission', url);
}
export async function addOrUpdateMasterClassTeacher(data: any) {
    const url = '/class_teacher_mapping';
    return await api.post<any>('admission', url, data);
}
export async function getEmployeeDrowpDown(id: number) {
    const url = `/class_teacher_mapping/get_academic_teacher_drop_down_list/${id}`;
    return await api.get('admission', url);
}
