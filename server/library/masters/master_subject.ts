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

        const toNumber = (val: any) => {
            if (val === undefined || val === null || val === '') return 0;
            const num = Number(val);
            return isNaN(num) ? val : num;
        };

        const payload = {
            LMS_Id: data.lmS_Id !== undefined ? Number(data.lmS_Id) : data.LMS_Id !== undefined ? Number(data.LMS_Id) : 0,
            LMS_SubjectNo:
                data.lmS_SubjectNo !== undefined
                    ? toNumber(data.lmS_SubjectNo)
                    : data.LMS_SubjectNo !== undefined
                      ? toNumber(data.LMS_SubjectNo)
                      : 0,
            LMS_SubjectName: data.lmS_SubjectName || data.LMS_SubjectName || '',
            LMS_ParentId:
                data.lmS_ParentId !== undefined
                    ? Number(data.lmS_ParentId)
                    : data.LMS_ParentId !== undefined
                      ? Number(data.LMS_ParentId)
                      : 0,
            LMS_Level:
                data.lmS_Level !== undefined ? toNumber(data.lmS_Level) : data.LMS_Level !== undefined ? toNumber(data.LMS_Level) : 0,
            LMS_ClassNo:
                data.lmS_ClassNo !== undefined
                    ? toNumber(data.lmS_ClassNo)
                    : data.LMS_ClassNo !== undefined
                      ? toNumber(data.LMS_ClassNo)
                      : 0,
            MI_Id: session?.mi_id
        };

        const url = '/MasterSubject/add-or-update/';
        const res = await api.post<any>('library', url, payload);

        const isSuccess =
            res &&
            (res.success === true ||
                res.returnval === true ||
                res.returnval === 'save' ||
                res.returnval === 'update' ||
                res.returnval_add === true ||
                res.returnval_Update === true ||
                (typeof res.returnval === 'string' && res.returnval.toLowerCase().includes('save')) ||
                (typeof res.returnval === 'string' && res.returnval.toLowerCase().includes('update')) ||
                (typeof res.message === 'string' && res.message.toLowerCase().includes('save')) ||
                (typeof res.message === 'string' && res.message.toLowerCase().includes('update')) ||
                (typeof res.message === 'string' && res.message.toLowerCase().includes('success')) ||
                (res.returnval !== false &&
                    res.returnval !== 'duplicate' &&
                    !res.message?.toLowerCase().includes('duplicate') &&
                    !res.message?.toLowerCase().includes('fail')));

        return {
            success: !!isSuccess,
            message: res?.message || (isSuccess ? 'Subject saved successfully' : 'Failed to save subject'),
            data: res
        };
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
