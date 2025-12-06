'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterLeaveYearList, IMasterLeaveYearSetOrderList } from '@/types/hrms/hrms-config/master';

export async function getMasterLeaveYear(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmlY_LeaveYear');
    const url = `/api/MasterLeaveYearFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterLeaveYearList[]>('hrms', url);
}

export async function addOrUpdateMasterLeaveYear(data: any) {
    const url = '/api/MasterLeaveYearFacade';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterLeaveYear(id: number) {
    const url = `/api/MasterLeaveYearFacade/deactivateRecordById/${id}`;
    return await api.put('hrms', url);
}

export async function deleteMasterLeaveYear(id: number) {
    const url = `/api/MasterLeaveYearFacade/delete/${id}`;
    return await api.delete<any>('hrms', url);
}

export async function getLeaveYearSetOrder() {
    const url = '/api/MasterLeaveYearFacade/onloadgetdetails?page=1&page_size=1000&sort_column=hrmlY_LeaveYearOrder&sort_direction=asc';
    return await api.get<IMasterLeaveYearSetOrderList[]>('hrms', url);
}

export async function updateLeaveYearSetorder(data: Array<{ id: number; order: number }>) {
    const url = '/api/MasterLeaveYearFacade/set_order';
    return await api.put<any>('hrms', url, data);
}
