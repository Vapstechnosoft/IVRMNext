'use server';

import { api, ApiResponse, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';

export async function getMasterClass(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/v1/master_class?${urlParams}`;
    // return await api.get<IMasterClassList[]>(url);

    const response: ApiResponse<IMasterClassList[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                id: 1,
                code: 'Class-001',
                name: 'First Standard',
                active_flag: true
            },
            {
                id: 2,
                code: 'Class-002',
                name: 'Second Standard',
                active_flag: false
            },
            {
                id: 3,
                code: 'Class-003',
                name: 'Third Standard',
                active_flag: true
            },
            {
                id: 4,
                code: 'Class-004',
                name: 'Fourth Standard',
                active_flag: false
            }
        ]
    };

    return response;
}

export async function deleteMasterClass(id: string) {
    const url = `/v1/master_class/${id}`;
    return await api.delete(url);
}

export async function toggleMasterClass(id: string) {
    const url = `/v1/master_class/active_inactive/${id}`;
    return await api.put(url);
}
