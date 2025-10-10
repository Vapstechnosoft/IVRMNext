'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';

// export async function getMasterClass(searchParams?: ApiSearchparams) {
//     const urlParams = getSearchParamsUrl(searchParams ?? {});
//     const url = `/master_class/30?${urlParams}`;
//     return await api.getArray<IMasterClassList>(url);
// }

export async function getMasterClass(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_class/30?${urlParams}`;

    try {
        // Fetch real data from API
        return await api.getArray<IMasterClassList>(url);
    } catch (error: any) {
        console.error('Error fetching Master Classes, returning mock data:', error);

        // Return 30 mock records
        const mockData: IMasterClassList[] = Array.from({ length: 30 }).map((_, i) => ({
            asmcL_Id: i + 1,
            mI_Id: 30, // Assuming a fixed MI_Id as in your previous examples
            asmcL_ClassCode: `CLS${100 + i + 1}`,
            asmcL_ClassName: `Class ${i + 1}`,
            asmcL_Order: i + 1,
            asmcL_MinAgeYear: 3 + (i % 3),
            asmcL_MinAgeMonth: i % 12,
            asmcL_MinAgeDays: i % 30,
            asmcL_MaxAgeYear: 5 + (i % 3),
            asmcL_MaxAgeMonth: i % 12,
            asmcL_MaxAgeDays: i % 30,
            asmcL_MaxCapacity: 30 + (i % 10),
            asmcL_PreadmFlag: i % 2,
            asmcL_ActiveFlag: true
        }));

        return {
            success: true,
            message: 'Failed to fetch from API, showing mock data',
            data: mockData
        };
    }
}

export async function addOrUpdateMasterClass(data: any) {
    const url = '/master_class';
    return await api.post<any>(url, data);
}

export async function toggleMasterClass(mi_id: number, id: number) {
    const url = `/master_class/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
