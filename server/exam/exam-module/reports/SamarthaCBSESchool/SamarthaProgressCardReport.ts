'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import { getSamarthaStudents } from './SamarthaProgressCardReportPromotion';

export async function getSamarthaProgressCardReport(data: any) {
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

        console.log(`=== [Samartha Report] Class: "${className}", Starting search among endpoints ===`);

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
                    console.log(`=== [Samartha Report] Live data found via ${ep} ===`);
                    return res;
                }

                if (!bestResponse && (hasStudents || hasMarks)) {
                    bestResponse = res;
                }
            } catch (epError) {
                console.warn(`[Samartha Report] ${ep} failed:`, epError);
            }
        }

        if (bestResponse) return bestResponse;

        // Fallback to first candidate endpoint
        return await api.post<any>('exam', candidateEndpoints[0], payload);
    } catch (error) {
        console.error('getSamarthaProgressCardReport error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}

export async function getSamarthaStudentsBySection(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
}) {
    return getSamarthaStudents(data.ASMAY_Id, data.ASMCL_Id, data.ASMS_Id);
}
