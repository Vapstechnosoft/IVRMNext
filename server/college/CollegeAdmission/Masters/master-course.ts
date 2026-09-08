'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/MasterCourse';

export async function getMasterCourseInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error) {
        console.error('[Server] getMasterCourseInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveMasterCourse(data: any) {
    return await api.post<any>('college', `${BASE_URL}/Savedetails`, data);
}

export async function editMasterCourse(data: any) {
    return await api.post<any>('college', `${BASE_URL}/EditData`, data);
}

export async function deactivateMasterCourse(data: any) {
    return await api.post<any>('college', `${BASE_URL}/Deletedetails`, data);
}

export async function saveMasterCourseOrder(data: any) {
    return await api.post<any>('college', `${BASE_URL}/getOrder`, data);
}
