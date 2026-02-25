'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IConsecutiveConstraintDetails } from '@/types/timetable/constraints/bifurcationconstraints';

export async function getConsecutiveConstraintsDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmAYYear,ttmCCategoryName,ttmDDayName,ttmPPeriodName,staffName,className,sectionName,subjectName,ttfConsecutive_Id,ttfConsecutive_ActiveFlag'
    );
    const url = `/TT_ConsecutiveFacade/ConsecutiveConstraintsGridData?${urlParams}`;
    console.info('BifurcationFacade', url);
    return await api.get<IConsecutiveConstraintDetails[]>('timetable', url);
}

// Save Consecutive Constraints
export async function saveConsecutiveConstraintsDetail(data: any) {
    const url = '/Consecutive/savedetail';
    const response = await api.post<any>('timetable', url, data);
    return response.data;
}

// Get Details for Edit
export async function getConsecutiveConstraintsEditDetails(id: number) {
    const url = `/Consecutive/getdetails/${id}`; // Note: Legacy used Query string? Checking controller `getURI("Consecutive/getdetails", pageid)` - usually becomes path param in new arch if adapted.
    // If standard REST in apiService: api.getURI usually appends ID.
    // Assuming backend accepts /Consecutive/getdetails/123
    const response = await api.get<any>('timetable', url);
    return response.data;
}

// Delete Record
export async function deleteConsecutiveConstraints(id: number) {
    const url = `/Consecutive/deletepages/${id}`;
    const response = await api.delete<any>('timetable', url);
    return response.data;
}

// Deactivate/Activate Record
export async function deactivateConsecutiveConstraints(data: any) {
    const url = '/Consecutive/deactivate';
    const response = await api.post<any>('timetable', url, data);
    return response.data;
}

//api calls

//academic Year
export async function getAcademicYearDropDropDownMasterDayClasswise() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//Category
export async function getCategoryDropDownMasterDayClasswise() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//class
export async function getTransactionClassDropdown() {
    const url = '/TimeTableCommon/GetClassData';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//section
export async function getSectionDetails() {
    const url = '/TimeTableCommon/section-details';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//staff
export async function getStaffDropDownMasterDayClasswise() {
    const url = '/TimeTableCommon/GetStaffDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//subject
export async function getSubjectDropDownMasterDayClasswise() {
    const url = '/TimeTableCommon/subject-details';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}
