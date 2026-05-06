'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches the term details for the dropdown based on section selection
 */
export async function getTermsCalcutta(data: any) {
    const url = '/PromotionReportDetails/onchangesection';
    const response = await api.post<any>('exam', url, data);
    return response?.data || response || {};
}

/**
 * Fetches and transforms the Calcutta Promotion Report I-IV data
 * so the frontend UI can simply render without complex client-side mapping.
 */
export async function getCalcuttaPromotionReportI_IV(data: any) {
    const url = '/JSHSExamReports/PromotionReportI_IV';
    const res = await api.post<any>('exam', url, data);
    const response = res?.data || res || {};

    const {
        getinstitution = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentmarksdetails = [],
        getstudent_examwisemarks = [],
        getstudentwiseskillslist = [],
        getstudentwiseactiviteslist = [],
        gettermdetails = [],
        exam_promotion_groupwise_remarks = [],
        getpromotionremarksdetails = [],
        getstudentwiseattendancedetails = [],
        examwiseremarks = [],
        getexamwisetotaldetails = [],
        examWise_PaperType = [],
        getparticipatedetails = []
    } = response;

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

        // Add Marks Obtained & Highest in Class
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

        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: "Highest in Class",
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: "Highest in Class",
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

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: "Highest in Class",
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: "Highest in Class"
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

        // Remarks
        const promotionRemarks = getpromotionremarksdetails.find((d: any) => d.amsT_Id === stu.amsT_Id);
        const remarks = promotionRemarks?.eprD_Remarks || '';
        const promotedclass = promotionRemarks?.eprD_ClassPromoted || '';

        // Attendance
        const attendance = getstudentwiseattendancedetails.filter((d: any) => d.AMST_Id === stu.amsT_Id || d.amsT_Id === stu.amsT_Id).map((d: any) => ({
            classheld: d.TOTALWORKINGDAYS || d.totalworkingdays,
            emE_Id: d.EME_Id || d.emE_Id,
            classatt: d.PRESENTDAYS || d.presentdays,
            percentage: d.ATTENDANCEPERCENTAGE || d.attendancepercentage,
            term: d.EMPSG_DisplayName || d.empsG_DisplayName
        }));

        // Suggestions
        const suggestions = examwiseremarks.filter((s: any) => s.amsT_Id === stu.amsT_Id).map((s: any) => s.ecterE_Remarks || s.eprd_remarks || '');

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => t.AMST_Id === stu.amsT_Id || t.amsT_Id === stu.amsT_Id);

        // Generate Chart Data (Highest vs Average vs Obtained)
        const chartData = [];
        for (const subj of studentSubjects) {
            if (subj.EYCES_MarksDisplayFlg || subj.eyceS_MarksDisplayFlg) {
                const subjectName = subj.ISMS_SubjectName || subj.ismS_SubjectName;
                const examTotal = examwisetotal.find((t: any) => t.ISMS_SubjectName === subjectName || t.ismS_SubjectName === subjectName);
                
                chartData.push({
                    subject: subjectName,
                    highest: examTotal?.ESTMPPS_ClassHighest || examTotal?.estmppS_ClassHighest || 0,
                    average: examTotal?.ESTMPPS_SectionAverage || examTotal?.estmppS_SectionAverage || 0,
                    obtained: examTotal?.ObtainedMarks || examTotal?.obtainedMarks || 0
                });
            }
        }

        return {
            ...stu,
            studentsubjects: studentSubjects,
            studentmarks: studentMarks,
            student_marks: studentExamMarks,
            examwisetotal,
            remarks,
            promotedclass,
            attendance,
            suggestions,
            chartData
        };
    });

    return {
        getinstitution,
        getgroupdetails,
        groupwiseexamlist,
        gettermdetails,
        studentdetails: studentListDetails,
    };
}
