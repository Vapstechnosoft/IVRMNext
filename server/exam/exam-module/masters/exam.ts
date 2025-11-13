'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterExam } from '@/types/exam/exam-module/masters';

export async function getMasterExam(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/exam_master/30?${urlParams}`;
    return await api.get<IMasterExam>('exam', url);
}

export async function addOrUpdateMasterExam(data: any) {
    const url = '/exam_master';
    return await api.post<any>('exam', url, data);
}

export async function toggleMasterExam(mi_id: number, id: number) {
    const url = `/exam_master/toggle_exam_master/${mi_id}/${id}`;
    return await api.put('exam', url);
}

export async function getMasterExamOrderData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/exam_master/exam_master_order_list/30?${urlParams}`;
    return await api.get<any>('exam', url);
}
export async function UpdatedOrderdExams(data: any) {
    const url = '/exam_master/set_exam_master_order_number';
    return await api.put<any>('exam', url, data);
}

export async function getExamsByCategoryandAcademicYear(mi_id: number, asmaY_Id: number, emcA_Id: number) {
    const url = `exam_subject_mapping/exam_drop_down_By_category_list/${mi_id}/${emcA_Id}`;
    return await api.get<any>('exam', url);
}
