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

export async function getExamSubjectWizardDetails(orgId: number, ecycE_Id: number) {
    if (!ecycE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/grade_and_exam_subject_mapping_list/${orgId}/${ecycE_Id}`;
    return await api.get<IExamSubjectWizard>('exam', url);
}

// --------------------------------------------
// Toggle Exam Subject Wizard Active / Inactive
// --------------------------------------------
export async function toggleExamSubjectWizard(ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/toggle_exam_yearly_category/${ecysE_Id}`;
    return await api.put('exam', url);
}

export async function toggleExamSubjectWizardDetails(eycE_Id: number) {
    if (!eycE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/toggle_exam_subject/${eycE_Id}`;
    return await api.put('exam', url);
}

export async function UpdateOrderedSubjectDetails(data: any) {
    const url = '/exam_subject_mapping/set_subject_order_number';
    return await api.put<any>('exam', url, data);
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
// Get Sub Exam List by Subject
// --------------------------------------------
export async function getSubExamList(orgId: number, ismS_Id: number) {
    const url = `master_sub_exam/${orgId}`;
    return await api.get<any>('exam', url);
}

// --------------------------------------------
// Get Sub Subject List by Subject
// --------------------------------------------
export async function getSubSubjectList(orgId: number, ismS_Id: number) {
    const url = `master_sub_subject/${orgId}`;
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
// Get Subjects By Group
// --------------------------------------------
export async function getSubjectsByCategory(mI_Id: number, emCA_Id: number) {
    const url = `exam_subject_mapping/subjects_by_yearly_exam_category_list/${mI_Id}/${emCA_Id}`;
    return await api.get('exam', url);
}
