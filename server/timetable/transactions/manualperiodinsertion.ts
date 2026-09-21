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
        years: years.data ?? [],
        categories: categories.data ?? [],
        classes: classes.data ?? [],
        staff: staff.data ?? [],
        subjects: subjects.data ?? []
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

import { auth } from '@/lib/auth';

export async function getManualPeriodInsertionReportData(payload: any) {
    const session = await auth();
    const url = '/ManualperiodinsertionFacade/ManualPeriodInsertionReportdata';
    const data = {
        ...payload,
        MI_Id: payload.MI_Id || (session?.mi_id ? Number(session.mi_id) : 79),
        UserId: payload.UserId || (session?.user_id ? Number(session.user_id) : 0),
        ASMAY_Id: payload.ASMAY_Id ? Number(payload.ASMAY_Id) : Number(payload.asmaY_Id || 0),
        TTMC_Id: payload.TTMC_Id ? Number(payload.TTMC_Id) : Number(payload.ttmC_Id || 0),
        ASMCL_Id: payload.ASMCL_Id ? Number(payload.ASMCL_Id) : Number(payload.asmcL_Id || 0),
        ASMS_Id: payload.ASMS_Id ? Number(payload.ASMS_Id) : Number(payload.asms_Id || 0)
    };
    console.info('ManualperiodinsertionFacade', url, data);
    const res = await api.post<any>('timetable', url, data);
    console.log('MANUAL PERIOD REPORT DATA RESPONSE:', JSON.stringify(res, null, 2));
    return res;
}

export async function saveManualPeriodInsertion(payload: any) {
    const session = await auth();
    const url = '/ManualperiodinsertionFacade/savemanualPeriodinsertion';
    const data = {
        ...payload,
        MI_Id: payload.MI_Id || (session?.mi_id ? Number(session.mi_id) : 79),
        UserId: payload.UserId || (session?.user_id ? Number(session.user_id) : 0),
        ASMAY_Id: payload.ASMAY_Id ? Number(payload.ASMAY_Id) : Number(payload.asmaY_Id || 0),
        TTMC_Id: payload.TTMC_Id ? Number(payload.TTMC_Id) : Number(payload.ttmC_Id || 0),
        ASMCL_Id: payload.ASMCL_Id ? Number(payload.ASMCL_Id) : Number(payload.asmcL_Id || 0),
        ASMS_Id: payload.ASMS_Id ? Number(payload.ASMS_Id) : Number(payload.asms_Id || 0),
        HRME_Id: payload.HRME_Id ? Number(payload.HRME_Id) : Number(payload.hrmE_Id || 0),
        ISMS_Id: payload.ISMS_Id ? Number(payload.ISMS_Id) : Number(payload.ismS_Id || 0)
    };
    console.info('ManualperiodinsertionFacade', url, data);
    return await api.post<any>('timetable', url, data);
}
