'use server';

import { api } from '@/lib/apiService';

/**
 * Server Action for Turnbridge Multiple Progress Card Report
 * Supports all Turnbridge backend endpoints with automatic fallback:
 * 1. /JSHSExamReports/BGHS_GetMultiple_Exam_Progress_Report
 * 2. /JSHSExamReports/promotion_report_TBSchool
 * 3. /JSHSExamReports_/promotion_report_TBSchool
 * 4. /JSHSExamReports/TBSPrimarySchool
 */

function ensureArray(arr: any): any[] {
    if (!arr) return [];
    if (Array.isArray(arr)) return arr;
    if (arr.$values && Array.isArray(arr.$values)) return arr.$values;
    return [];
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
    return Boolean(checkArray(dataObj.getstudentdetails) || checkArray(dataObj.studentdetails) || checkArray(dataObj.studentlist));
}

export async function getMultipleProgressCardReport(data: any) {
    try {
        const asmaY_Id = Number(data.ASMAY_Id ?? data.asmaY_Id ?? 0);
        const asmcL_Id = Number(data.ASMCL_Id ?? data.asmcL_Id ?? 0);
        const asmS_Id = Number(data.ASMS_Id ?? data.asmS_Id ?? 0);

        // 1. Auto-fetch student IDs if empty
        let rawStudentIds: number[] = [];
        if (Array.isArray(data.temp_Amstids)) {
            rawStudentIds = data.temp_Amstids.map((item: any) => Number(item.amsT_Id ?? item.AMST_Id ?? item));
        } else if (Array.isArray(data.Temp_AmstIds)) {
            rawStudentIds = data.Temp_AmstIds.map((item: any) => Number(item.amsT_Id ?? item.AMST_Id ?? item));
        }

        if (rawStudentIds.length === 0 && asmaY_Id > 0 && asmcL_Id > 0 && asmS_Id > 0) {
            try {
                const studentUrl = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
                const resStu = await api.get<any>('exam', studentUrl).catch(() => null);
                const rawStus = resStu?.data || resStu || [];
                const studentArr = ensureArray(rawStus);
                if (studentArr.length > 0) {
                    rawStudentIds = studentArr.map((s: any) => Number(s.amsT_Id ?? s.AMST_Id ?? s.id ?? s)).filter((id) => id > 0);
                }
            } catch (err) {
                console.error('[getMultipleProgressCardReport] Error auto-fetching students:', err);
            }
        }

        const temp_Amstids = rawStudentIds
            .filter((id) => id > 0)
            .map((id) => ({
                AMST_Id: id,
                amsT_Id: id
            }));

        // 2. Format exam list
        let rawExamIds: number[] = [];
        if (Array.isArray(data.examlist)) {
            rawExamIds = data.examlist.map((item: any) => Number(item.emE_Id ?? item.EME_Id ?? item));
        } else if (Array.isArray(data.examList)) {
            rawExamIds = data.examList.map((item: any) => Number(item.emE_Id ?? item.EME_Id ?? item));
        } else if (Array.isArray(data.selectedExams)) {
            rawExamIds = data.selectedExams.map((item: any) => Number(item.emE_Id ?? item.EME_Id ?? item));
        }

        const formattedExamList = (data.examlist || data.examList || []).map((e: any) => ({
            EME_Id: Number(e.EME_Id ?? e.emE_Id ?? e.eme_id ?? e),
            emE_Id: Number(e.EME_Id ?? e.emE_Id ?? e.eme_id ?? e),
            EME_ExamName: String(e.EME_ExamName ?? e.emE_ExamName ?? ''),
            emE_ExamName: String(e.EME_ExamName ?? e.emE_ExamName ?? '')
        }));

        const examlist = rawExamIds.map((id) => ({ EME_Id: id, emE_Id: id }));

        // 3. Auto-fetch Grade ID if 0
        let emgR_Id = Number(data.emgR_Id ?? data.EMGR_Id ?? 0);
        if (emgR_Id === 0) {
            try {
                const resGrade = await api.get<any>('exam', '/exam_master_category/get_grade_list').catch(() => null);
                const rawGrades = resGrade?.data?.gradelist || resGrade?.gradelist || resGrade?.data || [];
                const gradeArr = ensureArray(rawGrades);
                if (gradeArr.length > 0) {
                    emgR_Id = Number(gradeArr[0].emgR_Id ?? gradeArr[0].EMGR_Id ?? 1);
                }
            } catch (err) {
                console.error('[getMultipleProgressCardReport] Error fetching grade list:', err);
            }
        }

        const payload = {
            ASMAY_Id: asmaY_Id,
            ASMCL_Id: asmcL_Id,
            ASMS_Id: asmS_Id,
            asmaY_Id: asmaY_Id,
            asmcL_Id: asmcL_Id,
            asmS_Id: asmS_Id,
            temp_Amstids,
            Temp_AmstIds: temp_Amstids,
            temp_amstids: temp_Amstids,
            studentList: temp_Amstids,
            studentlist: temp_Amstids,
            selectedStudents: rawStudentIds,
            examlist: formattedExamList.length > 0 ? formattedExamList : examlist,
            examList: formattedExamList.length > 0 ? formattedExamList : examlist,
            selectedExams: rawExamIds,
            emgR_Id,
            EMGR_Id: emgR_Id,
            empsG_PercentValue: 0,
            flag: '',
            reporttype: 'REPORT',
            ecteX_NotApplToTotalFlg: true
        };

        const endpoints = [
            '/JSHSExamReports/BGHS_GetMultiple_Exam_Progress_Report',
            '/JSHSExamReports/promotion_report_TBSchool',
            '/JSHSExamReports_/promotion_report_TBSchool',
            '/JSHSExamReports/TBSPrimarySchool'
        ];

        let firstValidRes: any = null;
        for (const ep of endpoints) {
            console.log(`[getMultipleProgressCardReport] Posting to endpoint: ${ep}`);
            const res = await api.post<any>('exam', ep, payload).catch(() => null);

            if (res) {
                if (!firstValidRes && (res.getstudentdetails || res.studentdetails || res.data)) {
                    firstValidRes = res;
                }
                if (hasDataItems(res)) {
                    const rawObj = res?.data || res;
                    const transformedData = transformReportData(rawObj);
                    return {
                        success: true,
                        data: transformedData
                    };
                }
            }
        }

        if (firstValidRes) {
            const rawObj = firstValidRes?.data || firstValidRes;
            return {
                success: true,
                data: transformReportData(rawObj)
            };
        }

        return {
            success: false,
            message: 'No student records found for selected criteria',
            data: null
        };
    } catch (error) {
        console.error('MultipleProgressCardReportController error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}

/**
 * Data Transformation logic
 */
function transformReportData(data: any) {
    const getstudentmarksdetails = ensureArray(data.getstudentmarksdetails || data.studentmarksdetails || data.getstudent_examwisemarks);
    const getstudentwisesubjectlist = ensureArray(data.getstudentwisesubjectlist || data.studentwisesubjectlist);
    const getstudentdetails = ensureArray(data.getstudentdetails || data.studentdetails || data.studentlist || data.studentList);
    const getexamdetails = ensureArray(data.getexamdetails || data.examdetails);

    let totalMaxMarks = 0;
    for (const exam of getexamdetails) {
        totalMaxMarks += Number(exam.eyceS_MaxMarks ?? exam.eyces_maxmarks ?? exam.maxMarks ?? 0);
    }

    const processedExamDetails = [...getexamdetails];
    if (getexamdetails.length > 0 && !processedExamDetails.some((e: any) => (e.emE_ExamName || e.EME_ExamName) === 'Total')) {
        processedExamDetails.push({
            emE_Id: 150001,
            EME_Id: 150001,
            emE_ExamName: 'Total',
            EME_ExamName: 'Total',
            eyceS_MaxMarks: totalMaxMarks
        });
        processedExamDetails.push({ emE_Id: 150002, EME_Id: 150002, emE_ExamName: 'Grade', EME_ExamName: 'Grade', eyceS_MaxMarks: '' });
    }

    // Extract subjects if getstudentwisesubjectlist is empty
    let finalSubjects = getstudentwisesubjectlist;
    if (finalSubjects.length === 0 && getstudentmarksdetails.length > 0) {
        const subMap = new Map();
        getstudentmarksdetails.forEach((m: any) => {
            const id = Number(m.ISMS_Id ?? m.ismS_Id);
            const name = m.ISMS_SubjectName || m.ismS_SubjectName;
            if (id > 0 && name && !subMap.has(id)) {
                subMap.set(id, {
                    ISMS_Id: id,
                    ismS_Id: id,
                    ISMS_SubjectName: name,
                    ismS_SubjectName: name,
                    EYCES_AplResultFlg: true
                });
            }
        });
        finalSubjects = Array.from(subMap.values());
    }

    const transformedStudents = getstudentdetails.map((stu: any) => {
        const amstId = Number(stu.AMST_Id ?? stu.amsT_Id ?? stu.amst_id);

        const studentSubjects = finalSubjects.filter((sub: any) => {
            const subAmstId = Number(sub.AMST_Id ?? sub.amsT_Id ?? 0);
            return subAmstId === 0 || subAmstId === amstId || getstudentdetails.length === 1;
        });

        const studentMarks = getstudentmarksdetails.filter((mark: any) => {
            const markAmstId = Number(mark.AMST_Id ?? mark.amsT_Id ?? 0);
            return markAmstId === 0 || markAmstId === amstId || getstudentdetails.length === 1;
        });

        return {
            ...stu,
            AMST_Id: amstId,
            amsT_Id: amstId,
            studentname: stu.studentname || stu.studentName || stu.amsT_FirstName || stu.AMST_FirstName || '',
            admno: stu.admno || stu.admNo || stu.amsT_AdmNo || stu.AMST_AdmNo || '',
            rollno: stu.rollno ?? stu.amaY_RollNo ?? stu.AMST_RollNo ?? '',
            classname: stu.classname || stu.className || stu.asmcL_ClassName || stu.ASMCL_ClassName || '',
            sectionname: stu.sectionname || stu.sectionName || stu.asmC_SectionName || stu.ASMC_SectionName || '',
            dob: stu.dob || stu.AMST_DOB || stu.amsT_DOB || '',
            clastechname: stu.clastechname || stu.classTeacherName || stu.HRME_EmployeeFirstName || '',
            subjects: studentSubjects.length > 0 ? studentSubjects : finalSubjects,
            marks: studentMarks
        };
    });

    return {
        ...data,
        getexamdetails: processedExamDetails.length > 0 ? processedExamDetails : getexamdetails,
        getstudentdetails: transformedStudents,
        getstudentwisesubjectlist: finalSubjects,
        getstudentmarksdetails,
        work_attendence: ensureArray(data.work_attendence || data.work_attendance),
        present_attendence: ensureArray(data.present_attendence || data.present_attendance)
    };
}
