'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type {
    FixingDayPeriodSchema,
    FixingDayStaffSchema,
    FixingDaySubjectSchema,
    FixingPeriodStaffSchema,
    FixingPeriodSubjectSchema
} from '@/schemas/timetable/constraints/fixing';
import type { ApiSearchparams } from '@/types';
import type { ITTFixingLoadData } from '@/types/timetable/constraints';
import {
    TTDayPeriodGridData,
    TTDayStaffGridData,
    TTDaySubjectGridData,
    TTPeriodStaffGridData,
    TTPeriodSubjectGridData
} from '@/types/timetable/constraints/fixing';

// Load Initial Data
// export async function getFixingLoadData() {
//     const url = '';
//     return await api.get<any>('timetable', url);
// }

export async function getFixingLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmC_CategoryName');
    const url = `/TTMasterCategoryFacade/GetMasterCategoryGridList?${urlParams}`;
    return await api.get<ITTFixingLoadData[]>('timetable', url);
}

// -------------------------------------------------------------------------
// Tab 1: Day Period
// -------------------------------------------------------------------------

export async function saveFixingDayPeriod(data: FixingDayPeriodSchema) {
    const url = '/FixingFacade/DayPeriodGridData';
    return await api.post<any>('timetable', url, data);
}

export async function getFixingDayPeriodDetails(id: number) {
    const url = `/FixingFacade/DayPeriodGridData/${id}`;
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingDayPeriod(TTFDP_Id: number) {
    const url = '/FixingFacade/DayPeriodActiveDeactive';
    return await api.post<any>('timetable', url);
}

// export async function ToggleMasterDay(ttmd_id: number) {
//     const url = `/MasterDayFacade/MasterDaydayActivateDeactivate/${ttmd_id}`;
//     return await api.put<any>('timetable', url);
// }

// -------------------------------------------------------------------------
// Tab 2: Day Staff
// -------------------------------------------------------------------------

export async function saveFixingDayStaff(data: FixingDayStaffSchema) {
    const url = '/FixingFacade/DayStaffGridData';
    return await api.post<any>('timetable', url, data);
}

export async function getFixingDayStaffDetails(id: number) {
    const url = `/FixingFacade/DayStaffGridData/${id}`;
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingDayStaff(TTFDS_Id: number) {
    const url = '/FixingFacade/DayStaffActiveDeactive';
    return await api.post<any>('timetable', url);
}

// -------------------------------------------------------------------------
// Tab 3: Day Subject
// -------------------------------------------------------------------------

export async function saveFixingDaySubject(data: FixingDaySubjectSchema) {
    const url = '/FixingFacade/DaySubjectGridData';
    return await api.post<any>('timetable', url, data);
}

export async function getFixingDaySubjectDetails(id: number) {
    const url = `/FixingFacade/DaySubjectGridData/${id}`;
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingDaySubject(data: { TTFDSU_Id: number; TTFDSU_ActiveFlag: boolean }) {
    const url = '/FixingFacade/DaySubjectActiveDeactive';
    return await api.post<any>('timetable', url, data);
}

// -------------------------------------------------------------------------
// Tab 4: Period Staff
// -------------------------------------------------------------------------

export async function saveFixingPeriodStaff(data: FixingPeriodStaffSchema) {
    const url = '/FixingFacade/PeriodStaffGridData';
    return await api.post<any>('timetable', url, data);
}

export async function getFixingPeriodStaffDetails(id: number) {
    const url = `/FixingFacade/PeriodStaffGridData/${id}`;
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingPeriodStaff(TTFPS_Id: number) {
    const url = '/FixingFacade/PeriodStaffActiveDeactive';
    return await api.post<any>('timetable', url);
}

// -------------------------------------------------------------------------
// Tab 5: Period Subject
// -------------------------------------------------------------------------

export async function saveFixingPeriodSubject(data: FixingPeriodSubjectSchema) {
    const url = '/FixingFacade/PeriodSubjectGridData';
    return await api.post<any>('timetable', url, data);
}

export async function getFixingPeriodSubjectDetails(id: number) {
    const url = `/FixingFacade/PeriodSubjectGridData/${id}`;
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingPeriodSubject(TTFPSU_Id: number) {
    const url = '/FixingFacade/PeriodSubjectActiveDeactive';
    return await api.post<any>('timetable', url);
}

// -------------------------------------------------------------------------
// Dropdown Helpers (Reused from Fixing Controller in backend)
// -------------------------------------------------------------------------

export async function getClassByCategory(data: { ASMAY_Id: number; TTMC_Id: number }) {
    const url = '/Fixing/getclass_catg';
    return await api.post<any>('timetable', url, data);
}

export async function getStaffByClassSection(data: { ASMAY_Id: number; TTMC_Id?: number; ASMCL_Id?: number; ASMS_Id?: number }) {
    const url = '/Fixing/getstaff_section';
    return await api.post<any>('timetable', url, data);
}

export async function getSubjectByStaff(data: { ASMAY_Id: number; ASMCL_Id?: number; ASMS_Id?: number; HRME_Id?: number }) {
    const url = '/Fixing/getsubject_staff';
    return await api.post<any>('timetable', url, data);
}

// Check backend for this one, usually implied by standard 'getalldetails' often returning periods/days/categories
// But for dependent logic:
// getperiod_class
// getsection_class
// If these exist, we implement them.
// Legacy: `get_period_section1` -> gets period and section?
// Actually usually `getclass_catg` might return sections too?
// Let's implement generic fetches if needed.

export async function getPeriodByClass(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = '/Fixing/getperiod_class'; // Guessing the endpoint name based on convention
    return await api.post<any>('timetable', url, data);
}

export async function getSectionByClass(data: { ASMAY_Id: number; ASMCL_Id: number; TTMC_Id: number }) {
    const url = '/Fixing/getsection_class';
    return await api.post<any>('timetable', url, data);
}

export async function getFixingDayPeriodGridData(searchParams?: any) {
    const url = '/FixingFacade/DayPeriodGridData';
    return await api.get<TTDayPeriodGridData[]>('timetable', url);
}


export async function getFixingDaySubjectGridData() {
    const url = '/FixingFacade/DaySubjectGridData';
    return await api.get<TTDaySubjectGridData[]>('timetable', url);
}

export async function getFixingDayStaffGridData() {
    const url = '/FixingFacade/DayStaffGridData';
    return await api.get<TTDayStaffGridData[]>('timetable', url);
}

export async function getFixingPeriodSubjectGridData() {
    const url = '/FixingFacade/PeriodSubjectGridData';
    return await api.get<TTPeriodSubjectGridData[]>('timetable', url);
}

export async function getFixingPeriodStaffGridData() {
    const url = '/FixingFacade/PeriodStaffGridData';
    return await api.get<TTPeriodStaffGridData[]>('timetable', url);
}


