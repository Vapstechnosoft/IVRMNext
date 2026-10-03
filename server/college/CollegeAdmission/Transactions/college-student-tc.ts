'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CollegeStudenttctransaction';

export async function getCollegeStudentTcInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/loaddata`);
    } catch (error) {
        console.error('[Server] getCollegeStudentTcInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getCollegeStudentTcCourses(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeStudentTcCourses error:', error);
        return { success: false, message: 'Failed to fetch courses' } as any;
    }
}

export async function getCollegeStudentTcBranches(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onchangecourse?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeStudentTcBranches error:', error);
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getCollegeStudentTcSemesters(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onchangebranch?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeStudentTcSemesters error:', error);
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function getCollegeStudentTcSections(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onchangesemester?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}`);
    } catch (error) {
        console.error('[Server] getCollegeStudentTcSections error:', error);
        return { success: false, message: 'Failed to fetch sections' } as any;
    }
}

export async function onCollegeStudentTcSectionChange(data: any) {
    try {
        // Kept as post since we don't have query params for this one in the prompt
        return await api.post<any>('college', `${BASE_URL}/onchangesection`, data);
    } catch (error) {
        console.error('[Server] onCollegeStudentTcSectionChange error:', error);
        return { success: false, message: 'Failed to update section' } as any;
    }
}

export async function getCollegeStudentTcStudents(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&searchfilter=${data.searchfilter}&allorindividual=${data.allorindividual}&AMCST_SOL=${data.AMCST_SOL}&adm_num_flag=${data.adm_num_flag}`);
    } catch (error) {
        console.error('[Server] getCollegeStudentTcStudents error:', error);
        return { success: false, message: 'Failed to fetch students' } as any;
    }
}

export async function getCollegeStudentTcStudentDetails(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onchangestudent?ASMAY_Id=${data.ASMAY_Id}&AMCST_Id=${data.AMCST_Id}&AMCST_SOL=${data.AMCST_SOL}`);
    } catch (error) {
        console.error('[Server] getCollegeStudentTcStudentDetails error:', error);
        return { success: false, message: 'Failed to fetch student details' } as any;
    }
}

export async function checkCollegeStudentTcDuplicate(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/chk_dup_tc?ACSTC_TCNO=${data.ACSTC_TCNO}`);
    } catch (error) {
        console.error('[Server] checkCollegeStudentTcDuplicate error:', error);
        return { success: false, message: 'Failed to check duplicate TC' } as any;
    }
}

export async function saveCollegeStudentTcData(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/savetc`, data);
    } catch (error) {
        console.error('[Server] saveCollegeStudentTcData error:', error);
        return { success: false, message: 'Failed to save TC data' } as any;
    }
}
