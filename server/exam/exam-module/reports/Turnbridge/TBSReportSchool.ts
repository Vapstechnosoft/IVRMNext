'use server';

import { type ApiResponse, api } from '@/lib/apiService';

function cleanJson<T>(obj: T): T {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return obj;
    }
}

function hasDataItems(res: any): boolean {
    if (!res) return false;
    const dataObj = res.data || res;
    const checkArray = (arr: any) => {
        if (!arr) return false;
        if (Array.isArray(arr) && arr.length > 0) return true;
        if (arr.$values && Array.isArray(arr.$values) && arr.$values.length > 0) return true;
        return false;
    };

    const hasStudents = checkArray(dataObj.getstudentdetails) || checkArray(dataObj.studentdetails) || checkArray(dataObj.studentlist);
    return Boolean(hasStudents);
}

export async function getTBSReportSchool(data: any): Promise<ApiResponse<any>> {
    let payload: any = null;
    try {
        // Formatting student list
        let rawStudentIds: number[] = [];
        if (Array.isArray(data.temp_Amstids)) {
            rawStudentIds = data.temp_Amstids.map((item: any) => Number(item.amsT_Id ?? item.AMST_Id ?? item));
        } else if (Array.isArray(data.Temp_AmstIds)) {
            rawStudentIds = data.Temp_AmstIds.map((item: any) => Number(item.amsT_Id ?? item.AMST_Id ?? item));
        } else if (Array.isArray(data.selectedStudents)) {
            rawStudentIds = data.selectedStudents.map((item: any) => Number(item.amsT_Id ?? item.AMST_Id ?? item));
        }

        const asmaY_Id = Number(data.asmaY_Id ?? data.ASMAY_Id ?? 0);
        const asmcL_Id = Number(data.asmcL_Id ?? data.ASMCL_Id ?? 0);
        const asmS_Id = Number(data.asmS_Id ?? data.ASMS_Id ?? 0);

        // Auto-fetch student IDs if empty
        if (rawStudentIds.length === 0 && asmaY_Id > 0 && asmcL_Id > 0 && asmS_Id > 0) {
            try {
                const studentUrl = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
                const resStu = await api.get<any>('exam', studentUrl).catch(() => null);
                const rawStus = resStu?.data || resStu || [];
                if (Array.isArray(rawStus) && rawStus.length > 0) {
                    rawStudentIds = rawStus.map((s: any) => Number(s.amsT_Id ?? s.AMST_Id ?? s.id ?? s)).filter((id) => id > 0);
                }
            } catch (err) {
                console.error('[getTBSReportSchool] Error auto-fetching students:', err);
            }
        }

        const temp_Amstids = rawStudentIds
            .filter((id) => id > 0)
            .map((id) => ({
                AMST_Id: id,
                amsT_Id: id
            }));

        // Formatting exam list
        let rawExamIds: number[] = [];
        if (Array.isArray(data.examlist)) {
            rawExamIds = data.examlist.map((item: any) => Number(item.emE_Id ?? item.EME_Id ?? item));
        } else if (Array.isArray(data.examList)) {
            rawExamIds = data.examList.map((item: any) => Number(item.emE_Id ?? item.EME_Id ?? item));
        } else if (Array.isArray(data.selectedExams)) {
            rawExamIds = data.selectedExams.map((item: any) => Number(item.emE_Id ?? item.EME_Id ?? item));
        }

        // Auto-fetch exams for class & section if examlist is empty
        if (rawExamIds.length === 0 && asmaY_Id > 0 && asmcL_Id > 0 && asmS_Id > 0) {
            try {
                const url = `/exam_master/exam_drop_down_by_year_class_section_list/${asmaY_Id}/${asmcL_Id}/${asmS_Id}`;
                const res2 = await api.get<any>('exam', url).catch(() => null);
                const rawExams = res2?.data || res2 || [];
                if (Array.isArray(rawExams) && rawExams.length > 0) {
                    rawExamIds = rawExams.map((e: any) => Number(e.emE_Id ?? e.EME_Id ?? e.id ?? e)).filter((id) => id > 0);
                }
            } catch (err) {
                console.error('[getTBSReportSchool] Error auto-fetching exams:', err);
            }
        }

        const examlist = rawExamIds
            .filter((id) => id > 0)
            .map((id) => ({
                EME_Id: id,
                emE_Id: id
            }));

        // Auto-fetch grade ID if 0
        let emgR_Id = Number(data.emgR_Id ?? data.EMGR_Id ?? 0);
        if (emgR_Id === 0) {
            try {
                const resGrade = await api.get<any>('exam', '/exam_master_category/get_grade_list').catch(() => null);
                const rawGrades = resGrade?.data?.gradelist || resGrade?.gradelist || resGrade?.data || [];
                if (Array.isArray(rawGrades) && rawGrades.length > 0) {
                    emgR_Id = Number(rawGrades[0].emgR_Id ?? rawGrades[0].EMGR_Id ?? 1);
                }
            } catch (err) {
                console.error('[getTBSReportSchool] Error fetching grade list:', err);
            }
        }

        // Auto-fetch exam group details if empty
        let empG_GroupName = String(data.empG_GroupName ?? data.EMPG_GroupName ?? '');
        if (!empG_GroupName && asmaY_Id > 0 && asmcL_Id > 0 && asmS_Id > 0) {
            try {
                const groupRes = await api
                    .post<any>('exam', '/JSHSExamReports/get_Exam_grade', {
                        ASMAY_Id: asmaY_Id,
                        ASMCL_Id: asmcL_Id,
                        ASMS_Id: asmS_Id,
                        asmaY_Id,
                        asmcL_Id,
                        asmS_Id
                    })
                    .catch(() => null);

                const groups = groupRes?.data?.getgroupdetails || groupRes?.getgroupdetails || groupRes?.data?.getgroupexamdetails || [];
                if (Array.isArray(groups) && groups.length > 0) {
                    empG_GroupName = String(groups[0].empG_GroupName ?? groups[0].EMPG_GroupName ?? groups[0].empG_DistplayName ?? '');
                }
            } catch (err) {
                console.error('[getTBSReportSchool] Error fetching group details:', err);
            }
        }

        payload = {
            ASMAY_Id: asmaY_Id,
            ASMCL_Id: asmcL_Id,
            ASMS_Id: asmS_Id,
            asmaY_Id: asmaY_Id,
            asmcL_Id: asmcL_Id,
            asmS_Id: asmS_Id,
            empsG_PercentValue: Number(data.empsG_PercentValue ?? 0),
            flag: String(data.flag ?? ''),
            emE_Id: Number(data.emE_Id ?? 0),
            reporttype: String(data.reporttype ?? 'REPORT'),
            temp_Amstids,
            Temp_AmstIds: temp_Amstids,
            studentList: temp_Amstids,
            studentlist: temp_Amstids,
            selectedStudents: rawStudentIds,
            empG_GroupName,
            EMPG_GroupName: empG_GroupName,
            emgR_Id,
            EMGR_Id: emgR_Id,
            examlist,
            examList: examlist,
            selectedExams: rawExamIds,
            ecteX_NotApplToTotalFlg: Boolean(data.ecteX_NotApplToTotalFlg ?? true)
        };

        const endpoints = ['/JSHSExamReports_/promotion_report_TBSchool'];
        const minimalPayload = [
            {
                ASMAY_Id: asmaY_Id,
                ASMCL_Id: asmcL_Id,
                ASMS_Id: asmS_Id,
                Temp_AmstIds: temp_Amstids.map((t) => ({ amsT_Id: t.amsT_Id })),
                EMGR_Id: emgR_Id,
                EMPG_GroupName: empG_GroupName
            }
        ];

        console.log('=== MINIMAL PAYLOAD (matches beta) ===');
        console.log(JSON.stringify(minimalPayload, null, 2));

        let firstValidRes: any = null;
        for (const ep of endpoints) {
            console.log(`[getTBSReportSchool] Posting payload to ${ep}:`, minimalPayload);
            const res = await api.post<any>('exam', ep, payload).catch(() => null);

            console.log(`=== RAW RESPONSE FROM ${ep} ===`);
            console.log('Is Array:', Array.isArray(res));
            console.log(JSON.stringify(res, null, 2)?.substring(0, 2000));

            if (res && !firstValidRes && (res.getstudentdetails || res.studentdetails || res.data)) {
                firstValidRes = res;
            }

            if (hasDataItems(res)) {
                console.log('========== GROUP DETAILS ==========');
                console.log(JSON.stringify(res?.data?.getgroupdetails, null, 2));

                console.log('========== GROUP EXAM DETAILS ==========');
                console.log(JSON.stringify(res?.data?.getgroupexamdetails, null, 2));

                console.log('========== STUDENT DETAILS ==========');
                console.log(JSON.stringify(res?.data?.getstudentdetails, null, 2));

                console.log('========== ATTENDANCE ==========');
                console.log(JSON.stringify(res?.data?.getstudentwiseattendancedetails, null, 2));

                console.log('========== TERM DETAILS ==========');
                const english = (res?.data?.getstudentmarksdetails || []).filter((m: any) => m.ismS_SubjectName === 'English Language');

                console.log('========== ENGLISH LANGUAGE RECORDS ==========');
                console.log(JSON.stringify(english, null, 2));
                console.log(JSON.stringify(res?.data?.getstudentwisetermwisedetails, null, 2));
                console.log(`[getTBSReportSchool] Success response with student details from ${ep}:`, res);

                console.log('=== GROUPWISE EXAM SAMPLE ===');
                console.log(JSON.stringify(res?.data?.groupwiseexamlist?.[0], null, 2));

                console.log('=== GROUP EXAM DETAILS SAMPLE ===');
                console.log(JSON.stringify(res?.data?.getgroupexamdetails?.[0], null, 2));

                console.log('=== GROUP DETAILS SAMPLE ===');
                console.log(JSON.stringify(res?.data?.getgroupdetails?.[0], null, 2));

                console.log('=== RES DATA FULL KEYS ===', Object.keys(res?.data || {}));
                for (const key of Object.keys(res?.data || {})) {
                    const val = res?.data?.[key];
                    if (Array.isArray(val) && val.length > 0) {
                        console.log(`=== DATA ARRAY KEY: ${key} (count: ${val.length}) ===`);
                        console.log(JSON.stringify(val[0], null, 2)?.substring(0, 1000));
                    }
                }
                return cleanJson(res) as ApiResponse<any>;
            }
        }

        if (firstValidRes) {
            console.log('[getTBSReportSchool] Returning first valid response:', firstValidRes);
            return cleanJson(firstValidRes) as ApiResponse<any>;
        }
    } catch (error) {
        console.error('getTBSReportSchool error:', error);
    }

    console.log('[getTBSReportSchool] Backend returned no records across endpoints.');
    return cleanJson({
        success: true,
        message: 'No records found',
        data: null
    });
}
