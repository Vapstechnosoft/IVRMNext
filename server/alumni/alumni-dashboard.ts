'use server';

import { api } from '@/lib/apiService';
import type {
    IDashboardData,
    IGallery,
    INotice,
    IYearwiseCount,
    IClasswiseStudent,
    IAlumniBirthday,
    IAlumniGalleryDetail
} from '@/types/alumni/alumni-dashboard';

export async function getDashboardData(roleId = 30) {
    try {
        const res = await api.get<IDashboardData>('alumni', `/SchoolALUDASH/getloaddata?roleId=${roleId}`);
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getGalleryData() {
    try {
        const res = await api.post<IGallery[]>('alumni', '/SchoolALUDASH/getgallery', {});
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getCoverModelDetails(alga_Id: number) {
    try {
        const url = `/Alumni_Gallery/get_covermodel?ALGA_Id=${alga_Id}`;
        const res = await api.get<IAlumniGalleryDetail[]>('alumni', url);
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}

export async function viewGalleryItem(algA_Id: number) {
    return await getCoverModelDetails(algA_Id);
}

export async function getNoticeData() {
    try {
        const res = await api.post<INotice[]>('alumni', '/SchoolALUDASH/alumninotice', {});
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}

export async function viewNoticeItem(alntB_Id: number) {
    try {
        const res = await api.get<any>('alumni', `/SchoolALUDASH/viewnotice?ALNTB_Id=${alntB_Id}`);
        return { success: true, data: res.data?.attachementlist };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getYearwiseList(asmaY_Id: number) {
    try {
        const res = await api.get<IYearwiseCount[]>('alumni', `/SchoolALUDASH/yearwiselist?ASMAY_Id=${asmaY_Id}`);
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getClasswiseStudent(asmaY_Id: number, asmcL_Id: number) {
    try {
        const res = await api.get<IClasswiseStudent[]>('alumni', `/SchoolALUDASH/classwisestudent?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}`);
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getBirthdayData() {
    try {
        const res = await api.post<IAlumniBirthday[]>('alumni', '/SchoolALUDASH/AluminiBirthday', {});
        return { success: true, data: res.data };
    } catch (error: any) {
        return { success: false, message: error?.message || String(error) };
    }
}
