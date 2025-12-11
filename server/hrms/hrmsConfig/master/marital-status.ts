'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterMaritalStatusList } from '@/types/hrms/hrms-config/master';

export async function getMasterMaritalStatus(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ivrmmmS_MaritalStatus');
    const url = `/api/MasterMaritalStatusFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterMaritalStatusList[]>('hrms', url);
}

export async function addOrUpdateMasterMaritalStatus(data: any) {
    const url = '/api/MasterMaritalStatusFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterMaritalStatus(id: number) {
    const url = `/api/MasterMaritalStatusFacade/toggle/${id}`;
    return await api.put('hrms', url);
}

