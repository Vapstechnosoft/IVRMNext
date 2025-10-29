'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';

export async function getMasterClass(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmcL_ClassCode,asmcL_ClassName');
    const url = `/master_class?${urlParams}`;
    return await api.get<IMasterClassList[]>('admission', url);
}

export async function addOrUpdateMasterClass(data: any) {
    const url = '/master_class';
    return await api.post<any>('admission', url, data);
}

export async function toggleMasterClass(id: number) {
    const url = `/master_class/toggle/${id}`;
    return await api.put('admission', url);
}
