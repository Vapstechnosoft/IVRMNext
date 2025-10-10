'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterCategory } from '@/types/exam/exam-module/masters';

export async function getExamMasterCategory(searchParams?: ApiSearchparams): Promise<ApiResponse<IMasterCategory[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_category/30?${urlParams}`;

    try {
        // Try fetching from API
        return await api.getArray<IMasterCategory>(url);
    } catch (error: any) {
        console.error('Error fetching Master Categories, returning mock data:', error);

        // Return 30 hardcoded mock records if API fails
        const mockData: IMasterCategory[] = Array.from({ length: 30 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_CategoryName: `Category ${i + 1}`,
            ex_CCEPromotionApplicableFlag: i % 2,
            ex_IsActiveFlag: i % 2 === 0
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

export async function addOrUpdateExamMasterCategory(data: any) {
    const url = '/master-category';
    return await api.post<any>(url, data);
}

export async function toggleMasterExamCategory(mi_id: number, id: number) {
    const url = `/master_category/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
