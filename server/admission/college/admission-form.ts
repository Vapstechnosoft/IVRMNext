'use server';

import { api } from '@/lib/apiService';
import type { ICollegeAdmissionInitialData } from '@/types/admission/college/admission-form';

const BASE_URL = '/ClgStudentAdmissionFacade';

export async function getInitialData() {
    try {
        return await api.get<ICollegeAdmissionInitialData>('admission', `${BASE_URL}/Getdetails`);
    } catch (error) {
        console.error('[Server] getInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function onYearChange(asmaY_Id: number) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/onYearCahnge`, { ASMAY_Id: asmaY_Id });
    } catch (error) {
        return { success: false, message: 'Failed to update year' } as any;
    }
}

export async function onCourseChange(amcO_Id: number) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/onCourseChange`, { AMCO_Id: amcO_Id });
    } catch (error) {
        return { success: false, message: 'Failed to update course' } as any;
    }
}

export async function onBranchChange(amB_Id: number) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/onBranchchange`, { AMB_Id: amB_Id });
    } catch (error) {
        return { success: false, message: 'Failed to update branch' } as any;
    }
}

export async function getCasteByCategory(imcC_Id: number) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/getcaste`, { IMCC_Id: imcC_Id });
    } catch (error) {
        return { success: false, message: 'Failed to fetch castes' } as any;
    }
}

export async function saveFirstTab(data: any) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/savefirsttab`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save student details' } as any;
    }
}

export async function saveSecondTab(data: any) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/savesecondtab`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save address details' } as any;
    }
}

export async function saveThirdTab(data: any) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/savethirdtab`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save parents details' } as any;
    }
}

export async function onSelectGetStateApi(ivrmmC_Id: number) {
    try {
        return await api.get<any>('admission', `${BASE_URL}/onSelectGetState?IVRMMC_Id=${ivrmmC_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch states' } as any;
    }
}

export async function saveFourthTab(data: any) {
    try {
        return await api.post<any>('admission', `${BASE_URL}/savefourthtab`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save others details' } as any;
    }
}
