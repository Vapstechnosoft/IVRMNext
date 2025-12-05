'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterDesignationList, IMasterDesignationSetOrderList } from '@/types/hrms/hrms-config/master';

export async function getMasterDesignation(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmdeS_DesignationName');
    const url = `/api/MasterDesignationFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterDesignationList[]>('hrms', url);
}

export async function addOrUpdateMasterDesignation(data: any) {
    const url = '/api/MasterDesignationFacade';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterDesignation(id: number) {
    const url = `/api/MasterDesignationFacade/deactivateRecordById/${id}`;
    return await api.put('hrms', url);
}

export async function deleteMasterDesignation(id: number) {
    const url = `/api/MasterDesignationFacade/delete/${id}`;
    return await api.delete<any>('hrms', url);
}

export async function getDesignationSetOrder() {
    const url = '/api/MasterDesignationFacade/set_order_list';
    return await api.get<IMasterDesignationSetOrderList[]>('hrms', url);
}

export async function updateDesignationSetorder(data: any) {
    const url = '/api/MasterDesignationFacade/set_order';
    return await api.put<any>('hrms', url, data);
}
