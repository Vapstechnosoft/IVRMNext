'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

// 🔹 Cumulative Report Submit

export async function getCumulativeReport(data: any, apiSearchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(apiSearchParams ?? {});
    const url = `/cumulative_report?${urlParams}`;
    const response = await api.post<any>('exam', url, data);
    return response;
}

// 🔹 Class Dropdown
export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
    try {
        if (!asmaY_Id) return { success: false, message: 'Academic Year ID is required', data: [] };
        const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
        const res = await api.get<IAcademicYearandClassandsection[]>('exam', url);
        return { success: res?.success ?? true, data: res?.data ?? [] };
    } catch (error: any) {
        console.error('Error in getClassDropDownByAcademicYearlist:', error);
        return { success: false, message: error?.message || 'Failed to fetch classes', data: [] };
    }
}

// 🔹 Section Dropdown
export async function getSectionsDropDownByAcademicYearandClasslist(asmaY_Id: number, asmcL_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id) return { success: false, message: 'Academic Year and Class ID are required', data: [] };
        const url = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
        const res = await api.get<IAcademicYearandClassandsection[]>('exam', url);
        return { success: res?.success ?? true, data: res?.data ?? [] };
    } catch (error: any) {
        console.error('Error in getSectionsDropDownByAcademicYearandClasslist:', error);
        return { success: false, message: error?.message || 'Failed to fetch sections', data: [] };
    }
}

// 🔹 Exam Dropdown
export async function getExamsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id || asmS_Id === undefined || asmS_Id === null) {
            return { success: false, message: 'Academic Year, Class, and Section ID are required', data: [] };
        }
        const url = `/exam_master/exam_drop_down_by_year_class_section_list/${asmaY_Id}/${asmcL_Id}/${asmS_Id}`;
        const res = await api.get<IAcademicYearandClassandsection[]>('exam', url);
        return { success: res?.success ?? true, data: res?.data ?? [] };
    } catch (error: any) {
        console.error('Error in getExamsDropDownByAcademicYearandClassandSectionlist:', error);
        return { success: false, message: error?.message || 'Failed to fetch exams', data: [] };
    }
}

// 🔹 Student Dropdown
export async function getStudentsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id || asmS_Id === undefined || asmS_Id === null) {
            return { success: false, message: 'Academic Year, Class, and Section ID are required', data: [] };
        }
        const url = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
        console.info('url', url);
        const res = await api.get<IAcademicYearandClassandsection[]>('exam', url);
        return { success: res?.success ?? true, data: res?.data ?? [] };
    } catch (error: any) {
        console.error('Error in getStudentsDropDownByAcademicYearandClassandSectionlist:', error);
        return { success: false, message: error?.message || 'Failed to fetch students', data: [] };
    }
}

export async function getExamReportCard(data: any) {
    const url = '/individual_exam_report_card/exam_report_card';
    return await api.post<any>('exam', url, data);
}

export async function getExamsStjames(data: any) {
    const url = `/JSHSExamReportsFacade/get_exam_groups`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesExamReport(data: any) {
    const url = `/JSHSExamReportsFacade/st_james_exam_report`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesNurseryReport(data: any) {
    const url = `/JSHSExamReportsFacade/get_stjames_nur_report`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesTransitionReport(data: any) {
    const url = `/JSHSExamReportsFacade/st_james_nur_report`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesConsolidatedPointsReport(data: any) {
    const url = `/JSHSExamReportsFacade/stjames_exam_consolidated_report`;
    return await api.post<any>('exam', url, data);
}
