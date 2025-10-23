'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IGradeDetails, IMasterGrade } from '@/types/exam/exam-module/masters';

export async function getMasterGrade(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_exam_grade/30?${urlParams}`;
    return await api.get<IMasterGrade>('exam', url);
}
export async function addOrUpdateMasterGrade(data: any) {
    const url = '/master_exam_grade';
    return await api.post<any>('exam', url, data);
}

export async function getGradeDetailsById(id: number) {
    const url = `/master_exam_grade/exam_grade_details_by_id/${id}`;
    return await api.get<IGradeDetails>('exam', url);
}

export async function toggleMasterGrade(mi_id: number, id: number) {
    const url = `/master_exam_grade/toggle/${mi_id}/${id}`;
    return await api.put('exam', url);
}
