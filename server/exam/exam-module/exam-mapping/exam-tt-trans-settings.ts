'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';

// -------------------------------------------------------
// Get grid list
// -------------------------------------------------------
export async function getExamTTTransSettingsList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `ExamTTTransSettings/getdetails?${urlParams}`;
    return await api.get<IExamTTTransSettings[]>('exam', url);
}

// -------------------------------------------------------
// Get initial bind data (academic years, classes, sections, subject_groups, exams, time_slots, grid list)
// -------------------------------------------------------
export async function getExamTTTransSettingsInitialData() {
    const url = 'ExamTTTransSettings/getdetails';
    return await api.get<any>('exam', url);
}

// -------------------------------------------------------
// Cascade: Get classes by academic year
// -------------------------------------------------------
export async function getClassesByAcademicYear(ASMAY_Id: number) {
    const url = 'ExamTTTransSettings/onselectAcdYear';
    return await api.post<any>('exam', url, { ASMAY_Id });
}

// -------------------------------------------------------
// Cascade: Get sections by class + academic year
// -------------------------------------------------------
export async function getSectionsByClass(ASMCL_Id: number, ASMAY_Id: number) {
    const url = 'ExamTTTransSettings/onselectclass';
    return await api.post<any>('exam', url, { ASMCL_Id, ASMAY_Id });
}

// -------------------------------------------------------
// Cascade: Get subject groups + exams by section + class + year
// -------------------------------------------------------
export async function getSubjectGroupsAndExamsBySection(ASMS_Id: number, ASMCL_Id: number, ASMAY_Id: number) {
    const url = 'ExamTTTransSettings/onselectSection';
    return await api.post<any>('exam', url, { ASMS_Id, ASMCL_Id, ASMAY_Id });
}

// -------------------------------------------------------
// Get subject list for grid + time slots on subject group select
// -------------------------------------------------------
export async function getSubjectListAndTimeSlots(params: {
    ASMS_Id: number;
    ASMCL_Id: number;
    ASMAY_Id: number;
    EMG_Id: number;
    EME_Id: number;
}) {
    const url = 'ExamTTTransSettings/onselectSubject';
    return await api.post<any>('exam', url, params);
}

// -------------------------------------------------------
// Save exam timetable trans settings
// -------------------------------------------------------
export async function saveExamTTTransSettings(data: {
    ASMS_Id: number;
    ASMCL_Id: number;
    ASMAY_Id: number;
    EME_Id: number;
    EMG_Id: number;
    EXTT_FromDate: string;
    EXTT_EndDate: string;
    TempararyArrayList: Array<{
        ismS_Id: number;
        check_save: number;
        exttS_Date: string;
        ettS_Id: number;
        ismS_SubjectName: string;
    }>;
    EXTT_Id: number;
}) {
    const url = 'ExamTTTransSettings/savedetail';
    return await api.post<any>('exam', url, data);
}

// -------------------------------------------------------
// Get view records popup by extT_Id
// -------------------------------------------------------
export async function getExamTTTransViewRecords(extT_Id: number) {
    const url = `ExamTTTransSettings/getalldetailsviewrecords/${extT_Id}`;
    return await api.get<any>('exam', url);
}

// -------------------------------------------------------
// Toggle active/deactive
// -------------------------------------------------------
export async function toggleExamTTTransRecord(data: any) {
    const url = 'ExamTTTransSettings/deactivate';
    return await api.post<any>('exam', url, data);
}

// -------------------------------------------------------
// Get edit details by extT_Id
// -------------------------------------------------------
export async function getExamTTTransEditDetails(extT_Id: number) {
    const url = `ExamTTTransSettings/editgetdetails/${extT_Id}`;
    return await api.get<any>('exam', url);
}
