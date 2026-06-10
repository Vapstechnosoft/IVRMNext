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
        const stuId = stu.AMST_Id || stu.amsT_Id;

        // Subjects
        const studentSubjects = getstudentwisesubjectlist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

        // Marks
        const studentMarks = getstudentmarksdetails.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Exam wise total marks
        const studentExamMarks = getstudent_examwisemarks.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Remarks
        const promotionRemarks = getpromotionremarksdetails.find((d: any) => {
            const dId = d.AMST_Id || d.amsT_Id;
            return dId && stuId && Number(dId) === Number(stuId);
        });
        const remarks = promotionRemarks?.eprD_Remarks || '';
        const promotedclass = promotionRemarks?.eprD_ClassPromoted || '';

        // Attendance
        const attendance = getstudentwiseattendancedetails.filter((d: any) => {
            const dId = d.AMST_Id || d.amsT_Id;
            return dId && stuId && Number(dId) === Number(stuId);
        }).map((d: any) => ({
            classheld: d.TOTALWORKINGDAYS || d.totalworkingdays,
            emE_Id: d.EME_Id || d.emE_Id,
            classatt: d.PRESENTDAYS || d.presentdays,
            percentage: d.ATTENDANCEPERCENTAGE || d.attendancepercentage,
            term: d.EMPSG_DisplayName || d.empsG_DisplayName
        }));

        // Suggestions
        const suggestions = examwiseremarks.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        }).map((s: any) => s.ecterE_Remarks || s.eprd_remarks || '');

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => {
            const tId = t.AMST_Id || t.amsT_Id;
            return tId && stuId && Number(tId) === Number(stuId);
        });

        // Generate Chart Data (Highest vs Average vs Obtained)
        const chartData = [];
        for (const subj of studentSubjects) {
            const displayMarks = subj.EYCES_MarksDisplayFlg === true || subj.EYCES_MarksDisplayFlg === 1 || subj.EYCES_MarksDisplayFlg === '1' || subj.EYCES_MarksDisplayFlg === 'true' ||
                subj.eyceS_MarksDisplayFlg === true || subj.eyceS_MarksDisplayFlg === 1 || subj.eyceS_MarksDisplayFlg === '1' || subj.eyceS_MarksDisplayFlg === 'true';
            if (displayMarks) {
                const subjectName = subj.ISMS_SubjectName || subj.ismS_SubjectName;
                const subjId = subj.ISMS_Id || subj.ismS_Id;
                const examTotal = examwisetotal.find((t: any) =>
                    (t.ISMS_Id && subjId && Number(t.ISMS_Id) === Number(subjId)) ||
                    (t.ismS_Id && subjId && Number(t.ismS_Id) === Number(subjId)) ||
                    t.ISMS_SubjectName === subjectName ||
                    t.ismS_SubjectName === subjectName
                );

                chartData.push({
                    subject: subjectName,
                    highest: examTotal?.ESTMPPS_ClassHighest || examTotal?.estmppS_ClassHighest || 0,
                    average: examTotal?.ESTMPPS_SectionAverage || examTotal?.estmppS_SectionAverage || 0,
                    obtained: examTotal?.ObtainedMarks || examTotal?.obtainedMarks || 0
                });
            }
        }

        // Skills for the specific student
        const studentSkills = getstudentwiseskillslist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

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
            chartData,
            studentSkills
        };
    });

    // Unique skills list (skilllist_temp)
    const skilllist_temp: any[] = [];
    for (const dev of getstudentwiseskillslist) {
        const devId = dev.ECS_Id ?? dev.ecS_Id;
        if (!skilllist_temp.find(emp => (emp.ECS_Id ?? emp.ecS_Id) === devId)) {
            skilllist_temp.push(dev);
        }
    }
    console.log("skilllist_temp", skilllist_temp)
    return {
        getinstitution,
        getgroupdetails,
        groupwiseexamlist,
        gettermdetails,
        skilllist_temp,
        studentdetails: studentListDetails,
    };
}

/**
 * Fetches and transforms the Calcutta Promotion Report I-V data
 */
export async function getCalcuttaPromotionReportI_V(data: any) {
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
        getstudentwiseactiviteslist = [],
        gettermdetails = [],
        exam_promotion_groupwise_remarks = [],
        getpromotionremarksdetails = [],
        getstudentwiseattendancedetails = [],
        examwiseremarks = [],
        getexamwisetotaldetails = [],
        examWise_PaperType = [],
        getparticipatedetails = [],
        getgradelist = []
    } = response;

    // 1. Group wise exam list construction
    const groupwiseexamlist = [];

    for (const dd of getgroupdetails) {
        let counttotal = 0;
        const groupewiseexamTemp = [];

        for (const d of getgroupexamdetails) {
            if (dd.empG_DistplayName === d.empG_DistplayName || dd.empG_GroupName === d.empG_GroupName) {
                counttotal += d.empsgE_ForMaxMarkrs || 0;

                const examMap = {
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName || d.empG_GroupName,
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
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: ""
        });

        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: "Highest in Class",
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: "Highest in Class",
            columname: ""
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: "Marks Obtained",
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: "Marks",
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: "Highest in Class",
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: "Highest in Class"
        });

        dd.empsG_MarksValue = counttotal;
        dd.groupewiseexam = groupewiseexamTemp;
    }

    // exam_promotion_groupwise_remarks processing for PE
    const examwiseremarkstemp = (exam_promotion_groupwise_remarks || []).filter(
        (r: any) => r.ECTERE_Indi_OverAllFlag === 'PE' || r.ecterE_Indi_OverAllFlag === 'PE'
    );

    // 2. Map all related data to student details
    const studentListDetails = getstudentdetails.map((stu: any) => {
        const stuId = stu.AMST_Id || stu.amsT_Id;

        // Subjects
        const studentSubjects = getstudentwisesubjectlist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

        // Marks
        const studentMarks = getstudentmarksdetails.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Exam wise total marks
        const studentExamMarks = getstudent_examwisemarks.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Remarks
        const promotionRemarks = getpromotionremarksdetails.find((d: any) => {
            const dId = d.AMST_Id || d.amsT_Id;
            return dId && stuId && Number(dId) === Number(stuId);
        });
        const remarks = promotionRemarks?.eprD_Remarks || '';
        const promotedclass = promotionRemarks?.eprD_ClassPromoted || '';

        // Attendance
        const attendance = getstudentwiseattendancedetails.filter((d: any) => {
            const dId = d.AMST_Id || d.amsT_Id;
            return dId && stuId && Number(dId) === Number(stuId);
        }).map((d: any) => ({
            classheld: d.TOTALWORKINGDAYS || d.totalworkingdays,
            emE_Id: d.EME_Id || d.emE_Id,
            classatt: d.PRESENTDAYS || d.presentdays,
            percentage: d.ATTENDANCEPERCENTAGE || d.attendancepercentage,
            term: d.EMPSG_DisplayName || d.empsG_DisplayName
        }));

        // Suggestions (optional)
        const suggestions = examwiseremarks.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        }).map((s: any) => s.ecterE_Remarks || s.eprd_remarks || '');

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => {
            const tId = t.AMST_Id || t.amsT_Id;
            return tId && stuId && Number(tId) === Number(stuId);
        });

        // Generate Chart Data (Highest vs Average vs Obtained)
        const chartData = [];
        for (const subj of studentSubjects) {
            const displayMarks = subj.EYCES_MarksDisplayFlg === true || subj.EYCES_MarksDisplayFlg === 1 || subj.EYCES_MarksDisplayFlg === '1' || subj.EYCES_MarksDisplayFlg === 'true' ||
                subj.eyceS_MarksDisplayFlg === true || subj.eyceS_MarksDisplayFlg === 1 || subj.eyceS_MarksDisplayFlg === '1' || subj.eyceS_MarksDisplayFlg === 'true';
            if (displayMarks) {
                const subjectName = subj.ISMS_SubjectName || subj.ismS_SubjectName;
                const subjId = subj.ISMS_Id || subj.ismS_Id;
                const examTotal = examwisetotal.find((t: any) =>
                    (t.ISMS_Id && subjId && Number(t.ISMS_Id) === Number(subjId)) ||
                    (t.ismS_Id && subjId && Number(t.ismS_Id) === Number(subjId)) ||
                    t.ISMS_SubjectName === subjectName ||
                    t.ismS_SubjectName === subjectName
                );

                chartData.push({
                    subject: subjectName,
                    highest: examTotal?.ESTMPPS_ClassHighest || examTotal?.estmppS_ClassHighest || 0,
                    average: examTotal?.ESTMPPS_SectionAverage || examTotal?.estmppS_SectionAverage || 0,
                    obtained: examTotal?.ObtainedMarks || examTotal?.obtainedMarks || 0
                });
            }
        }

        // Skills for the specific student
        const studentSkills = getstudentwiseskillslist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

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
            chartData,
            studentSkills
        };
    });

    // Unique skills list (skilllist_temp)
    const skilllist_temp: any[] = [];
    for (const dev of getstudentwiseskillslist) {
        const devId = dev.ECS_Id ?? dev.ecS_Id;
        if (!skilllist_temp.find(emp => (emp.ECS_Id ?? emp.ecS_Id) === devId)) {
            skilllist_temp.push(dev);
        }
    }

    return {
        getinstitution,
        getgroupdetails,
        groupwiseexamlist,
        gettermdetails,
        skilllist_temp,
        examwiseremarkstemp,
        studentdetails: studentListDetails,
        getgradelist,
        getpromotionremarksdetails
    };
}


/**
 * Fetches grades and exams based on selection
 */
export async function getGradeExamCalcutta(data: any) {
    const url = '/JSHSExamReports/get_Exam_grade';
    const res = await api.post<any>('exam', url, data);
    return res?.data || res || {};
}

/**
 * Fetches and transforms the Multiple Exam Cumulative Report data
 */
export async function getMultipleExamCumulativeReportCalcutta(data: any) {
    const url = '/JSHSExamReports_/Get_Multiple_Exam_Cumulative_CalcuttaAsync';
    const res = await api.post<any>('exam', url, data);
    const response = res?.data || res || {};

    // Data transformation logic based on AngularJS controller
    const {
        getinstitution = [],
        getcumulativereportdetails = [],
        getsubjectslist = [],
        getstudentlist = [],
        gettermdetails = []
    } = response;

    // Sub columns processing
    const subcolmns: any[] = [];
    for (const dev of gettermdetails) {
        const exists = subcolmns.find(emp =>
            emp.ISMS_Id === dev.ISMS_Id &&
            emp.EME_Id === dev.EME_Id &&
            emp.EMSE_SubExamName === dev.EMSE_SubExamName
        );
        if (!exists) {
            subcolmns.push(dev);
        }
    }

    // Colspan calculation for subjects
    for (const dev of getsubjectslist) {
        let colspant = 0;
        for (const dId of subcolmns) {
            if (dId.ISMS_Id === dev.ISMS_Id) {
                colspant++;
            }
        }
        dev.colspan = colspant;
    }

    // Student wise marks mapping
    const studentListWithMarks = getstudentlist.map((stu: any) => {
        const markslist = getcumulativereportdetails.filter((m: any) => m.AMST_Id === stu.AMST_Id);
        return {
            ...stu,
            markslist
        };
    });

    return {
        getinstitution,
        getcumulativereportdetails,
        getsubjectslist,
        studentlistd: studentListWithMarks,
        subcolmns,
        colnspan: 6 + subcolmns.length
    };
}
