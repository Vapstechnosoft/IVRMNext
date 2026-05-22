'use server';

import { api } from '@/lib/apiService';
import type {
    AcademicYear,
    Class,
    Section,
    Subject
} from '@/types/timetable/Transaction/staffperiodtransfer';
import { revalidatePath } from 'next/cache';

export async function getAcademicYearData() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TimeTableCommon', url);
    return await api.get<AcademicYear[]>('timetable', url);
}

export async function getClassData() {
    const url = '/TimeTableCommon/GetClassData';
    console.info('TimeTableCommon', url);
    return await api.get<Class[]>('timetable', url);
}

export async function getFromStaffDetails() {
    const url = '/StaffPeriodTransformFacade/GetFromStaffDetails';
    console.info('StaffPeriodTransformFacade', url);
    return await api.get<any[]>('timetable', url);
}

export async function getSubjectDetails() {
    const url = '/TimeTableCommon/subject-details';
    console.info('TimeTableCommon', url);
    return await api.get<Subject[]>('timetable', url);
}

export async function getStaffPeriodTransferMasters() {
    const [years, classes, staff, subjects] = await Promise.all([
        getAcademicYearData(),
        getClassData(),
        getFromStaffDetails(),
        getSubjectDetails()
    ]);

    const staffData = staff.data || [];
    const mappedStaff = staffData.map((s: any) => ({
        hrmE_Id: s.hrmE_Id || s.HRME_Id,
        staffNamelst: s.staffNamelst || (s.firstName ? `${s.firstName} ${s.middleName || ''} ${s.lastName || ''}`.trim() : '') || ''
    })).filter((s: any) => s.staffNamelst !== '');

    return {
        years: years.data || [],
        sections: [],
        classes: classes.data || [],
        staff: mappedStaff,
        subjects: subjects.data || []
    };
}

export async function saveStaffPeriodTransfer(payload: any) {
    const url = '/StaffPeriodTransferFacade/SaveTransfer';
    console.info('StaffPeriodTransferFacade', url);
    const response = await api.post<any>('timetable', url, payload);
    revalidatePath('/timetable/transactions/staffperiodtransfer');
    return response;
}

export async function getStaffPeriodDetails(payload: any) {
    const { asmaY_Id, hrmE_Id, asmcL_Id, asms_Id, ismS_Id } = payload;
    const url = `/StaffPeriodTransferFacade/GetPeriodDetails/${asmaY_Id}/${hrmE_Id}/${asmcL_Id}/${asms_Id}/${ismS_Id || 0}`;
    console.info('StaffPeriodTransferFacade', url);
    return await api.get<any>('timetable', url);
}

export async function getSectionsByClass(asmcL_Id: number) {
    const url = '/TimeTableCommon/section-details';
    console.info('TimeTableCommon', url);
    return await api.get<any>('timetable', url);
}

export async function deleteStaffPeriodTransfer(payload: any) {
    const url = '/StaffPeriodTransferFacade/DeleteTransfer';
    console.info('StaffPeriodTransferFacade', url);
    const response = await api.post<any>('timetable', url, payload);
    revalidatePath('/timetable/transactions/staffperiodtransfer');
    return response;
}
