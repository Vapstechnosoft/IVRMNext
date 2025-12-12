'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterDepartmentList, IMasterDepartmentSetOrderList } from '@/types/hrms/hrms-config/master';

export async function getMasterDepartment(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmD_DepartmentName');
    const url = `/api/MasterDepartmentFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterDepartmentList[]>('hrms', url);
}

export async function addOrUpdateMasterDepartment(data: any) {
    const url = '/api/MasterDepartmentFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterDepartment(id: number) {
    const url = `/api/MasterDepartmentFacade/toggle/${id}`;
    return await api.put('hrms', url);
}

export async function getDepartmentSetOrder() {
    const url = '/api/MasterDepartmentFacade/set_order_list';
    return await api.get<IMasterDepartmentSetOrderList[]>('hrms', url);
}

export async function updateDepartmentSetorder(data: any) {
    const url = '/api/MasterDepartmentFacade/set_order';
    return await api.put<any>('hrms', url, data);
}
