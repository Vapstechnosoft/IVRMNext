'use server';

import { api } from '@/lib/apiService';

export async function getInitialData() {
    try {
        const response = await api.get<any>('college', `/Atten_Subject_MaxPeriod/getalldetails`);
        return response;
    } catch (error) {
        console.error('[Server] getInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getCourses(asmaY_Id: number) {
    try {
        const data = { ASMAY_Id: asmaY_Id };
        return await api.post<any>('college', `/Atten_Subject_MaxPeriod/get_courses`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch courses' } as any;
    }
}

export async function getBranches(asmaY_Id: number, amcO_Id: number) {
    try {
        const data = { ASMAY_Id: asmaY_Id, AMCO_Id: amcO_Id };
        return await api.post<any>('college', `/Atten_Subject_MaxPeriod/get_branches`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getSemesters(asmaY_Id: number, amcO_Id: number, amB_Id: number) {
    try {
        const data = { ASMAY_Id: asmaY_Id, AMCO_Id: amcO_Id, AMB_Id: amB_Id };
        return await api.post<any>('college', `/Atten_Subject_MaxPeriod/get_semisters`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function getSubjects(asmaY_Id: number, amcO_Id: number, amB_Id: number, amsE_Id: number, acmS_Id: number) {
    try {
        const data = { ASMAY_Id: asmaY_Id, AMCO_Id: amcO_Id, AMB_Id: amB_Id, AMSE_Id: amsE_Id, ACMS_Id: acmS_Id };
        return await api.post<any>('college', `/Atten_Subject_MaxPeriod/get_subjects`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch subjects' } as any;
    }
}

export async function saveData(data: any) {
    try {
        return await api.post<any>('college', `/Atten_Subject_MaxPeriod/savedata`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save data' } as any;
    }
}
