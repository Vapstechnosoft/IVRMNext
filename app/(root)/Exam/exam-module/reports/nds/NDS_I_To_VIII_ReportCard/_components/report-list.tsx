'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef, useMemo } from 'react';
import { format } from 'date-fns';

interface ReportListProps {
    data: any;
    academicYear: string;
}

export const ReportList = ({ data, academicYear }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        getinstitution = [],
        getstudentdetails = [],
        getstudentmarksdetails = [],
        gettermdetails = [],
        gettermexamdetails = [],
        getgroupexamdetails = [],
        getgroupdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseskillslist = [],
        getstudentwiseactiviteslist = [],
        getpromotionremarksdetails = [],
        clstchname = []
    } = data;

    const institution = getinstitution?.[0] || {};
    const classTeacher = clstchname?.[0]?.hrmE_EmployeeFirstName || "";
    const generateddate = new Date();

    // Replicating legacy AngularJS data transformation logic with added calculations
    const { reports, groupwiseexamlist, processedGroups } = useMemo(() => {
        if (!getstudentdetails) return { reports: [], groupwiseexamlist: [], processedGroups: [] };

        const groupwiseexamlist_full: any[] = [];
        const groups_with_exams: any[] = [];

        // Group Wise Exam List Construction
        getgroupdetails.forEach((dd: any) => {
            const groupwiseexamlist_temp: any[] = [];
            let counttotal = 0;

            getgroupexamdetails.forEach((d: any) => {
                if (dd.empG_DistplayName === d.empG_DistplayName) {
                    counttotal += d.empsgE_ForMaxMarkrs;

                    groupwiseexamlist_temp.push({
                        EMPG_GroupName: d.empG_GroupName, EME_Id: d.emE_Id,
                        EME_ExamName: d.emE_ExamName, EME_ExamOrder: d.emE_ExamOrder, EMPG_DistplayName: d.empG_DistplayName,
                        EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                        examnamedisplay: d.emE_ExamCode
                    });

                    groupwiseexamlist_full.push({
                        EMPG_GroupName: d.empG_GroupName, EME_Id: d.emE_Id,
                        EME_ExamName: d.emE_ExamName, EME_ExamOrder: d.emE_ExamOrder, EMPG_DistplayName: d.empG_DistplayName,
                        EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                        examnamedisplay: d.emE_ExamCode
                    });
                }
            });

            groupwiseexamlist_temp.push({
                EMPG_GroupName: dd.empG_GroupName, EME_Id: 9800000,
                EME_ExamName: "Marks Obtained", EME_ExamOrder: 9800000, EMPG_DistplayName: dd.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: counttotal, examnamedisplay: 'Total'
            });

            groupwiseexamlist_temp.push({
                EMPG_GroupName: dd.empG_GroupName, EME_Id: 9800001,
                EME_ExamName: "Grade", EME_ExamOrder: 9800001, EMPG_DistplayName: dd.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: counttotal, examnamedisplay: "Grade"
            });

            groupwiseexamlist_full.push({
                EMPG_GroupName: dd.empG_GroupName, EME_Id: 9800000,
                EME_ExamName: "Marks Obtained", EME_ExamOrder: 9800000, EMPG_DistplayName: dd.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: counttotal, examnamedisplay: 'Total'
            });

            groupwiseexamlist_full.push({
                EMPG_GroupName: dd.empG_GroupName, EME_Id: 9800001,
                EME_ExamName: "Grade", EME_ExamOrder: 9800001, EMPG_DistplayName: dd.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: counttotal, examnamedisplay: "Grade"
            });

            const myTerm = gettermdetails.find((t: any) => {
                const group_exams_in_term = gettermexamdetails.filter((te: any) => te.ecT_Id === t.ecT_Id).map((te: any) => te.emE_Id);
                return groupwiseexamlist_temp.some((e: any) => group_exams_in_term.includes(e.emE_Id));
            });

            groups_with_exams.push({
                ...dd,
                empsG_MarksValue: counttotal,
                groupewiseexam: groupwiseexamlist_temp,
                termName: myTerm?.ecT_TermName || ""
            });
        });

        const studentReports = getstudentdetails.map((stu: any) => {
            const studentId = stu.AMST_Id || stu.amsT_Id;

            // Student Wise Subject List
            const studentsubjects = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);

            // Student Wise Marks List - De-duplicate by EME_Id, Subject, and Group
            const all_student_marks = getstudentmarksdetails.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);
            const studentmarks: any[] = [];
            const seenMarks = new Set();
            all_student_marks.forEach((m: any) => {
                const eid = m.emE_Id || m.EME_Id;
                const sid = m.ismS_Id || m.ISMS_Id || m.ismS_SubjectName || m.ISMS_SubjectName || m.subjectName;
                const gname = (m.empsG_GroupName || m.EMPSG_GroupName || "").toLowerCase().trim();
                const key = `${eid}-${sid}-${gname}`;
                if (!seenMarks.has(key)) {
                    studentmarks.push(m);
                    seenMarks.add(key);
                }
            });

            // Calculate Totals and Grades for each group
            studentsubjects.forEach((subj: any) => {
                const s_name = (subj.ISMS_SubjectName || subj.subjectName || "").toLowerCase().trim();

                groups_with_exams.forEach((grp: any) => {
                    const groupExams = grp.groupewiseexam.filter((e: any) => (e.EME_Id || e.emE_Id) < 9000000);
                    const groupMarks = studentmarks.filter((m: any) => {
                        const m_name = (m.ISMS_SubjectName || m.ismS_SubjectName || m.subjectName || "").toLowerCase().trim();
                        const isSameSubject = m_name === s_name;

                        const m_group = (m.EMPSG_DisplayName || m.empsG_DisplayName || m.EMPSG_GroupName || m.empsG_GroupName || "").toLowerCase().trim();
                        const g_group = (grp.empG_DistplayName || grp.empG_GroupName || "").toLowerCase().trim();
                        const isSameGroup = m_group === g_group;

                        const m_emE_Id = m.EME_Id || m.emE_Id;
                        const isExamInGroup = groupExams.some((e: any) => (e.EME_Id || e.emE_Id) === m_emE_Id);

                        return isSameSubject && (isSameGroup || isExamInGroup);
                    });

                    if (groupMarks.length > 0) {
                        const totalObtained = groupMarks.reduce((sum: number, m: any) => {
                            const val = m.obtainedMarks ?? m.ObtainedMarks ?? 0;
                            return sum + Number(val);
                        }, 0);

                        // Add Total mark if not exists
                        studentmarks.push({
                            ISMS_SubjectName: subj.ISMS_SubjectName || subj.subjectName,
                            EME_Id: 9800000,
                            EMPSG_DisplayName: grp.empG_DistplayName || grp.empG_GroupName,
                            obtainedMarks: totalObtained,
                            PassFailFlag: 'Pass'
                        });

                        // Add Grade
                        studentmarks.push({
                            ISMS_SubjectName: subj.ISMS_SubjectName || subj.subjectName,
                            EME_Id: 9800001,
                            EMPSG_DisplayName: grp.empG_DistplayName || grp.empG_GroupName,
                            obtainedGrade: subj.subjectGrade || subj.subjectgrade || "",
                            PassFailFlag: 'Pass'
                        });
                    }
                });
            });

            // STUDENT WISE SKILL LIST (Co-Scholastic)
            const skill_main_list: any[] = [];
            getstudentwiseskillslist.forEach((dd: any) => {
                if ((dd.AMST_Id || dd.amsT_Id) === studentId) {
                    if (!skill_main_list.some(s => s.ECS_SkillName === dd.ECS_SkillName)) {
                        skill_main_list.push({ ECS_SkillName: dd.ECS_SkillName });
                    }
                }
            });

            skill_main_list.forEach((skill) => {
                const skill_score_details: any[] = [];
                gettermdetails.forEach((term: any) => {
                    getstudentwiseskillslist.forEach((dd: any) => {
                        if ((dd.AMST_Id || dd.amsT_Id) === studentId && skill.ECS_SkillName === dd.ECS_SkillName && term.ecT_Id === (dd.ecT_Id || dd.ECT_Id)) {
                            skill_score_details.push({ scoregrade: dd.EMGD_Name, ecT_Id: (dd.ecT_Id || dd.ECT_Id) });
                        }
                    });
                });
                skill.skill_score_details = skill_score_details;
            });

            // Student Wise Discipline List (Activities)
            const activity_main_list: any[] = [];
            getstudentwiseactiviteslist.forEach((act: any) => {
                if ((act.AMST_Id || act.amsT_Id) === studentId) {
                    if (!activity_main_list.some(a => a.ECACTA_SkillArea === act.ECACTA_SkillArea)) {
                        activity_main_list.push({ ECACTA_SkillArea: act.ECACTA_SkillArea });
                    }
                }
            });

            activity_main_list.forEach((act) => {
                const activity_score_details: any[] = [];
                gettermdetails.forEach((term: any) => {
                    getstudentwiseactiviteslist.forEach((dd: any) => {
                        if ((dd.AMST_Id || dd.amsT_Id) === studentId && act.ECACTA_SkillArea === dd.ECACTA_SkillArea && term.ecT_Id === (dd.ecT_Id || dd.ECT_Id)) {
                            activity_score_details.push({ scoregrade: dd.EMGD_Name, ecT_Id: (dd.ecT_Id || dd.ECT_Id) });
                        }
                    });
                });
                act.activity_score_details = activity_score_details;
            });

            // Promotion Remarks
            const remarks_detail = getpromotionremarksdetails.find((d: any) => (d.amsT_Id || d.AMST_Id) === studentId);

            return {
                ...stu,
                studentsubjects,
                studentmarks,
                skill_main_list,
                activity_main_list,
                remarks: remarks_detail?.eprD_Remarks || "",
                promotedclass: remarks_detail?.eprD_ClassPromoted || ""
            };
        });

        return { reports: studentReports, groupwiseexamlist: groupwiseexamlist_full, processedGroups: groups_with_exams };
    }, [getstudentdetails, getgroupdetails, getgroupexamdetails, getstudentwisesubjectlist, getstudentmarksdetails, getstudentwiseskillslist, getstudentwiseactiviteslist, gettermdetails, getpromotionremarksdetails, gettermexamdetails]);

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=1100,height=850');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>NDS I-VIII Report Card</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">
                        <style>
                            @page { size: portrait; margin: 5mm; }
                            body { font-family: 'Times New Roman', Times, serif; font-size: 13px; color: black; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .pagelayout { border: 1px solid black !important; padding: 10px !important; margin-bottom: 20px; page-break-after: always; background: white; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .text-bold { font-weight: bold; }
                            .margin-top-5 { margin-top: 5px; }
                            .margin-top-10 { margin-top: 10px; }
                            .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td { border: 1px solid black !important; }
                            .Ndsreport { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact !important; }
                            .Ndsreport1 { background-color: #f7db99 !important; -webkit-print-color-adjust: exact !important; }
                            .border-bottom { border-bottom: 1px solid black; padding-bottom: 2px; display: inline-block; min-width: 150px; }
                            .flex { display: flex; }
                            .items-center { align-items: center; }
                            .justify-between { justify-content: space-between; }
                            .gap-2 { gap: 8px; }
                            .flex-1 { flex: 1; }
                            .w-32 { width: 128px; }
                            .w-1\/4 { width: 25%; }
                            @media print {
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        ${innerContents}
                    </body>
                </html>
            `);
            popupWinindow.document.close();
        }
    };

    if (reports.length === 0) return null;

    return (
        <div className="space-y-6">
            <style>{`
                #HHS02 thead { color: black !important; text-align: center; background: white !important; }
                #HHS02 .trclasssubject { height: 140px !important; white-space: pre-wrap; }
                #HHS02 .pagelayout { border: 1px solid black !important; padding-left: 5px !important; padding-right: 5px !important; margin-bottom: 20px; background: white; max-width: 900px; margin-left: auto; margin-right: auto; }
                #HHS02 .Ndsreport { background-color: #c9eaf0 !important; }
                #HHS02 .Ndsreport1 { background-color: #f7db99 !important; }
                #HHS02 .row { display: flex; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; }
                #HHS02 .col-sm-12 { width: 100%; padding: 0 15px; box-sizing: border-box; }
                #HHS02 .col-sm-4 { width: 33.3333%; padding: 0 15px; box-sizing: border-box; }
                #HHS02 .col-sm-6 { width: 50%; padding: 0 15px; box-sizing: border-box; }
                #HHS02 .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 150px; padding-bottom: 2px; }
                #HHS02 .table-bordered td, #HHS02 .table-bordered th { border: 1px solid black !important; padding: 5px; }
                #HHS02 .img-responsive { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            `}</style>

            <div className="flex justify-end no-print">
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 shadow-lg">
                    <Printer className="mr-2 h-4 w-4" />
                    Print All Reports
                </Button>
            </div>

            <div ref={printRef} id="HHS02" className="bg-gray-100 p-4">
                {reports.map((report: any, index: number) => {
                    const clstchname = classTeacher?.[0]?.hrmE_EmployeeFirstName || classTeacher?.[0]?.userName || "";
                    return (
                        <div key={index} className="pagelayout" style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                            <div className="row margin-top-5">
                                <div className="col-sm-12">
                                    <img src={institution.mI_Logo} className="img-responsive" style={{ width: '100%' }} alt="Header" />
                                </div>
                            </div>
                            <br />
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="form-group flex items-center gap-2 py-1">
                                        <label className="font-bold w-32">SATS NO:</label>
                                        <label className="border-bottom font-bold" style={{ textAlign: 'center' }}>{report.amsT_RegistrationNo || report.amsT_AdmNo}</label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="form-group flex items-center gap-1 py-1">
                                        <label className="font-bold w-40">Student's Name :</label>
                                        <label className="border-bottom font-bold" style={{ textAlign: 'center' }}>{report.studentName || report.studentname}</label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="form-group flex items-center gap-2 py-1">
                                        <label className="font-bold w-32" >Father's Name :</label>
                                        <label className="border-bottom font-bold" style={{ textAlign: 'center' }}>{report.fatherName || report.fathername}</label>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="form-group flex items-center gap-2 py-1">
                                        <label className="font-bold w-32">Mother's Name :</label>
                                        <label className="border-bottom font-bold" style={{ textAlign: 'center' }}>{report.motherName || report.mothername}</label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="form-group flex items-center gap-2 py-1">
                                        <label className="font-bold w-32">Date Of Birth :</label>
                                        <label className="border-bottom font-bold" style={{ textAlign: 'center' }}>{report.dob}</label>
                                    </div>
                                </div>
                            </div>
                            &nbsp;
                            <div className="row margin-top-10">
                                <div className="col-sm-12">
                                    <table className="table-bordered table">
                                        <thead>
                                            <tr>
                                                <td className="text-left Ndsreport1" style={{ wordWrap: 'break-word', width: '100px' }}><b>Scholastic Areas(A)</b> </td>
                                                {processedGroups.map((grp: any, gIdx: number) => (
                                                    <th key={gIdx} colSpan={grp.groupewiseexam.length} className="text-center Ndsreport1" style={{ color: 'black' }}>
                                                        {grp.termName ? `${grp.termName} - ` : ""}{grp.empG_DistplayName || grp.empG_GroupName} ({grp.empsG_MarksValue} Marks)
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr>
                                                <th className="text-center Ndsreport" style={{ width: '100px' }}><b>Subject Name</b></th>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className="text-center Ndsreport" style={{ wordWrap: 'break-word', width: '150px' }}>
                                                        <b>{grpexam.examnamedisplay}</b> <br />
                                                        <b>({grpexam.EMPSGE_ForMaxMarkrs})</b>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        {report.studentsubjects.map((subj: any, sIdx: number) => (
                                            <tbody key={sIdx}>
                                                <tr>
                                                    <td className={`text-left ${subj.EMPS_AppToResultFlg ? 'Ndsreport' : ''}`} style={{ wordWrap: 'break-word' }}><b>{subj.ISMS_SubjectName || subj.subjectName}</b></td>
                                                    {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                        <td key={eIdx} className="text-center">
                                                            {report.studentmarks
                                                                .filter((mrks: any) => {
                                                                    const s_name = (subj.ISMS_SubjectName || subj.subjectName || "").toLowerCase().trim();
                                                                    const m_name = (mrks.ISMS_SubjectName || mrks.ismS_SubjectName || mrks.subjectName || "").toLowerCase().trim();
                                                                    const isSameSubject = s_name === m_name;

                                                                    const m_emE_Id = mrks.EME_Id || mrks.emE_Id;
                                                                    const g_emE_Id = grpexam.EME_Id || grpexam.emE_Id;
                                                                    const isSameExam = m_emE_Id === g_emE_Id;

                                                                    const m_group = (mrks.EMPSG_DisplayName || mrks.empsG_DisplayName || mrks.EMPSG_GroupName || mrks.empsG_GroupName || "").toLowerCase().trim();
                                                                    const g_group = (grpexam.EMPG_DistplayName || "").toLowerCase().trim();
                                                                    const isSameGroup = m_group === g_group || m_group === "";

                                                                    return isSameSubject && isSameExam && isSameGroup;
                                                                })
                                                                .map((mrks: any, mIdx: number) => (
                                                                    <span key={mIdx}>
                                                                        {['AB', 'M', 'L'].includes(mrks.PassFailFlag || mrks.passFailFlag) ? (
                                                                            <label>
                                                                                <b> {mrks.PassFailFlag || mrks.passFailFlag}</b>
                                                                                {(Number(mrks.ObtainedMarks ?? mrks.obtainedMarks ?? 0) > 0) && grpexam.examnamedisplay !== 'Grade' && <b>({mrks.ObtainedMarks ?? mrks.obtainedMarks})</b>}
                                                                            </label>
                                                                        ) : grpexam.examnamedisplay !== 'Grade' ? (
                                                                            <label><b> {mrks.ObtainedMarks ?? mrks.obtainedMarks ?? ""}</b></label>
                                                                        ) : (
                                                                            <label><b> {mrks.ObtainedGrade ?? mrks.obtainedGrade ?? ""}</b></label>
                                                                        )}
                                                                    </span>
                                                                ))
                                                            }
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                </div>
                            </div>
                            &nbsp;
                            <div className="row margin-top-10">
                                <div className="col-sm-12">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th colSpan={gettermdetails.length + 1} className="text-center Ndsreport1">Co-Scholastic Areas : {'{on 3- Point(A-C) grading scale}'}</th>
                                            </tr>
                                            <tr>
                                                <td style={{ width: '100px' }} className="text-center Ndsreport"></td>
                                                {gettermdetails.map((cos: any, tIdx: number) => (
                                                    <td key={tIdx} className="text-center Ndsreport">
                                                        {cos.ecT_TermName}
                                                    </td>
                                                ))}
                                            </tr>
                                        </thead>
                                        {report.skill_main_list.map((subjco: any, skIdx: number) => (
                                            <tbody key={skIdx}>
                                                <tr>
                                                    <td className="text-left Ndsreport" style={{ wordWrap: 'break-word' }}>
                                                        <b> {subjco.ECS_SkillName}</b>
                                                    </td>
                                                    {gettermdetails.map((cos: any, tIdx: number) => (
                                                        <td key={tIdx} className="text-center">
                                                            {subjco.skill_score_details
                                                                .filter((sc: any) => cos.ecT_Id === sc.ecT_Id)
                                                                .map((sc: any, scIdx: number) => (
                                                                    <b key={scIdx}>{sc.scoregrade}</b>
                                                                ))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                </div>
                            </div>
                            &nbsp;
                            <div className="row margin-top-10">
                                <div className="col-sm-12">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th colSpan={gettermdetails.length + 1} className="text-center Ndsreport1">Discipline : {'{on 3- Point(A-C) grading scale}'}</th>
                                            </tr>
                                            <tr>
                                                <td style={{ width: '100px' }} className="text-center Ndsreport"></td>
                                                {gettermdetails.map((cos: any, tIdx: number) => (
                                                    <td key={tIdx} className="text-center Ndsreport">
                                                        {cos.ecT_TermName}
                                                    </td>
                                                ))}
                                            </tr>
                                        </thead>
                                        {report.activity_main_list.map((subjco: any, actIdx: number) => (
                                            <tbody key={actIdx}>
                                                <tr>
                                                    <td className="text-left Ndsreport" style={{ wordWrap: 'break-word' }}>
                                                        <b>{subjco.ECACTA_SkillArea}</b>
                                                    </td>
                                                    {gettermdetails.map((cos: any, tIdx: number) => (
                                                        <td key={tIdx} className="text-center">
                                                            {subjco.activity_score_details
                                                                .filter((sc: any) => cos.ecT_Id === sc.ecT_Id)
                                                                .map((sc: any, scIdx: number) => (
                                                                    <b key={scIdx}>{sc.EMGD_Name}</b>
                                                                ))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                </div>
                            </div>

                            <div className="margin-top-10 space-y-2" style={{ marginTop: '30px' }}>
                                <div className="row">
                                    <div className="col-sm-12 flex items-center gap-2">
                                        <label className="font-bold">Class Teacher's Remarks : </label>
                                        <b className="border-bottom">{report.remarks}</b>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-12 flex items-center gap-2">
                                        <label className="font-bold">Promoted To Class : </label>
                                        <b className="border-bottom">{report.promotedclass}</b>
                                    </div>
                                </div>
                            </div>

                            <br />
                            <div className="row margin-top-10" style={{ marginTop: '40px' }}>
                                <div className="col-sm-12 flex justify-between items-start">
                                    <div className="w-1/4">
                                        <div className="form-group">
                                            <label className="font-bold">Date : {format(generateddate, 'dd/MM/yyyy')}</label>
                                        </div>
                                    </div>

                                    <div className="w-1/4 text-center flex flex-col items-center">
                                        <span className="font-bold mb-4">{clstchname}</span>
                                        <label className="font-bold border-t border-black pt-1 px-4 w-full">Signature of Class Teacher</label>
                                    </div>
                                    <div className="w-1/4 text-center">
                                        <label className="font-bold border-t border-black pt-1 px-4">Signature of Principal</label>
                                    </div>
                                    <div className="w-1/4 text-center">
                                        <label className="font-bold border-t border-black pt-1 px-4">Signature of Parents</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
