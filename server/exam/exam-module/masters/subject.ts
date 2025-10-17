'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubject } from '@/types/exam/exam-module/masters';

export async function getMasterSubject(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    const url = `/master_subject/30?${urlParams}&search_column=ismS_SubjectName,ismS_SubjectCode`;
    console.log('url', url);
    console.info(url);
    return api.get<IMasterSubject[]>('exam', url);
}

export async function addOrUpdateMasterSubject(data: any) {
    const url = '/master_subject/AddOrUpdateMasterSubject';
    return await api.post<any>('exam', url, data);
}

export async function toggleMasterSubject(mi_id: number, id: number) {
    const url = `/master_subject/toggle/${mi_id}/${id}`;
    return await api.put('exam', url);
}

export async function getMasterSubjectOrderData(mi_id: number) {
    const url = `/master_subject/GetMasterSubjectOrderList/${mi_id}`;
    return await api.get('exam', url);
}

export async function UpdatedOrderdSubjects(data: any) {
    const url = '/master_subject/SetMasterSubjectOrderNumber';
    return await api.put<any>('exam', url, data);
}
