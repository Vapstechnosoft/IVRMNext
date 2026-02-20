'use server';

import { api } from '@/lib/apiService';

// --- Shared Dropdowns ---
// Reusing getCategory, getClassDetails, etc. might be possible, but endpoints might be different.
// Checking legacy code: `Restriction/savedetail1`, `Restriction/savedetail2`, etc.
// `Restriction/getpagedetails1`, `Restriction/getpagedetails2`, etc.

export async function getSubjectRestrictionDetails() {
    const url = '/Restriction/Getdetails'; // Assuming generic load
    return await api.get<any>('timetable', url);
}

export async function saveDayPeriodDetail(data: any) {
    const url = '/Restriction/savedetail1';
    return await api.post<any>('timetable', url, data);
}

export async function getDayPeriodEditDetails(id: number) {
    const url = `/Restriction/getpagedetails1/${id}`;
    return await api.get<any>('timetable', url);
}

export async function deactivateDayPeriod(data: any) {
    const url = '/Restriction/deactivate1';
    return await api.post<any>('timetable', url, data);
}

// --- Tab 1: Day Period ---

//academic Year
export async function getAcademicYearSubject() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}
//Category
export async function getCategorySubject() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

export async function ToggleSubjectDayPeriod(ttrdP_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionDayPeriodActivateDeactivate/${ttrdP_Id}`;
    return await api.put<any>('timetable', url);
}


// --- Tab 2: Day Staff ---
//for daystaff and period staff and period subject
export async function getAcademicYearDayStaff() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}
//staff and for period staff also
export async function getStaffDropDownDayStaff() {
    const url = '/TimeTableCommon/GetStaffDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}
//button
export async function saveDayStaffDetail(data: any) {
    const url = '/Restriction/savedetail2';
    return await api.post<any>('timetable', url, data);
}

export async function getDayStaffEditDetails(id: number) {
    const url = `/Restriction/getpagedetails2/${id}`;
    return await api.get<any>('timetable', url);
}

export async function ToggleSubjectDayStaff(ttrdsU_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionDayStaffActivateDeactivate/${ttrdsU_Id}`;
    return await api.put<any>('timetable', url);
}
// --- Tab 3: Day Subject ---
//subject and period subject
export async function getSubjectDaySubject() {
    const url = '/TimeTableCommon/subject-details';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//Button
export async function saveDaySubjectDetail(data: any) {
    const url = '/Restriction/savedetail3';
    return await api.post<any>('timetable', url, data);
}

export async function getDaySubjectEditDetails(id: number) {
    const url = `/Restriction/getpagedetails3/${id}`;
    return await api.get<any>('timetable', url);
}

export async function ToggleSubjectDaySubject(ttrdsU_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionDaySubjectActivateDeactivate/${ttrdsU_Id}`;
    return await api.put<any>('timetable', url);
}
// --- Tab 4: Period Staff ---
export async function savePeriodStaffDetail(data: any) {
    const url = '/Restriction/savedetail4';
    return await api.post<any>('timetable', url, data);
}
export async function getPeriodStaffEditDetails(id: number) {
    const url = `/Restriction/getpagedetails4/${id}`;
    return await api.get<any>('timetable', url);
}

export async function ToggleSubjectPeriodStaff(ttrpS_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionPeriodStaffActivateDeactivate/${ttrpS_Id}`;
    return await api.put<any>('timetable', url);
}

// --- Tab 5: Period Subject ---
export async function savePeriodSubjectDetail(data: any) {
    const url = '/Restriction/savedetail5';
    return await api.post<any>('timetable', url, data);
}
export async function getPeriodSubjectEditDetails(id: number) {
    const url = `/Restriction/getpagedetails5/${id}`;
    return await api.get<any>('timetable', url);
}

export async function ToggleSubjectPeriodSubject(ttrpsU_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionPeriodSubjectActivateDeactivate/${ttrpsU_Id}`;
    return await api.put<any>('timetable', url);
}

// --- Helper Dropdown Fetchers ---
// Assuming standard ones exist or using specific controller endpoints
export async function getCategoryDetails(data: { ASMAY_Id: number }) {
    const url = '/Restriction/get_category'; // Guessing
    // Legacy: get_category1() -> calls 'Restriction/get_category' (implied)
    return await api.post<any>('timetable', '/Restriction/get_category', data);
}

// ... other helpers as needed ...

export async function getSubjectRestrictionDayPeriodGridData(searchParams: { ASMAY_Id: number; TTMC_Id: number }) {
    const url = '/RestrictionFacade/SubjectRestrictionDayPeriodGridData';
    const response = await api.get<any>('timetable', url, { params: searchParams });
    console.info('SubjectRestrictionDayPeriodGridData Response:', JSON.stringify(response).substring(0, 300));
    return response;
}

export async function getSubjectRestrictionDaySubjectGridData(searchParams: { ASMAY_Id: number; TTMC_Id: number }) {
    const url = '/RestrictionFacade/SubjectRestrictionDaySubjectGridData';
    const response = await api.get<any>('timetable', url, { params: searchParams });
    console.info('SubjectRestrictionDaySubjectGridData Response:', JSON.stringify(response).substring(0, 300));
    return response;
}

export async function getSubjectRestrictionDayStaffGridData(searchParams: { ASMAY_Id: number; TTMC_Id: number }) {
    const url = '/RestrictionFacade/SubjectRestrictionDayStaffGridData';
    const response = await api.get<any>('timetable', url, { params: searchParams });
    console.info('SubjectRestrictionDayStaffGridData Response:', JSON.stringify(response).substring(0, 300));
    return response;
}

export async function getSubjectRestrictionPeriodStaffGridData(searchParams: { ASMAY_Id: number; TTMC_Id: number }) {
    const url = '/RestrictionFacade/SubjectRestrictionPeriodStaffGridData';
    const response = await api.get<any>('timetable', url, { params: searchParams });
    console.info('SubjectRestrictionPeriodStaffGridData Response:', JSON.stringify(response).substring(0, 300));
    return response;
}

export async function getSubjectRestrictionPeriodSubjectGridData(searchParams: { ASMAY_Id: number; TTMC_Id: number }) {
    const url = '/RestrictionFacade/SubjectRestrictionPeriodSubjectGridData';
    const response = await api.get<any>('timetable', url, { params: searchParams });
    console.info('SubjectRestrictionPeriodSubjectGridData Response:', JSON.stringify(response).substring(0, 300));
    return response;
}
