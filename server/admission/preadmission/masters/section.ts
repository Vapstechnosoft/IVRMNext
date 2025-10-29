'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSectionList } from '@/types/admission/preadmission/masters';

export async function getMasterSection(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmC_SectionCode,asmC_SectionName');
    const url = `/master_section?${urlParams}`;
    return await api.get<IMasterSectionList[]>('admission', url);
}

export async function addOrUpdateMasterSection(data: any) {
    const url = '/master_section';
    return await api.post<any>('admission', url, data);
}

export async function toggleMasterSection(id: number) {
    const url = `/master_section/toggle/${id}`;
    return await api.put('admission', url);
}
