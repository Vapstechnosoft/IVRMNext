'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/Atten_Login_User';

export async function getAttenLoginUserInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error) {
        console.error('[Server] getAttenLoginUserInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getAttenLoginUserCourses(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/get_courses?ASMAY_Id=${data.ASMAY_Id}`);
    } catch (error) {
        console.error('[Server] getAttenLoginUserCourses error:', error);
        return { success: false, message: 'Failed to fetch courses' } as any;
    }
}

export async function getAttenLoginUserBranches(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/get_branches?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`);
    } catch (error) {
        console.error('[Server] getAttenLoginUserBranches error:', error);
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getAttenLoginUserSemesters(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/get_semisters?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`);
    } catch (error) {
        console.error('[Server] getAttenLoginUserSemesters error:', error);
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function saveAttenLoginUserData(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/savedata`, data);
    } catch (error) {
        console.error('[Server] saveAttenLoginUserData error:', error);
        return { success: false, message: 'Failed to save data' } as any;
    }
}

export async function viewAttenLoginUserSubjects(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/view_subjects?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&ACALU_Id=${data.ACALU_Id}`);
    } catch (error) {
        console.error('[Server] viewAttenLoginUserSubjects error:', error);
        return { success: false, message: 'Failed to fetch subjects' } as any;
    }
}

export async function toggleAttenLoginUserStatus(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/Deletedetails?ACALD_Id=${data.ACALD_Id}`);
    } catch (error) {
        console.error('[Server] toggleAttenLoginUserStatus error:', error);
        return { success: false, message: 'Failed to toggle status' } as any;
    }
}
