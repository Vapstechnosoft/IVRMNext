'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubSubject } from '@/types/exam/exam-module/masters';

// ✅ Get Master SubSubjects
export async function getMasterSubSubject(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterSubSubject[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subsubject/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterSubSubject>(url);
    } catch (error: any) {
        console.error('Error fetching Master SubSubjects, returning mock data:', error);

        // Return 30 mock records if API fails
        const mockData: IMasterSubSubject[] = Array.from({ length: 30 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_SubSubjectName: `SubSubject ${i + 1}`,
            ex_SubSubjectCode: `SUBSUB${100 + i + 1}`,
            ex_IsActiveFlag: i % 2 === 0,
            ex_SubSubjectOrder: i + 1 // Added order field for table display
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

// ✅ Add or Update Master SubSubject
export async function addOrUpdateMasterSubSubject(data: any) {
    const url = '/master_subsubject';
    return await api.post<any>(url, data);
}

// ✅ Toggle Master SubSubject
export async function toggleMasterSubSubject(mi_id: number, id: number) {
    const url = `/master_subsubject/toggle/${mi_id}/${id}`;
    return await api.put(url);
}

export async function getMasterSubSubjectOrderData(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterSubSubject[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subsubject/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterSubSubject>(url);
    } catch (error: any) {
        console.error('Error fetching Master SubSubjects, returning mock data:', error);

        // Return 30 mock records if API fails
        const mockData: IMasterSubSubject[] = Array.from({ length: 30 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_SubSubjectName: `SubSubject ${i + 1}`,
            ex_SubSubjectCode: `SUBSUB${100 + i + 1}`,
            ex_IsActiveFlag: i % 2 === 0,
            ex_SubSubjectOrder: i + 1 // Added order field for table display
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}
