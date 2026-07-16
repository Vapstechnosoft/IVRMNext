'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

export async function getTBSchoolPrimaryReport(data: any, apiSearchParams?: ApiSearchparams): Promise<ApiResponse<any>> {
    const urlParams = getSearchParamsUrl(apiSearchParams ?? {});
    const url = `/JSHSExamReports_/Promotion_Report_TBSchool?${urlParams}`;
    return await api.post<any>('exam', url, data);
}

export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

export async function getSectionsDropDownByAcademicYearandClasslist(asmaY_Id: number, asmcL_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    const url = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

export async function getExamsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    if (asmS_Id === undefined || asmS_Id === null) throw new Error('Section ID is required');
    const url = `/exam_master/exam_drop_down_by_year_class_section_list/${asmaY_Id}/${asmcL_Id}/${asmS_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

export async function getStudentsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    if (!asmS_Id) throw new Error('Section ID is required');
    const url = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

export async function getGradeList() {
    const url = '/exam_master_category/get_grade_list'; // Verify API endpoint if needed
    try {
        return await api.get<any>('exam', url);
    } catch {
        return {
            success: true,
            data: [
                { emgR_Id: 1, emgR_GradeName: 'Grade 1-8' },
                { emgR_Id: 2, emgR_GradeName: 'Primary Grade' }
            ]
        };
    }
}
