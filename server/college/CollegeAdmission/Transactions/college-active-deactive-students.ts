'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CollegeActiveDeactiveStudents';

export async function getCollegeActiveDeactiveInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getdata`);
    } catch (error) {
        console.error('[Server] getCollegeActiveDeactiveInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getCollegeActiveDeactiveCourses(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onacademicyearchange?ASMAY_Id=${data.ASMAY_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeActiveDeactiveCourses error:', error);
        return { success: false, message: 'Failed to fetch courses' } as any;
    }
}

export async function getCollegeActiveDeactiveBranches(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/oncoursechange?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeActiveDeactiveBranches error:', error);
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getCollegeActiveDeactiveSemesters(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onbranchchange?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeActiveDeactiveSemesters error:', error);
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function getCollegeActiveDeactiveSections(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onchangesemester`, data);
    } catch (error) {
        console.error('[Server] getCollegeActiveDeactiveSections error:', error);
        return { success: false, message: 'Failed to fetch sections' } as any;
    }
}

export async function searchCollegeActiveDeactiveStudents(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/search?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&AMCST_SOL=${data.AMCST_SOL}`);
    } catch (error) {
        console.error('[Server] searchCollegeActiveDeactiveStudents error:', error);
        return { success: false, message: 'Failed to search students' } as any;
    }
}

export async function saveCollegeActiveDeactiveStudents(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/savedata`, data);
    } catch (error) {
        console.error('[Server] saveCollegeActiveDeactiveStudents error:', error);
        return { success: false, message: 'Failed to save data' } as any;
    }
}

export async function getCollegeActiveDeactiveReport(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/getreport?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeActiveDeactiveReport error:', error);
        return { success: false, message: 'Failed to fetch report' } as any;
    }
}
