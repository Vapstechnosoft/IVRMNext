'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubjectList, IParentSubjectDropdownList } from '@/types/library/masters/masters';

import { auth } from '@/lib/auth';

export async function getMasterSubjectList(searchParams?: ApiSearchparams) {
    try {
        const session = await auth();
        const urlParams = getSearchParamsUrl({ ...searchParams, mI_Id: session?.mi_id }, 'lmS_SubjectName');
        const url = `/MasterSubject/master-subject-list?${urlParams}`;
        return await api.get<IMasterSubjectList[]>('library', url);
    } catch (error) {
        console.error('getMasterSubjectList error:', error);
        return [] as IMasterSubjectList[];
    }
}

export async function addOrUpdateMasterSubject(data: any) {
    try {
        const session = await auth();
        const payload = {
            LMS_Id: data.lmS_Id || 0,
            LMS_SubjectNo: data.lmS_SubjectNo,
            LMS_SubjectName: data.lmS_SubjectName,
            LMS_ParentId: data.lmS_ParentId || 0,
            LMS_Level: data.lmS_Level,
            LMS_ClassNo: data.lmS_ClassNo,
            MI_Id: session?.mi_id
        };

        const url = '/api/MasterSubject/add-or-update';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save record' };
    }
}

export async function toggleMasterSubject(id: number) {
    try {
        const url = `/MasterSubject/toggle/${id}`;
        return await api.put<any>('library', url);




    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}

export async function deleteMasterSubject(id: number) {
    try {
        const url = `/MasterSubject/Delete?id=${id}`;
        return await api.delete('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete record' };
    }
}

export async function getparentsubjectdropdown() {
    try {
        const url = '/MasterSubject/parent-subject-dropdown';
        return await api.get<IParentSubjectDropdownList[]>('library', url);
    } catch (error) {
        console.error('getparentsubjectdropdown error:', error);
        return { data: [] } as any; // Handling case where it might be wrapped in { data: [] }
    }
}
