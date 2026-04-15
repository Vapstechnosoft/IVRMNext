'use server';

import { api } from '@/lib/apiService';
import type { labConstraints } from '@/types/timetable/constraints/labconstraints';

// Load initial data (Grid and Dropdowns)
export async function getLabConstraintsDetails() {
    const url = '/Lab/LabConstraintsGridData';
    return await api.get<any>('timetable', url);
}

// Get Lab (Subject?) details based on Class/Section
export async function getLabDetails() {
    const url = '/Lab/getLabdetails';
    return await api.post<any>('timetable', url);
}

// Save Lab Constraints
export async function saveLabConstraintsDetail(data: any) {
    const url = '/Lab/savedetail';
    return await api.post<any>('timetable', url, data);
}

// Get Details for Edit
export async function getLabConstraintsEditDetails(id: number) {
    const url = `/Lab/getdetails/${id}`;
    return await api.get<any>('timetable', url);
}

// Delete/Deactivate Record
export async function deleteLabConstraintsDetail(id: number) {
    const url = `/Lab/deletedetails/${id}`;
    return await api.delete<any>('timetable', url);
}

//form pages

//category
export async function getTimeTableCategoryDropDownDetails() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    console.info('LabConstraints', url);
    return await api.get<labConstraints[]>('timetable', url);
}

//academic year
export async function getAcademicYear() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('BifurcationConstratins-AcademicYear', url);
    return await api.get<labConstraints[]>('timetable', url);
}

//class
export async function getClassDetails() {
    const url = '/TimeTableCommon/GetClassData';
    return await api.get<any[]>('timetable', url);
}

//section
export async function getSectionDetails() {
    const url = '/TimeTableCommon/GetSectionData';
    return await api.get<any[]>('timetable', url);
}
