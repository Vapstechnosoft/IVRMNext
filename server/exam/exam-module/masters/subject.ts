'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubject, IMasterSubjectOrder } from '@/types/exam/exam-module/masters';

export async function getMasterSubject(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterSubject[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterSubject>(url);
    } catch (error: any) {
        console.error('Error fetching Master Subjects, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IMasterSubject[] = Array.from({ length: 30 }).map((_, i) => ({
            exsuB_Id: i + 1,
            exsuB_SubjectName: `Subject ${i + 1}`,
            exsuB_IVRSName: `IVRS_Subject_${i + 1}`,
            exsuB_SubjectCode: `SUB${100 + i + 1}`,
            exsuB_SubjectType: i % 2 === 0 ? 'Theory' : 'Practical',
            exsuB_MaxMarks: 100,
            exsuB_MinMarks: 35,
            exsuB_PreAdmissionFlag: i % 2,
            exsuB_AttendanceFlag: i % 2,
            exsuB_BatchWiseFlag: i % 2,
            exsuB_ExamFlag: 1,
            exsuB_LanguageFlag: i % 2,
            exsuB_ExtraFeeFlag: 0,
            exsuB_IsActiveFlag: true
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

export async function addOrUpdateMasterSubject(data: any) {
    const url = '/master_subject';
    return await api.post<any>(url, data);
}

export async function toggleMasterSubject(mi_id: number, id: number) {
    const url = `/master_class/toggle/${mi_id}/${id}`;
    return await api.put(url);
}

export async function getMasterSubjectOrderData(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterSubjectOrder[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterSubjectOrder>(url);
    } catch (error: any) {
        console.error('Error fetching Master Subjects, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IMasterSubjectOrder[] = Array.from({ length: 30 }).map((_, i) => ({
            exsuB_Id: i + 1,
            exsuB_SubjectName: `Subject ${i + 1}`,
            exsuB_SubjectCode: `SUB${100 + i + 1}`,
            exsuB_SubjectOrder: i + 1
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}
