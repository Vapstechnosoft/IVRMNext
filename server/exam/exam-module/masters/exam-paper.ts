'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterExamPaper } from '@/types/exam/exam-module/masters';

export async function getMasterExamPaper(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/exam_master/GetExamMasterPaperTypeList/30?${urlParams}`;
    return await api.get<IMasterExamPaper>('exam', url);
}

export async function addOrUpdateMasterExamPaper(data: any) {
    const url = '/exam_master/AddOrUpdateExamMasterPaperType';
    return await api.post<any>('exam', url, data);
}

export async function toggleMasterExamPaper(mi_id: number, id: number) {
    const url = `/exam_master/ToggleExamMasterPaperType/${mi_id}/${id}`;
    return await api.put('exam', url);
}
