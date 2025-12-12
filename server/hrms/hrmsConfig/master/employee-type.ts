'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterEmployeeTypeList } from '@/types/hrms/hrms-config/master';

export async function getMasterEmployeeType(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmeT_EmployeeType');
    const url = `/api/MasterEmployeeTypeFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterEmployeeTypeList[]>('hrms', url);
}

export async function addOrUpdateMasterEmployeeType(data: any) {
    const url = '/api/MasterEmployeeTypeFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterEmployeeType(id: number) {
    const url = `/api/MasterEmployeeTypeFacade/toggle/${id}`;
    return await api.put('hrms', url);
}


