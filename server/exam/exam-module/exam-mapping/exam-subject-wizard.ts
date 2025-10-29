'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';

// --------------------------------------------
// Get All Exam Subject Wizard Records
// --------------------------------------------
export async function getExamSubjectWizard(searchParams?: ApiSearchparams) {
    try {
        const urlParams = getSearchParamsUrl(searchParams ?? {});
        const url = `exam_subject_wizard/30?${urlParams}`;
        const response = await api.get<IExamSubjectWizard>('exam', url);
        return { ...response };
    } catch (error) {
        console.error('Error fetching Exam Subject Wizard data:', error);

        const hardcodedData: IExamSubjectWizard[] = [
            {
                ecysE_Id: 1,
                amcO_Id: 101,
                amb_Id: 201,
                amsE_Id: 301,
                acss_Id: 401,
                acst_Id: 501,
                emg_Id: 601,
                eme_Id: 701,
                emgr_Id: 801,
                amcO_CourseName: 'B.Tech',
                amb_BranchName: 'Computer Science',
                amse_SemesterName: 'Semester 1',
                acss_SchemeName: 'Regular',
                acst_SchemeType: 'CBCS',
                emg_GroupName: 'Core Subjects',
                eme_ExamName: 'Mid Term 1',
                emgr_GradeName: 'A+',
                ecysE_AttendanceFromDate: '2025-07-01T00:00:00',
                ecysE_AttendanceToDate: '2025-07-10T00:00:00',
                ecysE_SubExamFlg: true,
                ecysE_SubSubjectFlg: false,
                ecysE_ActiveFlg: true,
                createdBy: 'Admin',
                createdDate: '2025-07-01T12:00:00',
                modifiedBy: 'Admin',
                modifiedDate: '2025-07-05T15:00:00',
                slno: 1,
                selected: false,
                subExamList: [
                    {
                        emsE_Id: 1,
                        emsE_SubExamName: 'Internal Test',
                        ecysE_SubExamFlg: true,
                        ecysE_MaxMarks: '50.00',
                        ecysE_MinMarks: '20.00',
                        emgr_Id: 801,
                        emgr_GradeName: 'A',
                        exemptedFlg: false,
                        exemptedPer: '0.00'
                    }
                ],
                subSubjectList: [
                    {
                        emsS_Id: 1,
                        emsS_SubSubjectName: 'Theory',
                        ecysE_SubSubjectFlg: false,
                        ecysE_MaxMarks: '70.00',
                        ecysE_MinMarks: '25.00',
                        emgr_Id: 801,
                        emgr_GradeName: 'A',
                        exemptedFlg: false,
                        exemptedPer: '0.00'
                    }
                ]
            }
        ];

        return {
            status: 200,
            data: hardcodedData,
            message: 'Returning hardcoded data (API not reachable)'
        };
    }
}

// --------------------------------------------
// Get Exam Subject Wizard Details By ID
// --------------------------------------------
export async function getExamSubjectWizardDetails(orgId: number, ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `/exam_subject_wizard/details_view_by_id/${orgId}/${ecysE_Id}`;
    return await api.get<IExamSubjectWizard>('exam', url);
}

// --------------------------------------------
// Add or Update Exam Subject Wizard Record
// --------------------------------------------
export async function addOrUpdateExamSubjectWizard(data: any) {
    const url = '/exam_subject_wizard';
    return await api.post<any>('exam', url, data);
}

// --------------------------------------------
// Delete Exam Subject Wizard Record
// --------------------------------------------
export async function deleteExamSubjectWizard(orgId: number, ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `/exam_subject_wizard/delete/${orgId}/${ecysE_Id}`;
    return await api.delete('exam', url);
}

// --------------------------------------------
// Toggle Exam Subject Wizard Active / Inactive
// --------------------------------------------
export async function toggleExamSubjectWizard(orgId: number, ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `/exam_subject_wizard/toggle/${orgId}/${ecysE_Id}`;
    return await api.put('exam', url);
}

// --------------------------------------------
// Get Sub Exam List by Subject
// --------------------------------------------
export async function getSubExamList(orgId: number, ismS_Id: number) {
    try {
        const url = `/exam_subject_wizard/sub_exam_list/${orgId}/${ismS_Id}`;
        return await api.get<any>('exam', url);
    } catch {
        return [
            { emsE_Id: 1, emsE_SubExamName: 'Internal Test', ecysE_MaxMarks: '50', ecysE_MinMarks: '25', emgr_Id: 1, emgr_GradeName: 'A' },
            { emsE_Id: 2, emsE_SubExamName: 'Viva', ecysE_MaxMarks: '20', ecysE_MinMarks: '10', emgr_Id: 1, emgr_GradeName: 'B+' }
        ];
    }
}

// --------------------------------------------
// Get Sub Subject List by Subject
// --------------------------------------------
export async function getSubSubjectList(orgId: number, ismS_Id: number) {
    try {
        const url = `/exam_subject_wizard/sub_subject_list/${orgId}/${ismS_Id}`;
        return await api.get<any>('exam', url);
    } catch {
        return [
            { emsS_Id: 1, emsS_SubSubjectName: 'Theory', ecysE_MaxMarks: '70', ecysE_MinMarks: '35', emgr_Id: 1, emgr_GradeName: 'A' },
            { emsS_Id: 2, emsS_SubSubjectName: 'Practical', ecysE_MaxMarks: '30', ecysE_MinMarks: '15', emgr_Id: 1, emgr_GradeName: 'B' }
        ];
    }
}

// --------------------------------------------
// Save Sub Exam Mapping for a Subject
// --------------------------------------------
export async function saveSubExamMapping(data: any) {
    const url = '/exam_subject_wizard/save_sub_exam_mapping';
    return await api.post<any>('exam', url, data);
}

// --------------------------------------------
// Save Sub Subject Mapping for a Subject
// --------------------------------------------
export async function saveSubSubjectMapping(data: any) {
    const url = '/exam_subject_wizard/save_sub_subject_mapping';
    return await api.post<any>('exam', url, data);
}

// --------------------------------------------
// Get Academic Years (Hardcoded)
// --------------------------------------------
export async function getAcademicYears() {
    try {
        const url = '/exam_subject_wizard/academic_years';
        return await api.get('exam', url);
    } catch {
        return [
            { id: '2025-2026', label: '2025-2026' },
            { id: '2024-2025', label: '2024-2025' }
        ];
    }
}

// --------------------------------------------
// Get Categories By Academic Year (Hardcoded)
// --------------------------------------------
export async function getCategoriesByAcademicYear(academicYearId: string) {
    try {
        const url = `/exam_subject_wizard/categories/${academicYearId}`;
        return await api.get('exam', url);
    } catch {
        return [
            { id: 'G1', label: 'GROUP - VI' },
            { id: 'G2', label: 'GROUP - I' }
        ];
    }
}

// --------------------------------------------
// Get Exams By Category (Hardcoded)
// --------------------------------------------
export async function getExamsByCategory(categoryId: string) {
    try {
        const url = `/exam_subject_wizard/exams/${categoryId}`;
        return await api.get('exam', url);
    } catch {
        return [
            { emE_Id: 'E1', emE_ExamName: 'FA-1' },
            { emE_Id: 'E2', emE_ExamName: 'Second Unit Test' },
            { emE_Id: 'E3', emE_ExamName: 'I Term Exam' }
        ];
    }
}

// --------------------------------------------
// Get Subjects By Group (Hardcoded)
// --------------------------------------------
export async function getSubjectsByGroup(groupId: string) {
    try {
        const url = `/exam_subject_wizard/subjects/${groupId}`;
        return await api.get('exam', url);
    } catch {
        return [
            {
                ismS_Id: 1,
                ismS_SubjectName: 'Kannada',
                ismS_SubjectCode: 'KAN',
                ECYSES_MaxMarks: '100',
                ECYSES_MinMarks: '35',
                ECYSES_MarksEntryMax: '22',
                EMGR_Id: '1',
                EMGR_GradeName: 'Grade - 100M'
            },
            {
                ismS_Id: 2,
                ismS_SubjectName: 'French',
                ismS_SubjectCode: 'FRN',
                ECYSES_MaxMarks: '100',
                ECYSES_MinMarks: '35',
                ECYSES_MarksEntryMax: '22',
                EMGR_Id: '1',
                EMGR_GradeName: 'Grade - 100M'
            }
        ];
    }
}
