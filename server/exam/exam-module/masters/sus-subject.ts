'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubSubject } from '@/types/exam/exam-module/masters';

// ✅ Get Master SubSubjects
export async function getMasterSubSubject(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_sub_subject/30?${urlParams}`;
    return await api.get<IMasterSubSubject>('exam', url);
}

// ✅ Add or Update Master SubSubject
export async function addOrUpdateMasterSubSubject(data: any) {
    const url = '/master_sub_subject/AddOrUpdateMasterSubSubject';
    return await api.post<any>('exam', url, data);
}

// ✅ Toggle Master SubSubject
export async function toggleMasterSubSubject(mi_id: number, id: number) {
    const url = `/master_sub_subject/toggle/${mi_id}/${id}`;
    return await api.put('exam', url);
}

export async function getMasterSubSubjectOrderData(mi_id: number) {
    const url = `/master_sub_subject/GetOrderedMasterSubSubjects/${mi_id}`;
    return await api.get('exam', url);
}

export async function UpdatedOrderdSubSubjects(data: any) {
    const url = '/master_sub_subject/SetMasterSubSubjectOrderNumber';
    return await api.put<any>('exam', url, data);
}
