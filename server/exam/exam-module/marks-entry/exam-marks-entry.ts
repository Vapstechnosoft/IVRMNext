'use server';

import { api } from '@/lib/apiService';
import type { IExamWiseStudentRemarksStudent } from '@/types/exam/exam-module/exam-mapping';
import { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

// -------------------------------
// 1) GET – Student Data Grid
// -------------------------------
export async function GetLoginPrivilegeClassesDropdown(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = `/exam_marks_entry/exam_login_privilege_classes_dropdown/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection>('exam', url);
}

export async function GetLoginPrivilegeSectionsDropdown(asmaY_Id: number, asmcL_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    const url = `/exam_marks_entry/exam_login_privilege_sections_dropdown/${asmaY_Id}/${asmcL_Id}`;
    return await api.get<IAcademicYearandClassandsection>('exam', url);
}

export async function getSubjectsByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    if (!asmS_Id) throw new Error('Section ID is required');
    const url = `/exam_marks_entry/exam_login_privilege_subjects_dropdown/${asmaY_Id}/${asmcL_Id}/${asmS_Id}`;
    return await api.get<IAcademicYearandClassandsection>('exam', url);
}
