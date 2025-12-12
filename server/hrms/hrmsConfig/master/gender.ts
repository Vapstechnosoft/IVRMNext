'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGenderList } from '@/types/hrms/hrms-config/master';

export async function getMasterGender(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ivrmmG_GenderName');
    const url = `/api/MasterGenderFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterGenderList[]>('hrms', url);
}

export async function addOrUpdateMasterGender(data: any) {
    const url = '/api/MasterGenderFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterGender(id: number) {
    const url = `/api/MasterGenderFacade/toggle/${id}`;
    return await api.put('hrms', url);
}
