'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubExam } from '@/types/exam/exam-module/masters';

export async function getMasterSubExam(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterSubExam[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/sub-exam-master/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterSubExam>(url);
    } catch (error: any) {
        console.error('Error fetching Master Subjects, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IMasterSubExam[] = Array.from({ length: 30 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_SubExamName: `Sub Exam Name ${i + 1}`,
            ex_SubExamCode: `Sub EXAM Code ${100 + i + 1}`,
            ex_IsActiveFlag: true
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

export async function addOrUpdateMasterSubExam(data: any) {
    const url = '/master-sub-exam';
    return await api.post<any>(url, data);
}

export async function toggleMasterSubExam(mi_id: number, id: number) {
    const url = `/master_sub-exam/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
