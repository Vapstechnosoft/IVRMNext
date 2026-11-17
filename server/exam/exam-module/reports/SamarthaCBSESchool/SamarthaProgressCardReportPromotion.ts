'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

function extractDataArray(res: any, candidateKeys: string[]): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    if (res.data?.$values && Array.isArray(res.data.$values) && res.data.$values.length > 0) return res.data.$values;
    if (res.$values && Array.isArray(res.$values) && res.$values.length > 0) return res.$values;

    const source = (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) ? { ...res, ...res.data } : res;
    if (typeof source !== 'object') return [];

    for (const key of candidateKeys) {
        const val = source[key];
        if (Array.isArray(val) && val.length > 0) return val;
        if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
    }

    const lowerKeyMap: Record<string, string> = {};
    Object.keys(source).forEach(k => { lowerKeyMap[k.toLowerCase()] = k; });
    for (const key of candidateKeys) {
        const actualKey = lowerKeyMap[key.toLowerCase()];
        if (actualKey) {
            const val = source[actualKey];
            if (Array.isArray(val) && val.length > 0) return val;
            if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
        }
    }

    return [];
}

function extractClassesList(res: any): any[] {
    return extractDataArray(res, ['classlist', 'classList', 'getclasslist', 'getclasses', 'fillclass', 'classes']);
}

function extractSectionsList(res: any): any[] {
    return extractDataArray(res, ['sectionlist', 'sectionList', 'getsectionlist', 'getsections', 'fillsection', 'sections']);
}

function extractStudentsList(res: any): any[] {
    return extractDataArray(res, [
        'studentlist',
        'studentList',
        'getstudentdetails',
        'getStudentDetails',
        'studentdetails',
        'studentDetails',
        'fillstudent',
        'fillStudent',
        'students',
        'student_list'
    ]);
}

export async function getSamarthaClasses(asmay_id: number) {
    try {
        const session = await auth();
        const miId = (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 0;
        const payload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId) } : {}),
            ASMAY_Id: Number(asmay_id),
            asmaY_Id: Number(asmay_id)
        };

        const res1 = await api.post<any>('exam', '/JSHSExamReports_/get_classes', payload).catch(() => null);
        const list1 = extractClassesList(res1);
        if (list1.length > 0) return { success: true, data: list1 };

        const res2 = await api.post<any>('exam', '/JSHSExamReports/get_classes', payload).catch(() => null);
        const list2 = extractClassesList(res2);
        if (list2.length > 0) return { success: true, data: list2 };

        const resGet = await api
            .get<any>('exam', `/exam_master_category/class_drop_down_by_academic_year_list/${asmay_id}`)
            .catch(() => null);
        const listGet = extractClassesList(resGet);
        if (listGet.length > 0) return { success: true, data: listGet };

        return { success: true, data: listGet.length > 0 ? listGet : (resGet?.data || resGet || []) };
    } catch (e) {
        console.error('getSamarthaClasses error:', e);
        return { success: false, data: [] };
    }
}

export async function getSamarthaSections(asmay_id: number, asmcl_id: number) {
    try {
        const session = await auth();
        const miId = (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 0;
        const payload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId) } : {}),
            ASMAY_Id: Number(asmay_id),
            asmaY_Id: Number(asmay_id),
            ASMCL_Id: Number(asmcl_id),
            asmcL_Id: Number(asmcl_id)
        };

        const res1 = await api.post<any>('exam', '/JSHSExamReports_/get_sections', payload).catch(() => null);
        const list1 = extractSectionsList(res1);
        if (list1.length > 0) return { success: true, data: list1 };

        const res2 = await api.post<any>('exam', '/JSHSExamReports/get_sections', payload).catch(() => null);
        const list2 = extractSectionsList(res2);
        if (list2.length > 0) return { success: true, data: list2 };

        const resGet = await api
            .get<any>('exam', `/exam_master_category/sections_drop_down_by_class_list/${asmcl_id}/${asmay_id}`)
            .catch(() => null);
        const listGet = extractSectionsList(resGet);
        if (listGet.length > 0) return { success: true, data: listGet };

        return { success: true, data: listGet.length > 0 ? listGet : (resGet?.data || resGet || []) };
    } catch (e) {
        console.error('getSamarthaSections error:', e);
        return { success: false, data: [] };
    }
}

export async function getSamarthaStudents(asmay_id: number, asmcl_id: number, asms_id: number) {
    try {
        const session = await auth();
        const miId = (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 0;
        const payload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId) } : {}),
            ASMAY_Id: Number(asmay_id),
            asmaY_Id: Number(asmay_id),
            ASMCL_Id: Number(asmcl_id),
            asmcL_Id: Number(asmcl_id),
            ASMS_Id: Number(asms_id),
            asmS_Id: Number(asms_id)
        };

        // 1. Try POST /JSHSExamReports_/GetStudentDetails
        const res1 = await api.post<any>('exam', '/JSHSExamReports_/GetStudentDetails', payload).catch(() => null);
        const list1 = extractStudentsList(res1);
        if (list1.length > 0) return { success: true, data: list1 };

        // 2. Try POST /JSHSExamReports/GetStudentDetails
        const res2 = await api.post<any>('exam', '/JSHSExamReports/GetStudentDetails', payload).catch(() => null);
        const list2 = extractStudentsList(res2);
        if (list2.length > 0) return { success: true, data: list2 };

        // 3. Try POST /JSHSExamReports/get_Exam_grade
        const resGrade = await api.post<any>('exam', '/JSHSExamReports/get_Exam_grade', payload).catch(() => null);
        const listGrade = extractStudentsList(resGrade);
        if (listGrade.length > 0) return { success: true, data: listGrade };

        // 4. Try GET /exam_master_category/students_drop_down_by_year_class_section_list
        const resGet1 = await api
            .get<any>(
                'exam',
                `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmay_id}&ASMCL_Id=${asmcl_id}&ASMS_Id=${asms_id}${miId > 0 ? `&MI_Id=${miId}` : ''}`
            )
            .catch(() => null);
        const listGet1 = extractStudentsList(resGet1);
        if (listGet1.length > 0) return { success: true, data: listGet1 };

        // 5. Try GET /exam_master_category/student_drop_down_by_academic_year_list
        const resGet2 = await api
            .get<any>(
                'exam',
                `/exam_master_category/student_drop_down_by_academic_year_list/${asmay_id}/${asmcl_id}/${asms_id}`
            )
            .catch(() => null);
        const listGet2 = extractStudentsList(resGet2);
        if (listGet2.length > 0) return { success: true, data: listGet2 };

        return { success: true, data: [] };
    } catch (error) {
        console.error('getSamarthaStudents error:', error);
        return { success: false, data: [] };
    }
}

export async function getSamarthaProgressCardReportPromotion(data: any) {
    try {
        const session = await auth();
        const miId =
            data.mI_Id ||
            data.MI_Id ||
            (session as any)?.mi_id ||
            session?.user?.mi_id ||
            (session as any)?.user?.mI_Id ||
            0;

        const studentArr = (data.studentList || data.temp_Amstids || data.Temp_AmstIds || []).map((s: any) => ({
            AMST_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s),
            amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s)
        }));

        const asmayId = Number(data.asmaY_Id ?? data.ASMAY_Id ?? 0);
        const asmcLId = Number(data.asmcL_Id ?? data.ASMCL_Id ?? 0);
        const asmsId = Number(data.asmS_Id ?? data.ASMS_Id ?? 0);

        const payload = {
            ...(miId > 0 ? { MI_Id: Number(miId), mI_Id: Number(miId), mi_id: Number(miId) } : {}),
            ASMAY_Id: asmayId,
            asmaY_Id: asmayId,
            ASMCL_Id: asmcLId,
            asmcL_Id: asmcLId,
            ASMS_Id: asmsId,
            asmS_Id: asmsId,
            studentlist: studentArr,
            studentList: studentArr,
            Temp_AmstIds: studentArr,
            temp_Amstids: studentArr,
            temp_AmstIds: studentArr,
            reporttype: 'REPORT',
            reportType: 'REPORT'
        };

        const className = String(data.className || data.classname || data.asmcL_ClassName || '').toUpperCase().trim();
        const is1to5 =
            /\b(I|II|III|IV|V|1|2|3|4|5|CLASS 1|CLASS 2|CLASS 3|CLASS 4|CLASS 5|CLASS I|CLASS II|CLASS III|CLASS IV|CLASS V)\b/i.test(
                className
            ) && !/\b(VI|VII|VIII|IX|X)\b/i.test(className);
        const is9to10 = /\b(IX|X|9|10)\b/i.test(className);

        let candidateEndpoints: string[];
        if (is1to5) {
            candidateEndpoints = [
                '/JSHSExamReports_/nds_1_5_report',
                '/JSHSExamReports/nds_1_5_report',
                '/JSHSExamReports_/nds_6_8_report',
                '/JSHSExamReports/nds_6_8_report',
                '/JSHSExamReports_/nds_9_report',
                '/JSHSExamReports/nds_9_report',
                '/JSHSExamReports_/nds_report',
                '/JSHSExamReports/nds_report',
                '/individual_exam_report_card/exam_report_card'
            ];
        } else if (is9to10) {
            candidateEndpoints = [
                '/JSHSExamReports_/nds_9_report',
                '/JSHSExamReports/nds_9_report',
                '/JSHSExamReports_/nds_6_8_report',
                '/JSHSExamReports/nds_6_8_report',
                '/JSHSExamReports_/nds_1_5_report',
                '/JSHSExamReports/nds_1_5_report',
                '/JSHSExamReports_/nds_report',
                '/JSHSExamReports/nds_report',
                '/individual_exam_report_card/exam_report_card'
            ];
        } else {
            candidateEndpoints = [
                '/JSHSExamReports_/nds_6_8_report',
                '/JSHSExamReports/nds_6_8_report',
                '/JSHSExamReports_/nds_1_5_report',
                '/JSHSExamReports/nds_1_5_report',
                '/JSHSExamReports_/nds_9_report',
                '/JSHSExamReports/nds_9_report',
                '/JSHSExamReports_/nds_report',
                '/JSHSExamReports/nds_report',
                '/individual_exam_report_card/exam_report_card'
            ];
        }

        let bestResponse: any = null;

        for (const ep of candidateEndpoints) {
            try {
                const res = await api.post<any>('exam', ep, payload);
                const raw = res?.data || res;
                if (!raw) continue;

                const marks =
                    raw?.getstudentmarksdetails ??
                    raw?.studentmarksdetails ??
                    raw?.getstudentwisetotaldetails ??
                    raw?.studentMarks ??
                    raw?.griddata ??
                    raw?.datareport ??
                    raw?.reportdata ??
                    raw?.savelist ??
                    raw?.reportlist;
                const hasMarks = Array.isArray(marks) ? marks.length > 0 : Boolean(marks?.$values && marks.$values.length > 0);

                const students = raw?.getstudentdetails ?? raw?.studentDetails ?? raw?.studentlist ?? raw?.studentList;
                const hasStudents = Array.isArray(students)
                    ? students.length > 0
                    : Boolean(students?.$values && students.$values.length > 0);

                if (hasMarks && hasStudents) {
                    return res;
                }

                if (!bestResponse && (hasStudents || hasMarks)) {
                    bestResponse = res;
                }
            } catch (epError) {
                console.warn(`[Samartha Promotion Report] ${ep} failed:`, epError);
            }
        }

        if (bestResponse) return bestResponse;

        return await api.post<any>('exam', candidateEndpoints[0], payload);
    } catch (error: any) {
        console.error('Error in getSamarthaProgressCardReportPromotion:', error);
        return { success: false, message: error?.message || 'An error occurred while fetching report data' };
    }
}
