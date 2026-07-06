'use server'

import { api } from '@/lib/apiService';

export async function getReadmitStudentDetails(pageId: number) {
    return await api.get<any>('admission', `/readmitstudent/getalldetails/${pageId}`);
}

export async function getStudentListByYearAndClass(data: any) {
    return await api.post<any>('admission', `/readmitstudent/GetStudentListByYearAndCLass`, data);
}

export async function getNewJoinList(data: any) {
    return await api.post<any>('admission', `/readmitstudent/getnewjoinlist`, data);
}

export async function saveReadmitStudent(data: any) {
    return await api.post<any>('admission', `/readmitstudent/`, data);
}
