'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IGradeDetails, IMasterGrade } from '@/types/exam/exam-module/masters';

export async function getMasterGrade(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterGrade[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_grade/30?${urlParams}`;

    try {
        // Attempt API request
        return await api.getArray<IMasterGrade>(url);
    } catch (error: unknown) {
        console.error('Error fetching Master Grades, returning mock data:', error);

        // Provide fallback mock data
        const mockData: IMasterGrade[] = Array.from({ length: 5 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_GradeName: `Grade ${i + 1}`,
            ex_GradeDetails: `Grade Details for Grade ${i + 1}`,
            ex_IsActiveFlag: i % 2 === 0
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

export async function addOrUpdateMasterGrade(data: any) {
    const url = '/master-grade';
    return await api.post<any>(url, data);
}

export async function toggleMasterGrade(mi_id: number, id: number) {
    const url = `/master_grade/toggle/${mi_id}/${id}`;
    return await api.put(url);
}

export async function getMasterGradeDetails(mi_id: number, id: number): Promise<ApiResponse<IGradeDetails[]>> {
    const url = `/master_grade/toggle/${mi_id}/${id}`;

    try {
        // Try fetching from API
        return await api.getArray<IGradeDetails>(url);
    } catch (error: any) {
        console.error('Error fetching Master Grades, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IGradeDetails[] = Array.from({ length: 10 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_Grade: `Grade ${i + 1}`,
            ex_From: i * 10 + 1,
            ex_To: i * 15 + 2,
            ex_GradePoints: i % 10,
            ex_Remarks: `abcd remarks of ${i}`,
            ex_IsActiveFlag: i % 2 === 0
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}
