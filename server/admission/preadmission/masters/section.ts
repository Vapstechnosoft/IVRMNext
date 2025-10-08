'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSectionList } from '@/types/admission/preadmission/masters';

export async function getMasterSection(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_section/30?${urlParams}`;
    return await api.get<IMasterSectionList[]>(url);
}

export async function addOrUpdateMasterSection(data: any) {
    const url = '/master_section';
    return await api.post<any>(url, data);
}

export async function toggleMasterSection(mi_id: number, id: number) {
    const url = `/master_section/toggle/${mi_id}/${id}`;
    return await api.put(url);
}
