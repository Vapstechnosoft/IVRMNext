'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';

// 1️⃣ Get all Master Subject Groups
export async function getMasterSubjectGroup(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterSubjectGroup[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_subject_group/30?${urlParams}`;

    try {
        return await api.getArray<IMasterSubjectGroup>(url);
    } catch (error: unknown) {
        console.error('Error fetching Master Subject Groups, returning mock data:', error);

        // Mock data fallback
        const mockData: IMasterSubjectGroup[] = Array.from({ length: 5 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_GroupName: `Group ${i + 1}`,
            ex_MaxApplicapleSubjects: 10,
            ex_MinApplicableSubjects: 3,
            ex_BestOffSubjects: 2,
            ex_ElectiveSubjects: 3,
            ex_IsActiveFlag: i % 2 === 0
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

// 2️⃣ Get details for a single Master Subject Group
export async function getMasterSubjectGroupDetails(mi_id: number, groupId: number): Promise<ApiResponse<IMasterSubjectGroupDetails[]>> {
    const url = `/master_subject_group/details/${mi_id}/${groupId}`;

    try {
        return await api.getArray<IMasterSubjectGroupDetails>(url);
    } catch (error: any) {
        console.error('Error fetching Master Subject Group Details, returning mock data:', error);

        const mockData: IMasterSubjectGroupDetails[] = Array.from({ length: 5 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_SubjectName: `Subject ${i + 1}`,
            ex_SubjectCode: `SUB${i + 1}`
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

// 3️⃣ Add or Update Master Subject Group
export async function addOrUpdateMasterSubjectGroup(data: any) {
    const url = '/master-subject-group';
    return await api.post<any>(url, data);
}

// 4️⃣ Toggle Master Subject Group Status
export async function toggleMasterSubjectGroup(mi_id: number, id: number) {
    const url = `/master_subject_group/toggle/${mi_id}/${id}`;
    return await api.put(url);
}

export async function getAllMasterSubjectDetails(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterSubjectGroupDetails[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_all_subject/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterSubjectGroupDetails>(url);
    } catch (error: any) {
        console.error('Error fetching Master Subjects, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IMasterSubjectGroupDetails[] = Array.from({ length: 40 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_SubjectName: `Subject ${i + 1}`,
            ex_SubjectCode: `SUB${100 + i + 1}`
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}
