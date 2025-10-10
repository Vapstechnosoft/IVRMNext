'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterExamPaper } from '@/types/exam/exam-module/masters';

export async function getMasterExamPaper(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterExamPaper[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterExamPaper>(url);
    } catch (error: any) {
        console.error('Error fetching Master Subjects, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IMasterExamPaper[] = Array.from({ length: 30 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_ExamPaperType: `Exam Paper ${i + 1}`,
            ex_DisplayColor: `EXAM Paper ${100 + i + 1}`,
            ex_PaperTypeDescription: `EXAM Paper Description${100 + i + 1}`,
            ex_IsActiveFlag: true
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

export async function addOrUpdateMasterExamPaper(data: any) {
    const url = '/master-exam-paper';
    return await api.post<any>(url, data);
}

export async function toggleMasterExamPaper(mi_id: number, id: number) {
    const url = `/master_exam-paper/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
