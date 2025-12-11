'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGradeList, IMasterGradeSetOrderList } from '@/types/hrms/hrms-config/master';

export async function getMasterGrade(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmG_GradeName,hrmG_GradeDisplayName');
    const url = `/api/MasterGradeFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterGradeList[]>('hrms', url);
}

export async function addOrUpdateMasterGrade(data: any) {
    const url = '/api/MasterGradeFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterGrade(id: number) {
    const url = `/api/MasterGradeFacade/toggle/${id}`;
    return await api.put('hrms', url);
}

export async function getGradeSetOrder() {
    const url = '/api/MasterGradeFacade/set_order_list';
    return await api.get<IMasterGradeSetOrderList[]>('hrms', url);
}

export async function updateGradeSetorder(data: Array<{ id: number; order: number }>) {
    const url = '/api/MasterGradeFacade/set_order';
    return await api.put<any>('hrms', url, data);
}
