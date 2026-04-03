'use server';

import { api } from '@/lib/apiService';


export async function getNdaStudentProfileDetails() {
    const url = '/StudentDashboardFacade/Getdetails';
    try {
        return await api.get<any>('portal', url);
    } catch (error) {
        console.error('[Server] getNdaStudentProfileDetails error:', error);
        throw error;
    }
}

export async function getNdaSiblingDetails(amsIdSibbling: number) {
    const url = '/StudentDashboardFacade/Getdetails12';
    const data = {
        AMST_Idsibbling: amsIdSibbling,
    };
    try {
        return await api.post<any>('portal', url, data);
    } catch (error) {
        console.error('[Server] getNdaSiblingDetails error:', error);
        throw error;
    }
}

export async function saveNdaProfileUpdateRequest(data: any) {
    const url = '/StudentDashboardFacade/NDAsaverequest';
    try {
        return await api.post<any>('portal', url, data);
    } catch (error) {
        console.error('[Server] saveNdaProfileUpdateRequest error:', error);
        throw error;
    }
}

export async function uploadNdaProfilePic(formData: FormData) {
    const url = '/ImageUploadFacade/Uploadprofilepic';
    try {
        return await api.postMultipart<string>('portal', url, formData);
    } catch (error) {
        console.error('[Server] uploadNdaProfilePic error:', error);
        throw error;
    }
}
