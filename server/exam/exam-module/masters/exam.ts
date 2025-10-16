'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterExam } from '@/types/exam/exam-module/masters';

export async function getMasterExam(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/exam_master/30?${urlParams}`;
    return await api.get<IMasterExam>(url);
}

export async function addOrUpdateMasterExam(data: any) {
    const url = '/exam_master/AddOrUpdateExamMaster';
    return await api.put<any>(url, data);
}

export async function toggleMasterExam(mi_id: number, id: number) {
    const url = `/exam_master/ToggleExamMaster/${mi_id}/${id}`;
    return await api.put(url);
}

export async function getMasterExamOrderData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/exam_master/GetSortedExamMaster/30?${urlParams}`;
    return await api.get<any>(url);
}
export async function UpdatedOrderdExams(data: any) {
    const url = '/exam_master/SetExamMasterOrderNumber';
    return await api.put<any>(url, data);
}
