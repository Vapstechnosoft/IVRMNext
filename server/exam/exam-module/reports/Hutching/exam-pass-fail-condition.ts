'use server';

import { api } from '@/lib/apiService';

async function getWithFallback(urlPrimary: string, urlFallback: string) {
    try {
        const response = await api.get<any>('exam', urlPrimary);
        if (response) return response;
    } catch (e) {
        console.warn(`[getWithFallback] ${urlPrimary} failed, trying ${urlFallback}...`);
    }
    return await api.get<any>('exam', urlFallback);
}

async function postWithFallback(urlPrimary: string, urlFallback: string, data: any) {
    try {
        const response = await api.post<any>('exam', urlPrimary, data);
        if (response) return response;
    } catch (e) {
        console.warn(`[postWithFallback] ${urlPrimary} failed, trying ${urlFallback}...`);
    }
    return await api.post<any>('exam', urlFallback, data);
}

/**
 * Get initial details for Exam Pass/Fail Condition page (year list, grid list, exam condition list)
 */
export async function getPassFailConditionDetails() {
    try {
        const response = await getWithFallback(
            '/ExamPassFailCondition/Getdetails',
            '/HutchingReports/Getdetails'
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in getPassFailConditionDetails:', error);
        return { success: false, message: error?.message || 'Failed to fetch details', data: null };
    }
}

/**
 * Get Category list by Academic Year ID
 */
export async function getCategoryByYear(asmaY_Id: number) {
    try {
        if (!asmaY_Id) return { success: false, message: 'Academic Year ID is required', data: [] };
        const response = await postWithFallback(
            '/ExamPassFailCondition/get_category',
            '/HutchingReports/get_category',
            { ASMAY_Id: asmaY_Id }
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in getCategoryByYear:', error);
        return { success: false, message: error?.message || 'Failed to fetch categories', data: [] };
    }
}

/**
 * Get Subjects/Exams list by Academic Year & Category
 */
export async function getSubjectsByCategory(asmaY_Id: number, emcA_Id: number) {
    try {
        if (!asmaY_Id || !emcA_Id) return { success: false, message: 'Academic Year and Category are required', data: [] };
        const response = await postWithFallback(
            '/ExamPassFailCondition/get_subjects',
            '/HutchingReports/get_subjects',
            { ASMAY_Id: asmaY_Id, EMCA_Id: emcA_Id }
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in getSubjectsByCategory:', error);
        return { success: false, message: error?.message || 'Failed to fetch subjects/exams', data: [] };
    }
}

/**
 * Get Exam condition list by Academic Year & Exam ID
 */
export async function getExamConditionByExam(asmaY_Id: number, emE_Id: number) {
    try {
        if (!asmaY_Id || !emE_Id) return { success: false, message: 'Academic Year and Exam are required', data: [] };
        const response = await postWithFallback(
            '/ExamPassFailCondition/get_examcondition',
            '/HutchingReports/get_examcondition',
            { ASMAY_Id: asmaY_Id, EME_Id: emE_Id }
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in getExamConditionByExam:', error);
        return { success: false, message: error?.message || 'Failed to fetch exam conditions', data: [] };
    }
}

/**
 * Get Condition Type details by Academic Year & Exam Condition ID
 */
export async function getConditionTypeByCondition(asmaY_Id: number, ecM_Id: number) {
    try {
        if (!asmaY_Id || !ecM_Id) return { success: false, message: 'Academic Year and Exam Condition are required', data: [] };
        const response = await postWithFallback(
            '/HutchingReports/get_condition',
            '/ExamPassFailCondition/get_condition',
            { ASMAY_Id: asmaY_Id, ECM_Id: ecM_Id }
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in getConditionTypeByCondition:', error);
        return { success: false, message: error?.message || 'Failed to fetch condition details', data: [] };
    }
}

/**
 * Save or Update Pass/Fail Condition Record
 */
export async function savePassFailCondition(data: {
    ASMAY_Id: number;
    EME_Id?: number | null;
    EPFRC_From: number;
    EPFRC_PassFailFlag: string;
    EPFRC_ExamFlag: string;
    EPFRC_Percentage?: number | string;
    ECM_Id: number;
    EMCA_Id: number;
    EPFRC_Condition?: number;
    EPFRC_To: number;
    EPFRC_RankFlag: string | boolean;
    EPFRC_Id?: number;
    EPFRC_OverallPercentage: number | string;
}) {
    try {
        const response = await postWithFallback(
            '/ExamPassFailCondition/savedata',
            '/HutchingReports/savedata',
            data
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in savePassFailCondition:', error);
        return { success: false, message: error?.message || 'Failed to save record' };
    }
}

/**
 * Edit details for specific record
 */
export async function editPassFailConditionDetails(epfrC_Id: number) {
    try {
        if (!epfrC_Id) return { success: false, message: 'Record ID is required', data: null };
        const response = await getWithFallback(
            `/ExamPassFailCondition/editdetails/${epfrC_Id}`,
            `/HutchingReports/editdetails/${epfrC_Id}`
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in editPassFailConditionDetails:', error);
        return { success: false, message: error?.message || 'Failed to fetch edit record', data: null };
    }
}

/**
 * Toggle Active / Deactive status of a record
 */
export async function toggleActivePassFailCondition(record: any) {
    try {
        const response = await postWithFallback(
            '/ExamPassFailCondition/deactive',
            '/HutchingReports/deactive',
            record
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in toggleActivePassFailCondition:', error);
        return { success: false, message: error?.message || 'Failed to change record status' };
    }
}
