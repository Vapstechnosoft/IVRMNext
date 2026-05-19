'use server';

import { api } from '@/lib/apiService';
import type {
    AcademicYear,
    Category,
    Class,
    ClassDropdownDatamanualPeriodInsertion,
    Section,
    Staff,
    Subject
} from '@/types/timetable/Transaction/manualperiodinsertion';

export async function getAcademicYearData() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TimeTableCommon', url);
    return await api.get<AcademicYear[]>('timetable', url);
}

export async function getCategoryDetails() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    console.info('TimeTableCommon', url);
    return await api.get<Category[]>('timetable', url);
}

export async function getClassData() {
    const url = '/TimeTableCommon/GetClassData';
    console.info('TimeTableCommon', url);
    return await api.get<Class[]>('timetable', url);
}

export async function getStaffDetails() {
    const url = '/TimeTableCommon/GetStaffDetails';
    console.info('TimeTableCommon', url);
    return await api.get<Staff[]>('timetable', url);
}

export async function getSubjectDetails() {
    const url = '/TimeTableCommon/subject-details';
    console.info('TimeTableCommon', url);
    return await api.get<Subject[]>('timetable', url);
}

export async function getManualPeriodInsertionMasters() {
    const [years, categories, classes, staff, subjects] = await Promise.all([
        getAcademicYearData(),
        getCategoryDetails(),
        getClassData(),
        getStaffDetails(),
        getSubjectDetails()
    ]);

    return {
        years: years.data || [],
        categories: categories.data || [],
        classes: classes.data || [],
        staff: staff.data || [],
        subjects: subjects.data || []
    };
}

export async function getSectionsByClass(asmcL_Id: number) {
    const url = `/TimeTableCommon/GetSectionData/${asmcL_Id}`;
    console.info('TimeTableCommon', url);
    return await api.get<Section[]>('timetable', url);
}

export async function getClassDetailsByacademicyrandcategoty(asmay_id: number, TTMC_Id: number) {
    const url = `/MasterDayFacade/ClassDataByAcademicyrandCategory/${asmay_id}/${TTMC_Id}`;
    console.info('MasterDayFacade', url);
    return await api.get<ClassDropdownDatamanualPeriodInsertion[]>('timetable', url);
}

export async function getManualPeriodInsertionReportData(payload: any) {
    const url = '/ManualperiodinsertionFacade/ManualPeriodInsertionReportdata';
    console.info('ManualperiodinsertionFacade', url);
    const normalizedPayload = {
        ...payload,
        asmaY_Id: payload.asmaY_Id ? Number(payload.asmaY_Id) : 0,
        ttmC_Id: payload.ttmC_Id ? Number(payload.ttmC_Id) : 0,
        asmcL_Id: payload.asmcL_Id ? Number(payload.asmcL_Id) : 0,
        asms_Id: payload.asms_Id ? Number(payload.asms_Id) : 0,
    };
    return await api.post<any>('timetable', url, normalizedPayload);
}

export async function saveManualPeriodInsertion(payload: any) {
    const url = '/ManualperiodinsertionFacade/savemanualPeriodinsertion';
    console.info('ManualperiodinsertionFacade', url);
    return await api.post<any>('timetable', url, payload);
}
