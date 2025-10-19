'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';

// 1️⃣ Get all Master Subject Groups
export async function getMasterSubjectGroup(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject_group/30?${urlParams}`;
    return await api.get<IMasterSubjectGroup>('exam', url);
}

// 2️⃣ Get details for a single Master Subject Group
export async function getMasterSubjectGroupDetails(groupId: number) {
    const url = `/master_subject_group/subject_group_details_view_by_id/${groupId}`;
    return await api.get<IMasterSubjectGroupDetails>('exam', url);
}

// 3️⃣ Add or Update Master Subject Group
export async function addOrUpdateMasterSubjectGroup(data: any) {
    const url = '/master_subject_group';
    return await api.post<any>('exam', url, data);
}

// 4️⃣ Toggle Master Subject Group Status
export async function toggleMasterSubjectGroup(mi_id: number, id: number) {
    const url = `/master_subject_group/toggle/${mi_id}/${id}`;
    return await api.put('exam', url);
}

export async function getAllMasterSubjectDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject_group/master_subject_active_list/30?${urlParams}`;
    return await api.get<IMasterSubjectGroupDetails>('exam', url);
}
