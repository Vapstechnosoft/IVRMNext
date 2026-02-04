'use server';

import { api } from '@/lib/apiService';
import type {
    IAlumnusInitialData,
    IAlumnusSavePayload
} from '@/types/alumni/alumnus-membership';

export async function getInitialData(pageId: number = 2) {
    try {
        const res = await api.get<IAlumnusInitialData>('alumni', `AlumniMembership/get_intial_data/${pageId}`);
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getStudentList(asmaY_Id: number) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/Getstudentlist', { ASMAY_Id: asmaY_Id });
        return { success: true, data: res.data?.fillstudent };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function onCountryChange(ivrmmC_Id: number) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/onchangecountry', { ALMST_PerCountry: ivrmmC_Id });
        return { success: true, data: res.data?.statedropdown };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function onStateChange(ivrmmS_Id: number) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/onchangestate', { ALMST_PerState: ivrmmS_Id });
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getStudentData(data: {
    ALMST_Id: number;
    ASMAY_Id: number;
    AMST_ID: number;
    ALMSTRADM_Id?: number;
    ASMCL_Id_Join?: number;
    ASMCL_Id_Left?: number;
    ASMAY_Id_Join?: number;
    ASMAY_Id_Left?: number;
}) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/getstudata', data);
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveAlumnusData(data: IAlumnusSavePayload) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/savedata', data);
        return { success: true, message: res.data?.returnval };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveNewAlumnus(data: any) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/svedatanewalumni', data);
        return { success: true, message: res.data?.returnval };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deactivateAlumnus(data: {
    ALMST_Id: number;
    ALMST_ActiveFlag: boolean;
    ASMAY_Id_Left?: number;
    ASMCL_Id_Left?: number;
}) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/deactive', data);
        if (res.data?.returnval === 'true') {
            return { success: true, message: 'Status updated successfully' };
        } else {
            return { success: false, message: 'Failed to update status' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function approveAlumnusData(data: {
    APP_FLG: string;
    ALSREG_Id: number;
    ALMST_Id: number;
}) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/aproovedata', data);
        if (res.data?.returnval === 'True') {
            return { success: true, message: 'Alumni member approved successfully' };
        } else {
            return { success: false, message: 'Failed to approve alumni member' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function searchFilter(search: string, asmaY_Id: number) {
    try {
        const res = await api.post<any>('alumni', 'AlumniMembership/searchfilter', {
            searchfilter: search,
            ASMAY_Id: asmaY_Id
        });
        return { success: true, data: res.data?.fillstudent };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function uploadProfilePic(formData: FormData) {
    try {
        // Based on AngularJS code: /api/ImageUpload/Uploadprofilepic
        // We assume 'default' or a specific base URL key for common utilities.
        // Let's try 'default' first as ImageUpload is often a shared service.
        const res = await api.postMultipart<string>('default', 'ImageUpload/Uploadprofilepic', formData);
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

