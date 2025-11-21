'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamLoginPrivileges } from '@/types/exam/exam-module/exam-mapping';

export async function getExamLoginPrivileges(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_login_privileges/30?${urlParams}`;
    console.log(url);
    return await api.get<IExamLoginPrivileges>('exam', url);
}

export async function addorUpdateExamLoginPrivileges(data: any) {
    const url = '/exam_master/add_or_update_exam_master_paper_type';
    return await api.post<any>('exam', url, data);
}
