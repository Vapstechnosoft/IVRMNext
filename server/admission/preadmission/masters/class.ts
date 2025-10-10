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
    return await api.get<IMasterClassList[]>(url);
}

export async function addOrUpdateMasterClass(data: any) {
    const url = '/master_class';
    return await api.post<any>(url, data);
}

export async function toggleMasterClass(mi_id: number, id: number) {
    const url = `/master_class/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
