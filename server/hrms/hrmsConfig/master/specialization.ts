'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSpecializationList } from '@/types/hrms/hrms-config/master';

export async function getMasterSpecialization(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmspL_SpecialisationName');
    const url = `/api/MasterSpecialisationFacade/Getinitialdata?${urlParams}`;
    return await api.get<IMasterSpecializationList[]>('hrms', url);
}

export async function addOrUpdateMasterSpecialization(data: any) {
    const url = '/api/MasterSpecialisationFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterSpecialization(id: number) {
    const url = `/api/MasterSpecialisationFacade/toggle/${id}`;
    return await api.put('hrms', url);
}
