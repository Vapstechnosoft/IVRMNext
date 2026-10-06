'use server';

import { api } from '@/lib/apiService';

export async function getInitialData() {
    try {
        const response = await api.get<any>('college', `/Atten_Batch_Mapping/getalldetails`);
        return response;
    } catch (error) {
        console.error('[Server] getInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveData1(data: any) {
    try {
        return await api.post<any>('college', `/Atten_Batch_Mapping/savedata1`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save batch data' } as any;
    }
}

export async function getCourses(asmaY_Id: number) {
    try {
        return await api.post<any>('college', `/Atten_Batch_Mapping/get_courses?ASMAY_Id=${asmaY_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch courses' } as any;
    }
}

export async function getBranches(asmaY_Id: number, amcO_Id: number) {
    try {
        return await api.post<any>('college', `/Atten_Batch_Mapping/get_branches?ASMAY_Id=${asmaY_Id}&AMCO_Id=${amcO_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getSemesters(asmaY_Id: number, amcO_Id: number, amB_Id: number) {
    try {
        return await api.post<any>('college', `/Atten_Batch_Mapping/get_semisters?ASMAY_Id=${asmaY_Id}&AMCO_Id=${amcO_Id}&AMB_Id=${amB_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function getStudents(data: any) {
    try {
        const { ACAB_Id, ASMAY_Id, AMCO_Id, AMB_Id, AMSE_Id, ACMS_Id, ISMS_Id } = data;
        return await api.post<any>('college', `/Atten_Batch_Mapping/get_students?ACAB_Id=${ACAB_Id}&ASMAY_Id=${ASMAY_Id}&AMCO_Id=${AMCO_Id}&AMB_Id=${AMB_Id}&AMSE_Id=${AMSE_Id}&ACMS_Id=${ACMS_Id}&ISMS_Id=${ISMS_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch students' } as any;
    }
}

export async function saveData2(data: any) {
    try {
        return await api.post<any>('college', `/Atten_Batch_Mapping/savedata2`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save mapping data' } as any;
    }
}

export async function viewSubjects(data: any) {
    try {
        return await api.post<any>('college', `/Atten_Batch_Mapping/view_subjects`, data);
    } catch (error) {
        return { success: false, message: 'Failed to view subjects' } as any;
    }
}

export async function deleteDetails(data: any) {
    try {
        return await api.post<any>('college', `/Atten_Batch_Mapping/Deletedetails`, data);
    } catch (error) {
        return { success: false, message: 'Failed to delete/deactivate data' } as any;
    }
}
