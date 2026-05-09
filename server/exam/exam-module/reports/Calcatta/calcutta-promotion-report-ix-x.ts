'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches and transforms the Calcutta Promotion Report IX-X data
 */
export async function getCalcuttaPromotionReportIX_X(data: any) {
    const url = '/JSHSExamReports_/PromotionReportI_IV';
    const res = await api.post<any>('exam', url, data);
    const response = res?.data || res || {};

    const {
        getgroupdetails = [],
        getgroupexamdetails = [],
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentmarksdetails = [],
        getstudent_examwisemarks = [],
        getstudentwiseattendancedetails = [],
        getgradelist = [],
        getexamwisetotaldetails = [],
        exam_promotion_groupwise_remarks = [] // from legacy JS: promise.exam_promotion_groupwise_remarks
    } = response;

    // Filter remarks where ECTERE_Indi_OverAllFlag == "PE"
    const examwiseremarkstemp = exam_promotion_groupwise_remarks.filter(
        (remark: any) => remark.ECTERE_Indi_OverAllFlag === 'PE'
    );

    // 1. Group wise exam list construction
    const groupwiseexamlist = [];

    for (const dd of getgroupdetails) {
        let counttotal = 0;
        const groupewiseexamTemp = [];

        for (const d of getgroupexamdetails) {
            if (dd.empG_DistplayName === d.empG_DistplayName) {
                counttotal += d.empsgE_ForMaxMarkrs || 0;

                const examMap = {
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamCode || d.emE_ExamName
                };
                groupewiseexamTemp.push(examMap);
                groupwiseexamlist.push(examMap);
            }
        }

        // Add Marks Obtained
        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: "Marks Obtained",
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: ""
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: "Marks Obtained",
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: "Marks",
        });

        dd.empsG_MarksValue = counttotal;
        dd.groupewiseexam = groupewiseexamTemp;
    }

    // 2. Map all related data to student details
    const studentListDetails = getstudentdetails.map((stu: any) => {
        // Subjects
        const studentSubjects = getstudentwisesubjectlist.filter((s: any) => s.AMST_Id === stu.amsT_Id || s.amsT_Id === stu.amsT_Id);

        // Marks
        const studentMarks = getstudentmarksdetails.filter((m: any) => m.AMST_Id === stu.amsT_Id || m.amsT_Id === stu.amsT_Id);

        // Exam wise total marks
        const studentExamMarks = getstudent_examwisemarks.filter((m: any) => m.AMST_Id === stu.amsT_Id || m.amsT_Id === stu.amsT_Id);

        // Remarks & Conduct
        const studentRemarks = examwiseremarkstemp.filter((r: any) => r.AMST_Id === stu.amsT_Id || r.amsT_Id === stu.amsT_Id);
        
        // Attendance
        const attendance = getstudentwiseattendancedetails.filter((d: any) => d.AMST_Id === stu.amsT_Id || d.amsT_Id === stu.amsT_Id).map((d: any) => ({
            classheld: d.TOTALWORKINGDAYS || d.totalworkingdays,
            emE_Id: d.EME_Id || d.emE_Id,
            classatt: d.PRESENTDAYS || d.presentdays,
            percentage: d.TOTALAttendancePercentage || d.attendancepercentage,
            term: d.EMPSG_DisplayName || d.empsG_DisplayName
        }));

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => t.AMST_Id === stu.amsT_Id || t.amsT_Id === stu.amsT_Id);

        // 3. Chart Data Generation
        const chartData = [];
        const studentChartSubjects = getstudentwisesubjectlist.filter(
            (s: any) => (s.AMST_Id === stu.amsT_Id || s.amsT_Id === stu.amsT_Id) && (s.EYCES_MarksDisplayFlg || s.eyceS_MarksDisplayFlg)
        );

        for (const subj of studentChartSubjects) {
            const subjectName = subj.ISMS_SubjectName || subj.ismS_SubjectName;
            
            // Find exam wise total details for this subject and student
            const stats = examwisetotal.find((e: any) => 
                (e.ISMS_Id === subj.ISMS_Id || e.ismS_Id === subj.ismS_Id) && 
                (e.EYCES_MarksDisplayFlg || e.eyceS_MarksDisplayFlg)
            );

            if (stats) {
                chartData.push({
                    subject: subjectName,
                    highest: stats.ESTMPPS_ClassHighest || stats.estmppS_ClassHighest || 0,
                    average: stats.ESTMPPS_SectionAverage || stats.estmppS_SectionAverage || 0,
                    obtained: stats.ObtainedMarks || stats.obtainedMarks || 0
                });
            } else {
                chartData.push({
                    subject: subjectName,
                    highest: 0,
                    average: 0,
                    obtained: 0
                });
            }
        }

        return {
            ...stu,
            studentsubjects: studentSubjects,
            studentmarks: studentMarks,
            student_marks: studentExamMarks,
            examwisetotal,
            attendance,
            studentRemarks,
            chartData
        };
    });

    return {
        getgroupdetails,
        groupwiseexamlist,
        getgradelist,
        studentdetails: studentListDetails,
    };
}
