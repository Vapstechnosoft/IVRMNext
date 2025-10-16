'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';

// 1️⃣ Get all Master Subject Groups
export async function getMasterSubjectGroup(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject_group/30?${urlParams}`;
    return await api.get<IMasterSubjectGroup>(url);
}

// 2️⃣ Get details for a single Master Subject Group
export async function getMasterSubjectGroupDetails(groupId: number) {
    const url = `/master_subject_group/GetSubjectGroupDetailsViewById/${groupId}`;
    return await api.get<IMasterSubjectGroupDetails>(url);
}

// 3️⃣ Add or Update Master Subject Group
export async function addOrUpdateMasterSubjectGroup(data: any) {
    const url = '/master_subject_group/AddOrUpdateMasterSubjectGroup';
    return await api.post<any>(url, data);
}

// 4️⃣ Toggle Master Subject Group Status
export async function toggleMasterSubjectGroup(mi_id: number, id: number) {
    const url = `/master_subject_group/toggle/${mi_id}/${id}`;
    return await api.put(url);
}

export async function getAllMasterSubjectDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject_group/GetMasterSubjectActiveList/30?${urlParams}`;
    return await api.get<IMasterSubjectGroupDetails>(url);
}
