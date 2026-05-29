'use server';

import { api } from '@/lib/apiService';

/**
 * MultipleExamCumulativeReport Controller (SRKVS)
 * Ported from: MultipleExamCumulativeReport.js
 */

export async function getMultipleExamCumulativeOnLoad() {
    try {
        const url = '/JSHSExamReports/Getdetails/2';
        return await api.get<any>('exam', url);
    } catch (error) {
        console.error('getMultipleExamCumulativeOnLoad error:', error);
        return { success: false, data: null };
    }
}

export async function getMultipleExamCumulativeClasses(asmaY_Id: number) {
    try {
        const url = '/JSHSExamReports/get_classes';
        return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id });
    } catch (error) {
        console.error('getMultipleExamCumulativeClasses error:', error);
        return { success: false, data: null };
    }
}

export async function getMultipleExamCumulativeSections(asmaY_Id: number, asmcL_Id: number) {
    try {
        const url = '/JSHSExamReports/get_sections';
        return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id });
    } catch (error) {
        console.error('getMultipleExamCumulativeSections error:', error);
        return { success: false, data: null };
    }
}

export async function getMultipleExamCumulativeExamsAndGrades(payload: any) {
    try {
        const url = '/JSHSExamReports/get_Exam_grade';
        return await api.post<any>('exam', url, payload);
    } catch (error) {
        console.error('getMultipleExamCumulativeExamsAndGrades error:', error);
        return { success: false, data: null };
    }
}

export async function getMultipleExamCumulativeReport(payload: any) {
    try {
        const url = '/JSHSExamReports/getmultiple_exam_cumulative_report';
        return await api.post<any>('exam', url, payload);
    } catch (error) {
        console.error('getMultipleExamCumulativeReport error:', error);
        return { success: false, data: null };
    }
}
