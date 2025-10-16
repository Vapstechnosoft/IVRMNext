'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubExam } from '@/types/exam/exam-module/masters';

export async function getMasterSubExam(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_sub_exam/30?${urlParams}`;
    return await api.get<IMasterSubExam>(url);
}

export async function addOrUpdateMasterSubExam(data: any) {
    const url = '/master-sub-exam';
    return await api.post<any>(url, data);
}

export async function toggleMasterSubExam(mi_id: number, id: number) {
    const url = `/master_sub-exam/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
