'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

/**
 * Multiple Exam Progress Card Report 2 (Baldwin) - Server Actions
 */

const CONTROLLER = 'JSHSExamReports';

function parseArrayData(raw: any, ...preferredKeys: string[]): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data?.$values && Array.isArray(raw.data.$values)) return raw.data.$values;
    if (raw.$values && Array.isArray(raw.$values)) return raw.$values;

    const source = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? { ...raw, ...raw.data } : raw;
    if (typeof source !== 'object') return [];

    for (const key of preferredKeys) {
        if (Array.isArray(source[key])) return source[key];
        if (source[key]?.$values && Array.isArray(source[key].$values)) return source[key].$values;
    }

    for (const key of Object.keys(source)) {
        const lower = key.toLowerCase();
        if (
            lower.includes('class') ||
            lower.includes('section') ||
            lower.includes('exam') ||
            lower.includes('year') ||
            lower.includes('list')
        ) {
            const val = source[key];
            if (Array.isArray(val) && val.length > 0) return val;
            if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
        }
    }

    for (const key of Object.keys(source)) {
        const val = source[key];
        if (Array.isArray(val) && val.length > 0) return val;
        if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
    }

    return [];
}

// 🔹 Initial Data (Academic Years)
export async function getInitialData() {
    try {
        const url = `/${CONTROLLER}/Getdetails`;
        const res = await api.get<any>('exam', url);
        return res;
    } catch {
        return null;
    }
}

// 🔹 Class Dropdown
export async function getClassesByYear(asmaY_Id: number) {
    try {
        if (!asmaY_Id) return { success: false, data: [] };

        const session = await auth();
        const miId = (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 0;

        const payload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId) } : {}),
            ASMAY_Id: asmaY_Id,
            asmaY_Id: asmaY_Id
        };

        // 1. Try JSHSExamReports/get_classes
        let res: any = await api.post<any>('exam', `/${CONTROLLER}/get_classes`, payload).catch(() => null);
        let list = parseArrayData(res, 'classlist', 'classList', 'getclasses', 'classes');

        // 2. Try JSHSExamReports_/get_classes
        if (list.length === 0) {
            res = await api.post<any>('exam', `/${CONTROLLER}_/get_classes`, payload).catch(() => null);
            list = parseArrayData(res, 'classlist', 'classList', 'getclasses', 'classes');
        }

        // 3. Fallback: Try exam_master_category
        if (list.length === 0) {
            res = await api.get<any>('exam', `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`).catch(() => null);
            list = parseArrayData(res, 'classlist', 'classList', 'getclass', 'classes');
        }

        // 4. Fallback: Try fee class dropdown
        if (list.length === 0) {
            res = await api.post<any>('fees', `/fee_class_category/class_drop_down_list?asmay_id=${asmaY_Id}`, {}).catch(() => null);
            list = parseArrayData(res, 'classlist', 'classList', 'classes');
        }

        const formatted = list
            .map((c: any) => ({
                asmcL_Id: Number(c.asmcL_Id ?? c.ASMCL_Id ?? c.id ?? 0),
                asmcL_ClassName: String(c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.className ?? c.name ?? '')
            }))
            .filter((c: any) => c.asmcL_Id > 0 && c.asmcL_ClassName !== '');

        return { success: true, data: formatted };
    } catch (error: any) {
        console.error('getClassesByYear error:', error);
        return { success: false, data: [] };
    }
}

// 🔹 Section Dropdown
export async function getSectionsByClass(asmaY_Id: number, asmcL_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id) return { success: false, data: [] };

        const session = await auth();
        const miId = (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 0;

        const payload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId) } : {}),
            ASMAY_Id: asmaY_Id,
            asmaY_Id: asmaY_Id,
            ASMCL_Id: asmcL_Id,
            asmcL_Id: asmcL_Id
        };

        // 1. Try JSHSExamReports/get_sections
        let res: any = await api.post<any>('exam', `/${CONTROLLER}/get_sections`, payload).catch(() => null);
        let list = parseArrayData(res, 'sectionlist', 'sectionList', 'getsections', 'sections');

        // 2. Try JSHSExamReports_/get_sections
        if (list.length === 0) {
            res = await api.post<any>('exam', `/${CONTROLLER}_/get_sections`, payload).catch(() => null);
            list = parseArrayData(res, 'sectionlist', 'sectionList', 'getsections', 'sections');
        }

        // 3. Fallback: exam_master_category
        if (list.length === 0) {
            res = await api.get<any>('exam', `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`).catch(() => null);
            list = parseArrayData(res, 'sectionlist', 'sectionList', 'getsection', 'sections');
        }

        // 4. Fallback: swapped parameter order
        if (list.length === 0) {
            res = await api.get<any>('exam', `/exam_master_category/sections_drop_down_by_class_list/${asmaY_Id}/${asmcL_Id}`).catch(() => null);
            list = parseArrayData(res, 'sectionlist', 'sectionList', 'getsection', 'sections');
        }

        const formatted = list
            .map((s: any) => ({
                asmS_Id: Number(s.asmS_Id ?? s.ASMS_Id ?? s.id ?? 0),
                asmC_SectionName: String(s.asmC_SectionName ?? s.ASMC_SectionName ?? s.asmS_SectionName ?? s.ASMS_SectionName ?? s.sectionName ?? s.name ?? '')
            }))
            .filter((s: any) => s.asmS_Id > 0 && s.asmC_SectionName !== '');

        return { success: true, data: formatted };
    } catch (error: any) {
        console.error('getSectionsByClass error:', error);
        return { success: false, data: [] };
    }
}

// 🔹 Exam & Grade Dropdowns
export async function getExamsAndGrades(asmaY_Id: number, asmcL_Id: number, asms_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id || asms_Id === undefined || asms_Id === null) {
            return { success: false, data: [] };
        }

        const session = await auth();
        const miId = (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 0;

        const payload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId) } : {}),
            ASMAY_Id: asmaY_Id,
            asmaY_Id: asmaY_Id,
            ASMCL_Id: asmcL_Id,
            asmcL_Id: asmcL_Id,
            ASMS_Id: asms_Id,
            asmS_Id: asms_Id
        };

        // 1. Try JSHSExamReports/get_Exam_grade
        let res: any = await api.post<any>('exam', `/${CONTROLLER}/get_Exam_grade`, payload).catch(() => null);
        let list = parseArrayData(res, 'examlist', 'examList', 'getexamdetails', 'exams');

        // 2. Try JSHSExamReports_/get_Exam_grade
        if (list.length === 0) {
            res = await api.post<any>('exam', `/${CONTROLLER}_/get_Exam_grade`, payload).catch(() => null);
            list = parseArrayData(res, 'examlist', 'examList', 'getexamdetails', 'exams');
        }

        // 3. Fallback: exam_master/exam_drop_down_by_year_class_section_list
        if (list.length === 0) {
            res = await api.get<any>('exam', `/exam_master/exam_drop_down_by_year_class_section_list/${asmaY_Id}/${asmcL_Id}/${asms_Id}`).catch(() => null);
            list = parseArrayData(res, 'examlist', 'examList', 'exams', 'getexam');
        }

        // 4. Fallback: exam_master/get_exam_list
        if (list.length === 0) {
            res = await api.get<any>('exam', `/exam_master/get_exam_list/${asmaY_Id}`).catch(() => null);
            list = parseArrayData(res, 'examlist', 'examList', 'exams');
        }

        const formatted = list
            .map((e: any) => ({
                emE_Id: Number(e.emE_Id ?? e.EME_Id ?? e.id ?? 0),
                emE_ExamName: String(e.emE_ExamName ?? e.EME_ExamName ?? e.examName ?? e.name ?? '')
            }))
            .filter((e: any) => e.emE_Id > 0 && e.emE_ExamName !== '');

        return { success: true, data: formatted };
    } catch (error: any) {
        console.error('getExamsAndGrades error:', error);
        return { success: false, data: [] };
    }
}

// 🔹 Generate Report
export async function getMultipleExamProgressReport(payload: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    examlist: { EME_Id: number; EME_ExamName: string }[];
}) {
    try {
        const session = await auth();
        const miId = (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 0;

        const fullPayload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId) } : {}),
            ASMAY_Id: payload.ASMAY_Id,
            asmaY_Id: payload.ASMAY_Id,
            ASMCL_Id: payload.ASMCL_Id,
            asmcL_Id: payload.ASMCL_Id,
            ASMS_Id: payload.ASMS_Id,
            asmS_Id: payload.ASMS_Id,
            examlist: payload.examlist || []
        };

        let response: any = null;
        try {
            response = await api.post<any>('exam', `/${CONTROLLER}/BGHS_GetMultiple_Exam_Progress_Report`, fullPayload);
        } catch {
            response = await api.post<any>('exam', `/${CONTROLLER}_/BGHS_GetMultiple_Exam_Progress_Report`, fullPayload).catch(() => null);
        }

        if (response && response.data) {
            const actualData = response.data;
            if (actualData.getstudentmarksdetails && actualData.getstudentmarksdetails.length > 0) {
                return transformReportData(actualData);
            }
            return transformReportData(response.data);
        } else if (response?.getstudentmarksdetails) {
            return transformReportData(response);
        }

        return response;
    } catch (error) {
        console.error('getMultipleExamProgressReport Error:', error);
        throw error;
    }
}

/**
 * Data Transformation logic moved from AngularJS controller to Server Action
 */
function transformReportData(promise: any) {
    const {
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentdetails = [],
        getexamdetails = [],
        getexamsubjectwisemarksdetails = [],
        getexamwisetotaldetails = []
    } = promise;

    // 1. Process Exam Details (Calculate Total and Grade columns)
    let totalMaxMarks = 0;
    for (const exam of getexamdetails) {
        totalMaxMarks += exam.eyceS_MaxMarks || 0;
    }

    const processedExamDetails = [...getexamdetails];
    processedExamDetails.push({ emE_Id: 150001, emE_ExamName: 'Total', eyceS_MaxMarks: totalMaxMarks });
    processedExamDetails.push({ emE_Id: 150002, emE_ExamName: 'Grade', eyceS_MaxMarks: '' });

    // 2. Map subjects and marks to students
    const transformedStudents = getstudentdetails.map((stu: any) => {
        const studentSubjects = getstudentwisesubjectlist.filter((sub: any) => sub.AMST_Id === stu.AMST_Id);

        const applicableCount = studentSubjects.filter((sub: any) => sub.EYCES_AplResultFlg).length;
        const nonApplicableCount = studentSubjects.filter((sub: any) => !sub.EYCES_AplResultFlg).length;

        const studentMarks = getstudentmarksdetails.filter((mark: any) => mark.AMST_Id === stu.AMST_Id);

        return {
            ...stu,
            subjects: studentSubjects,
            marks: studentMarks,
            applicablecount: applicableCount,
            nonapplicablecount: nonApplicableCount
        };
    });

    return {
        ...promise,
        getexamdetails: processedExamDetails,
        getstudentdetails: transformedStudents
    };
}
