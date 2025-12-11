'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterCourseList, IMasterCourseSetOrderList } from '@/types/hrms/hrms-config/master';

export async function getMasterCourse(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmC_QulaificationName,hrmC_QualificationDesc');
    const url = `/api/MasterCourseFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterCourseList[]>('hrms', url);
}
export async function addOrUpdateMasterCourse(data: any) {
    const url = '/api/MasterCourseFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterCourse(id: number) {
    const url = `/api/MasterCourseFacade/toggle/${id}`;
    return await api.put('hrms', url);
}

export async function getMasterCourseDetails(id: number) {
    const url = `/api/MasterCourseFacade/getRecordById/${id}`;
    return await api.get<any>('hrms', url);
}
export async function getCourseSetOrder() {
    const url = '/api/MasterCourseFacade/set_order_list';
    return await api.get<IMasterCourseSetOrderList[]>('hrms', url);
}

export async function updateCourseSetorder(data: any) {
    const url = '/api/MasterCourseFacade/set_order';
    return await api.put<any>('hrms', url, data);
}
