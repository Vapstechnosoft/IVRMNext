'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterExam } from '@/types/exam/exam-module/masters';

export async function getMasterExam(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterExam[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterExam>(url);
    } catch (error: any) {
        console.error('Error fetching Master Subjects, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IMasterExam[] = Array.from({ length: 30 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_ExamName: `Exam ${i + 1}`,
            ex_IVRSExamName: `IVRS_Exam_${i + 1}`,
            ex_ExamCode: `EXAM ${100 + i + 1}`,
            ex_ExamOrder: i,
            ex_ExamDescription: `EXAM Description abcdefghijklmnopqrstuvwxyz  ${100 + i + 1}`,
            ex_FinalExamFlag: i % 2,
            ex_SubjectWiseMarksPublishFlag: i % 2,
            ex_IsActiveFlag: true
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

export async function addOrUpdateMasterExam(data: any) {
    const url = '/master-exam';
    return await api.post<any>(url, data);
}

export async function toggleMasterExam(mi_id: number, id: number) {
    const url = `/master_exam/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
