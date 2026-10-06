'use server';

import { api } from '@/lib/apiService';


export async function getClgSeatDistributionInitialData() {
    try {
        return await api.get<any>('college', '/ClgSeatDistribution/getalldetails');
    } catch (error) {
        console.error('[Server] getClgSeatDistributionInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getClgSeatDistributionCourses(data: any) {
    try {
        return await api.post<any>('college', `/ClgSeatDistribution/getCoursedata?ASMAY_Id=${data.ASMAY_Id}`);
    } catch (error) {
        console.error('[Server] getClgSeatDistributionCourses error:', error);
        return { success: false, message: 'Failed to fetch courses' } as any;
    }
}

export async function getClgSeatDistributionBranches(data: any) {
    try {
        return await api.post<any>('college', `/ClgSeatDistribution/getBranchdata?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`);
    } catch (error) {
        console.error('[Server] getClgSeatDistributionBranches error:', error);
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getClgSeatDistributionSemesters(data: any) {
    try {
        return await api.post<any>('college', `/ClgSeatDistribution/getSemesterdata?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`);
    } catch (error) {
        console.error('[Server] getClgSeatDistributionSemesters error:', error);
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function getClgSeatDistributionCategories(data: any) {
    try {
        return await api.post<any>('college', `/ClgSeatDistribution/get_Category?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`);
    } catch (error) {
        console.error('[Server] getClgSeatDistributionCategories error:', error);
        return { success: false, message: 'Failed to fetch categories' } as any;
    }
}

export async function saveClgSeatDistributionData(data: any) {
    try {
        return await api.post<any>('college', `/ClgSeatDistribution/savedata`, data);
    } catch (error) {
        console.error('[Server] saveClgSeatDistributionData error:', error);
        return { success: false, message: 'Failed to save data' } as any;
    }
}
