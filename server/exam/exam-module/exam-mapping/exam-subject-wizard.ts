'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';

// --------------------------------------------
// Get All Exam Subject Wizard Records
// --------------------------------------------
export async function getExamSubjectWizard(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_subject_mapping/30?${urlParams}`;
    return await api.get<IExamSubjectWizard>('exam', url);
}

// --------------------------------------------
// Get Exam Subject Wizard Details By ID
// --------------------------------------------
export async function getExamSubjectWizardDetails(orgId: number, ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_wizard/details_view_by_id/${orgId}/${ecysE_Id}`;
    return await api.get<IExamSubjectWizard>('exam', url);
}

// --------------------------------------------
// Add or Update Exam Subject Wizard Record
// --------------------------------------------
export async function addOrUpdateExamSubjectWizard(data: any) {
    const url = 'exam_subject_wizard';
    return await api.post<any>('exam', url, data);
}

// --------------------------------------------
// Delete Exam Subject Wizard Record
// --------------------------------------------
export async function deleteExamSubjectWizard(orgId: number, ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_wizard/delete/${orgId}/${ecysE_Id}`;
    return await api.delete('exam', url);
}

// --------------------------------------------
// Toggle Exam Subject Wizard Active / Inactive
// --------------------------------------------
export async function toggleExamSubjectWizard(orgId: number, ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_wizard/toggle/${orgId}/${ecysE_Id}`;
    return await api.put('exam', url);
}

// --------------------------------------------
// Get Sub Exam List by Subject
// --------------------------------------------
export async function getSubExamList(orgId: number, ismS_Id: number) {
    const url = `exam_subject_wizard/sub_exam_list/${orgId}/${ismS_Id}`;
    return await api.get<any>('exam', url);
}

// --------------------------------------------
// Get Sub Subject List by Subject
// --------------------------------------------
export async function getSubSubjectList(orgId: number, ismS_Id: number) {
    const url = `exam_subject_wizard/sub_subject_list/${orgId}/${ismS_Id}`;
    return await api.get<any>('exam', url);
}

// --------------------------------------------
// Save Sub Exam Mapping for a Subject
// --------------------------------------------
export async function saveSubExamMapping(data: any) {
    const url = 'exam_subject_wizard/save_sub_exam_mapping';
    return await api.post<any>('exam', url, data);
}

// --------------------------------------------
// Save Sub Subject Mapping for a Subject
// --------------------------------------------
export async function saveSubSubjectMapping(data: any) {
    const url = 'exam_subject_wizard/save_sub_subject_mapping';
    return await api.post<any>('exam', url, data);
}

// --------------------------------------------
// Get Categories By Academic Year
// --------------------------------------------
export async function getCategoriesByAcademicYear(academicYearId: string) {
    const url = `exam_subject_wizard/categories/${academicYearId}`;
    return await api.get('exam', url);
}

// --------------------------------------------
// Get Exams By Category
// --------------------------------------------
export async function getExamsByCategory(categoryId: string) {
    const url = `exam_subject_wizard/exams/${categoryId}`;
    return await api.get('exam', url);
}

// --------------------------------------------
// Get Subjects By Group
// --------------------------------------------
export async function getSubjectsByGroup(groupId: string) {
    const url = `exam_subject_wizard/subjects/${groupId}`;
    return await api.get('exam', url);
}
