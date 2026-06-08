'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches and transforms the Calcutta Promotion Report I-IX data
 */
export async function getCalcuttaPromotionReportI_IX(data: any) {
    const url = '/JSHSExamReports_/cbs_PromotionReportI_IV';
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
        gettermdetails = [],
        getpromotionremarksdetails = [],
        getstudentwiseattendancedetails = [],
        getgradelist = [],
        getexamwisetotaldetails = [],
        exam_promotion_groupwise_remarks = [],
        examwiseremarks = []
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

        // Add Marks Obtained & Highest in Class (similar to I-IV logic but only adding what's needed)
        // I-IX might need different columns, but we mirror I-IV for consistency in the response
        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: ''
        });

        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: 'Highest in Class',
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: 'Highest in Class',
            columname: ''
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: 'Marks'
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: 'Highest in Class',
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: 'Highest in Class'
        });

        dd.empsG_MarksValue = counttotal;
        dd.groupewiseexam = groupewiseexamTemp;
    }

    // 2. Map all related data to student details
    const studentListDetails = getstudentdetails.map((stu: any) => {
        // Subjects
        const studentSubjects = getstudentwisesubjectlist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            const stuId = stu.amsT_Id || stu.AMST_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

        // Marks
        const studentMarks = getstudentmarksdetails.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            const stuId = stu.amsT_Id || stu.AMST_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Exam wise total marks
        const studentExamMarks = getstudent_examwisemarks.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            const stuId = stu.amsT_Id || stu.AMST_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Remarks
        const promotionRemarks = getpromotionremarksdetails.find((d: any) => {
            const dId = d.amsT_Id || d.AMST_Id;
            const stuId = stu.amsT_Id || stu.AMST_Id;
            return dId && stuId && Number(dId) === Number(stuId);
        });
        const remarks = promotionRemarks?.eprD_Remarks || '';
        const promotedclass = promotionRemarks?.eprD_ClassPromoted || '';

        // Attendance (I-IX logic mapsTOTALAttendancePercentage)
        const attendance = getstudentwiseattendancedetails
            .filter((d: any) => {
                const dId = d.AMST_Id || d.amsT_Id;
                const stuId = stu.amsT_Id || stu.AMST_Id;
                return dId && stuId && Number(dId) === Number(stuId);
            })
            .map((d: any) => ({
                classheld: d.TOTALWORKINGDAYS || d.totalworkingdays,
                emE_Id: d.EME_Id || d.emE_Id,
                classatt: d.PRESENTDAYS || d.presentdays,
                percentage: d.TOTALAttendancePercentage || d.attendancepercentage,
                term: d.EMPSG_DisplayName || d.empsG_DisplayName
            }));

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => {
            const tId = t.AMST_Id || t.amsT_Id;
            const stuId = stu.amsT_Id || stu.AMST_Id;
            return tId && stuId && Number(tId) === Number(stuId);
        });

        // Skills for the specific student
        const studentSkills = getstudentwiseskillslist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            const stuId = stu.amsT_Id || stu.AMST_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

        // Generate Chart Data (Highest vs Average vs Obtained)
        const chartData = [];
        for (const subj of studentSubjects) {
            if (
                subj.EYCES_MarksDisplayFlg ||
                subj.eyceS_MarksDisplayFlg ||
                subj.eyceS_MarksDisplayFlg === 'true' ||
                subj.EYCES_MarksDisplayFlg === 'true'
            ) {
                const subjectName = subj.ISMS_SubjectName || subj.ismS_SubjectName;
                const subjId = subj.ISMS_Id || subj.ismS_Id;

                // Find stats from student's examwisetotal
                const stats = examwisetotal.find(
                    (t: any) =>
                        (t.ISMS_Id && subjId && Number(t.ISMS_Id) === Number(subjId)) ||
                        (t.ismS_Id && subjId && Number(t.ismS_Id) === Number(subjId)) ||
                        t.ISMS_SubjectName === subjectName ||
                        t.ismS_SubjectName === subjectName
                );

                // Find stats from global getexamwisetotaldetails (if student-specific filter is empty or missing average)
                const globalStats = getexamwisetotaldetails.find(
                    (t: any) =>
                        (t.ISMS_Id && subjId && Number(t.ISMS_Id) === Number(subjId)) ||
                        (t.ismS_Id && subjId && Number(t.ismS_Id) === Number(subjId)) ||
                        t.ISMS_SubjectName === subjectName ||
                        t.ismS_SubjectName === subjectName
                );

                // Find obtained marks directly from studentmarks (more reliable)
                const obtainedEntry = studentMarks.find(
                    (m: any) => Number(m.ISMS_Id || m.ismS_Id) === Number(subjId) && Number(m.EME_Id || m.emE_Id) === 9800000
                );

                // Find highest marks directly from studentmarks (more reliable)
                const highestEntry = studentMarks.find(
                    (m: any) => Number(m.ISMS_Id || m.ismS_Id) === Number(subjId) && Number(m.EME_Id || m.emE_Id) === 98000012
                );

                const obtained =
                    obtainedEntry?.groupMarks ?? obtainedEntry?.obtainedMarks ?? stats?.ObtainedMarks ?? stats?.obtainedMarks ?? 0;
                const highest =
                    highestEntry?.estmppS_ClassHighest ??
                    highestEntry?.ESTMPPS_ClassHighest ??
                    stats?.ESTMPPS_ClassHighest ??
                    stats?.estmppS_ClassHighest ??
                    globalStats?.ESTMPPS_ClassHighest ??
                    globalStats?.estmppS_ClassHighest ??
                    0;
                const average =
                    stats?.ESTMPPS_SectionAverage ??
                    stats?.estmppS_SectionAverage ??
                    globalStats?.ESTMPPS_SectionAverage ??
                    globalStats?.estmppS_SectionAverage ??
                    0;

                chartData.push({
                    subject: subjectName,
                    highest: Number(highest) || 0,
                    average: Number(average) || 0,
                    obtained: Number(obtained) || 0
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
            studentSkills,
            chartData
        };
    });

    // Unique skills list (skilllist_temp)
    const skilllist_temp: any[] = [];
    const activitylist_temp: any[] = [];

    for (const dev of getstudentwiseskillslist) {
        const ecsId = dev.ECS_Id ?? dev.ecS_Id;
        const ecsSkillName = dev.ECS_SkillName ?? dev.ecS_SkillName;
        const ecsaId = dev.ECSA_Id ?? dev.ecsA_Id;
        const ecsaSkillArea = dev.ECSA_SkillArea ?? dev.ecsA_SkillArea;

        if (ecsId && !skilllist_temp.find((emp) => (emp.ECS_Id ?? emp.ecS_Id) === ecsId)) {
            skilllist_temp.push({
                ECS_Id: ecsId,
                ECS_SkillName: ecsSkillName
            });
        }
        if (ecsaId && !activitylist_temp.find((act) => (act.ECSA_Id ?? act.ecsA_Id) === ecsaId)) {
            activitylist_temp.push({
                ECS_Id: ecsId,
                ECSA_Id: ecsaId,
                ECSA_SkillArea: ecsaSkillArea
            });
        }
    }

    // exam_promotion_groupwise_remarks processing for PE
    const examwiseremarkstemp = (exam_promotion_groupwise_remarks || []).filter((r: any) => {
        const flag = (r.ECTERE_Indi_OverAllFlag || r.ecterE_Indi_OverAllFlag || '').trim().toUpperCase();
        return flag === 'PE';
    });

    return {
        getinstitution,
        getgroupdetails,
        groupwiseexamlist,
        gettermdetails,
        skilllist_temp,
        activitylist_temp,
        getgradelist,
        getpromotionremarksdetails,
        examwiseremarkstemp,
        studentdetails: studentListDetails
    };
}
