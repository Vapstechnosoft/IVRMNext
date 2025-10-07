'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterReligionList } from '@/types/admission/preadmission/masters';

export async function getMasterReligion(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_religion?${urlParams}`;
    return await api.get<IMasterReligionList[]>(url);
}

export async function addOrUpdateMasterReligion(data: any) {
    const url = '/master_religion';
    return await api.post<any>(url, data);
}

export async function toggleMasterReligion(id: number) {
    const url = `/master_religion/toggle/${id}`;
    return await api.put(url);
}
