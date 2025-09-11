'use server';

import { api, type ApiResponse, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClass, IMasterClassList } from '@/types/admission/masters';

export async function addOrUpdateMasterClass(data: IMasterClass) {
    const url = '/v1/admission/masters/class';
    return await api.post<any>(url, data);
}

export async function getMasterClass(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/v1/admission/masters/class?${urlParams}`;
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
    const url = `/v1/admission/masters/class/${id}`;
    return await api.delete(url);
}

export async function toggleMasterClass(id: string) {
    const url = `/v1/admission/masters/class/active_inactive/${id}`;
    return await api.put(url);
}
