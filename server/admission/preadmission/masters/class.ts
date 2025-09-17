'use server';

import { api, ApiResponse, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams, IDropdown } from '@/types';
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

export async function getTestDropdown(asmay_id: number, mi_id: number) {
    // const url = `/v1/master_class/drop_down_list1/${asmay_id}/${mi_id}`;
    // return await api.get<IDropdown[]>(url);

    const response: ApiResponse<IDropdown[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                id: 1,
                code: 'VAL-001',
                name: 'Value 1'
            },
            {
                id: 2,
                code: 'VAL-002',
                name: 'Value 2'
            },
            {
                id: 3,
                code: 'VAL-003',
                name: 'Value 3'
            },
            {
                id: 4,
                code: 'VAL-004',
                name: 'Value 4'
            },
            {
                id: 5,
                code: 'VAL-005',
                name: 'Value 5'
            }
        ]
    };

    return response;
}

export async function addMasterClass(data: any) {
    const url = '/v1/master_class';
    return await api.post<any>(url, data);
}
