'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupTypeList, IMasterGroupTypeSetOrderList } from '@/types/hrms/hrms-config/master';

export async function getMasterGroupType(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmgT_EmployeeGroupType,hrmgT_Code');
    const url = `/api/MasterGroupTypeFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterGroupTypeList[]>('hrms', url);
}

export async function addOrUpdateMasterGroupType(data: any) {
    const url = '/api/MasterGroupTypeFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterGroupType(id: number) {
    const url = `/api/MasterGroupTypeFacade/toggle/${id}`;
    return await api.put('hrms', url);
}

export async function getGroupTypeSetOrder() {
    const url = '/api/MasterGroupTypeFacade/set_order_list';
    return await api.get<IMasterGroupTypeSetOrderList[]>('hrms', url);
}

export async function updateGroupTypeSetorder(data: Array<{ id: number; order: number }>) {
    const url = '/api/MasterGroupTypeFacade/set_order';
    return await api.put<any>('hrms', url, data);
}
