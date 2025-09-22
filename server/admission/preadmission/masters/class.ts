'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';

export async function getMasterClass(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/School_M_ClassFacade/30?${urlParams}`;
    return await api.getArray<IMasterClassList>(url);
}

export async function addOrUpdateMasterClass(data: any) {
    const url = '/v1/School_M_ClassFacade';
    return await api.post<any>(url, data);
}

export async function getMasterClassDetails(mi_id: number) {
    const url = `/School_M_ClassFacade/get_details/${mi_id}`;
    return await api.get<IMasterClassList>(url);
}

export async function toggleMasterClass(mi_id: number, id: number) {
    const url = `/v1/master_class/toggle/${mi_id}/${id}`;
    return await api.put(url);
}

export async function deleteMasterClass(id: string) {
    const url = `/v1/master_class/${id}`;
    return await api.delete(url);
}
