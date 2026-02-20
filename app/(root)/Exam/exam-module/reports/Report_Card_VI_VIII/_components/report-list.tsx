'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement // Register ArcElement for Pie charts
);

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    // Main Data Sources
    const studentDetails = data.studentDetails || data.getstudentdetails || [];
    const groupDetails = data.groupDetails || data.getgroupdetails || [];
    const groupWiseExamList = data.groupWiseExamList || data.groupwiseexamlist || [];
    const institution = (data.institutionList && data.institutionList[0]) || data.masterinstitution || data.institution || data.getinstitution;
    const gradeDetails = data.gradeDetails || data.getallgrade || []; // For Co-Scholastic grades
    const skillDetails = data.skillDetails || data.getskill || []; // For Co-Scholastic skills
    const examWiseTotalDetails = data.examWiseTotalDetails || data.getexamwisetotaldetails || [];
    const promotionRemarks = data.promotionRemarks || data.getpromotionremarksdetails || [];
    const studentGraphDetails = data.studentGraphDetails || data.studentdetailsgraph || [];

    // Attendance Sources
    const presentAttendance = data.presentAttendance || data.stud_present_attendence || [];

    // Config Flags
    const showLogo = params.printLogo;
    const showSuperAverage = params.superAverage;
    const examName = params.exmname;

    // Helper to get attendance
    const getAttendance = (amsT_Id: number) => {
        const presentFn = presentAttendance.find((a: any) => (a.amsT_Id === amsT_Id || a.AMST_Id === amsT_Id));
        if (presentFn) return presentFn.attendancePercentage || presentFn.ATTENDANCEPERCENTAGE || presentFn.total_Percentage || 0;
        return 0;
    };

    // Helper to get mark for a cell
    // Matches logic: subj.ISMS_Id==mrks.ISMS_Id && grpexam.EME_Id==mrks.EME_Id && mrks.EMPSG_DisplayName==grpexam.EMPG_DistplayName
    const getMarkValue = (report: any, subjectId: number, examId: number, groupDisplayName: string, examNameDisplay: string) => {
        const mark = (report.marks || report.studentmarks || []).find((m: any) =>
            (m.ISMS_Id === subjectId || m.ismS_Id === subjectId) &&
            (m.EME_Id === examId || m.emE_Id === examId) &&
            (m.EMPSG_DisplayName === groupDisplayName || m.empsG_DisplayName === groupDisplayName)
        );

        if (!mark) return null;

        if (['AB', 'M', 'L'].includes(mark.PassFailFlag)) {
            // Logic: if PassFailFlag is AB/M/L, show it.
            // But if ObtainedMarks > 0 and exam name is not AVG, show obtained marks in brackets? 
            // The Angular HTML says:
            // <span ng-if="marks.ObtainedMarks>0 && grpexam.EME_ExamName!='AVG'"> ({{marks.ObtainedMarks}}) </span>
            // This seems to refer to `marks` which might be a typo in Angular for `mrks` or available in scope. 
            // Standard logic: Show Flag.
            return mark.PassFailFlag;
        }

        const isAvgExam = examNameDisplay === 'AVG';

        if (mark.ObtainedMarks >= 0 && !['AB', 'M', 'L'].includes(mark.PassFailFlag)) {
            if (isAvgExam) {
                return <b>{mark.ObtainedMarks}</b>;
            }
            return mark.ObtainedMarks;
        }

        if (isAvgExam && mark.ESG_Id > 0) { // For Grade based subjects in AVG column?
            return <b>{mark.ObtainedMarks}</b>;
        }

        // Fallback for Grade if obtained marks is null/undefined but grade exists (e.g. for non-applicable to result)
        if (mark.ObtainedGrade && examNameDisplay === 'AVG') {
            return mark.ObtainedGrade;
        }

        return null;
    };

    // Get Total Mark for a specific exam column in the Total Row
    const getTotalMarkValue = (report: any, examId: number, groupDisplayName: string) => {
        const mark = (report.student_marks || []).find((m: any) =>
            (m.EME_Id === examId || m.emE_Id === examId) &&
            (m.EMPSG_DisplayName === groupDisplayName || m.empsG_DisplayName === groupDisplayName)
        );
        return mark ? mark.ObtainedMarks : null;
    };

    const getTotalPercentageValue = (report: any, examId: number, groupDisplayName: string) => {
        const mark = (report.student_marks || []).find((m: any) =>
            (m.EME_Id === examId || m.emE_Id === examId) &&
            (m.EMPSG_DisplayName === groupDisplayName || m.empsG_DisplayName === groupDisplayName)
        );
        return mark ? mark.TotalPercentage : null;
    };

    const getRankValue = (report: any, examId: number, groupDisplayName: string) => {
        const mark = (report.student_marks || []).find((m: any) =>
            (m.EME_Id === examId || m.emE_Id === examId) &&
            (m.EMPSG_DisplayName === groupDisplayName || m.empsG_DisplayName === groupDisplayName)
        );
        return mark ? mark.ESTMPP_SectionRank : null;
    };


    // Personality Profile Questions (from Angular HTML)
    const personalityQuestions = [
        "IS SELF-MOTIVATED AND COMPLETES TASK",
        "WORKS WELL WITH MINIMUM DIRECTION",
        "ORIGINATES IDEAS BUT NEEDS CONSTANT GUIDANCE",
        "CONTRIBUTES READILY",
        "SOMETIMES TAKES PART",
        "EASILY DISTRACTED",
        "VERY CAREFUL WORKER",
        "USUALLY NEAT",
        "ACCEPTS RESPONSIBILITY FOR LEARNING"
    ];

    return (
        <div className="space-y-6 printable-content font-serif">
            <div className="flex justify-end no-print">
                <Button onClick={handlePrint} className="flex items-center gap-2 w-fit">
                    <Printer className="w-4 h-4" /> Print Report
                </Button>
            </div>

            <div ref={printRef} className="print-area">
                {studentDetails && studentDetails.length > 0 ? (
                    studentDetails.map((report: any, index: number) => {
                        // Filter Subjects
                        const appSubjects = (report.studentsubjects || []).filter((s: any) => s.EMPS_AppToResultFlg);
                        const nonAppSubjects = (report.studentsubjects || []).filter((s: any) => !s.EMPS_AppToResultFlg);

                        // Filter Remarks
                        const remarks = promotionRemarks.filter((r: any) => r.AMST_Id === report.AMST_Id || r.amsT_Id === report.amsT_Id);

                        // Filter Graph Data
                        const graphData = studentGraphDetails.find((g: any) => g.AMST_Id === report.AMST_Id || g.amsT_Id === report.amsT_Id);

                        return (
                            <div key={index} className="bg-white p-4 mb-8 border border-gray-300 shadow-sm print:shadow-none print:border-none print:m-0 print:p-0 page-break-before-always">

                                {/* Header Logic from Angular: ng-if="logo==true" */}
                                {showLogo && (
                                    <div className="flex flex-row items-center justify-between mb-4">
                                        <div className="w-24 h-24">
                                            {/* Left Logo - using hardcoded URL from Angular if dynamic not present, or institution logo */}
                                            <img src="https://dcampusstrg.blob.core.windows.net/files/17/Trnsportdocuments/7115f492-3955-47e6-97d9-187413d0f3a5.jpg" className="w-full h-full object-contain" alt="Left Logo" />
                                        </div>
                                        <div className="flex-1 text-center">
                                            {/* Center Logo/Text */}
                                            <img src="https://sthomashowrah.blob.core.windows.net/files/Logo Header stt.jpg" className="h-[70px] mx-auto object-contain" alt="Header Logo" />
                                            <div className="text-[9px] leading-tight space-y-0.5 mt-1">
                                                <p>(Diocese of Calcutta, CNI)</p>
                                                <p>A Christian Minority Co-Educational English Medium School under Article 30 of the Indian Constitution)</p>
                                                <p>3, Church Road, Howrah-711101 West Bengal, India</p>
                                                <p>Phone No: +91 33 2641 2138,+91 33 2641 3590 Email ID: stesh1860@gmail.com</p>
                                            </div>
                                        </div>
                                        <div className="w-24">&nbsp;</div>
                                    </div>
                                )}
                                {!showLogo && <div className="mt-[130px]">&nbsp;</div>}

                                <div className="relative">
                                    {/* Background Image Wrapper */}
                                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20 print:opacity-20">
                                        <img src="https://sthomashowrah.blob.core.windows.net/files/4/stthomos.jpeg" className="w-[420px] h-[417px] object-contain" alt="Watermark" />
                                    </div>

                                    <div className="relative z-10">
                                        {/* Exam Title */}
                                        <table className="w-full bg-transparent mb-2">
                                            <tbody>
                                                <tr>
                                                    <th className="text-center w-full uppercase text-lg border-none">
                                                        <span>{examName} REPORT CARD {report.Accdemic || ''}</span>
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Student Details */}
                                        <table className="w-full border-collapse border border-gray-400 mb-2 bg-transparent text-sm">
                                            <tbody>
                                                <tr>
                                                    <td className="w-1/4 p-2 border border-gray-400 border-r-0 border-b-0 border-t-0 align-top">
                                                        <div className="flex gap-2 mb-1">
                                                            <span className="font-bold">NAME :</span>
                                                            <span className="font-bold">{report.studentname}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="font-bold">CLASS :</span>
                                                            <span className="font-bold">{report.classname || params.classs}-{report.sectionname || params.clasection}</span>
                                                        </div>
                                                    </td>
                                                    <td className="w-1/4 p-2 text-center border-none align-middle">
                                                        <b>NO. IN CLASS: <span>{studentDetails.length}</span></b>
                                                    </td>
                                                    <td className="w-1/4 p-2 text-center border-none align-middle">
                                                        <b>ATTENDANCE: <span>{getAttendance(report.AMST_Id || report.amsT_Id).toFixed(0)}%</span></b>
                                                    </td>
                                                    <td className="w-1/4 p-2 text-right border-none align-middle pr-4">
                                                        <b>STUDENT&apos;S ID: {report.admno}</b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th colSpan={4} className="text-center text-[13px] border border-gray-400 border-l-0 border-r-0 pt-2 font-bold uppercase">
                                                        STATEMENT OF MARKS
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Marks Table */}
                                        <table className="w-full border-collapse border border-gray-400 text-[12px] bg-transparent">
                                            <thead>
                                                <tr className="border-[0.5px] border-gray-500">
                                                    <th className="border-[0.5px] border-gray-500 text-[13px] w-[250px] p-1">SUBJECTS</th>
                                                    {groupDetails.map((grp: any, i: number) => (
                                                        <th key={i} colSpan={grp.groupewiseexam?.length || grp.exams?.length || 0} className="border-[0.5px] border-gray-500 text-[13px] p-1 uppercase">
                                                            {grp.empG_DistplayName || grp.displayName}
                                                        </th>
                                                    ))}
                                                    <th colSpan={groupDetails.length + 1} className="border-[0.5px] border-gray-500 text-[13px] p-1 uppercase">
                                                        SUPER AVERAGE
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className="border-[0.5px] border-gray-500 p-1"></th>
                                                    {groupWiseExamList.map((exa: any, i: number) => (
                                                        <th key={i} className="border-[0.5px] border-gray-500 text-[13px] w-[70px] p-1 text-center font-normal">
                                                            {/* Logic for showing Max Marks or Exam Name */}
                                                            {exa.examnamedisplay !== 'Total' && exa.examnamedisplay !== 'AVG' && (
                                                                <span>{exa.EMPSGE_ForMaxMarkrs || exa.maxMarks}</span>
                                                            )}
                                                            {exa.examnamedisplay === 'Total' && exa.examnamedisplay !== 'AVG' && exa.examnamedisplay !== 'Marks Obtained' && (
                                                                <span>{exa.EMPSGE_ForMaxMarkrs || exa.maxMarks}/50</span>
                                                            )}
                                                            {exa.examnamedisplay === 'AVG' && exa.examnamedisplay !== 'Total' && exa.examnamedisplay !== 'Marks Obtained' && (
                                                                <span>{exa.examnamedisplay}</span>
                                                            )}
                                                        </th>
                                                    ))}
                                                    <th className="border-[0.5px] border-gray-500 text-[13px] w-[70px] p-1 text-center">100/50</th>
                                                    <th className="border-[0.5px] border-gray-500 text-[13px] w-[70px] p-1 text-center"><b>AVG</b></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* App Subjects */}
                                                {appSubjects.map((subj: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className="border-[0.5px] border-gray-500 p-1 pl-2 text-left">
                                                            {subj.ESTMPPSG_GroupAVGMarks > 0 ? (
                                                                <span className="font-semibold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.ISMS_SubjectName}</span>
                                                            ) : (
                                                                <span className="font-normal">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.ISMS_SubjectName}</span>
                                                            )}
                                                        </td>
                                                        {groupWiseExamList.map((exa: any, j: number) => {
                                                            const grpDisplayName = exa.EMPG_DistplayName || exa.group?.displayName; // Ensure this exists in groupWiseExamList usually
                                                            // Note: groupWiseExamList in Angular seems to be a flat list of all columns across all groups

                                                            const val = getMarkValue(report, subj.ISMS_Id, exa.EME_Id, grpDisplayName, exa.examnamedisplay || exa.EME_ExamName);
                                                            return (
                                                                <td key={j} className="border-[0.5px] border-gray-500 p-1 text-center w-[50px]">
                                                                    {val}
                                                                </td>
                                                            )
                                                        })}
                                                        {/* Super Average Columns */}
                                                        <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                            {(subj.ISMS_Id < 1000 && showSuperAverage) && (
                                                                <span>{subj.ESTMPPSG_GroupObtMarks}</span>
                                                            )}
                                                        </td>
                                                        <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                            {((subj.ESG_Id === 0 || subj.ISMS_Id > 1000) && showSuperAverage) && (
                                                                <span className="font-semibold">{subj.ESTMPPSG_GroupAVGMarks}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Total Row */}
                                                <tr>
                                                    <td className="border-[0.5px] border-gray-500 p-1 text-left font-semibold">
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TOTAL
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        // Only show totals for 'Marks Obtained' (9800000) and 'AVG' (9800001) exams usually
                                                        const isTotalExam = exa.EME_Id === 9800000;
                                                        const isAvgExam = exa.EME_Id === 9800001;
                                                        const grpDisplayName = exa.EMPG_DistplayName || exa.group?.displayName;

                                                        let val = null;
                                                        if (isTotalExam || isAvgExam) {
                                                            const mVal = getTotalMarkValue(report, exa.EME_Id, grpDisplayName);
                                                            if (mVal !== null) val = <span className="font-bold">{Number(mVal).toFixed(0)}</span>;
                                                        }

                                                        return (
                                                            <td key={i} className="border-[0.5px] border-gray-500 p-1 text-center">
                                                                {val}
                                                            </td>
                                                        )
                                                    })}
                                                    {/* Super Average Totals */}
                                                    <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                        {showSuperAverage && (
                                                            <span className="font-bold">
                                                                {(examWiseTotalDetails.find((t: any) => t.AMST_Id === report.AMST_Id) || {}).ESTMPPSG_GroupObtMarks}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                        {showSuperAverage && (
                                                            <span className="font-bold">
                                                                {(examWiseTotalDetails.find((t: any) => t.AMST_Id === report.AMST_Id) || {}).ESTMPPSG_GroupAVGMarks}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Percentage Row */}
                                                <tr>
                                                    <td className="border-[0.5px] border-gray-500 p-1 text-left font-semibold">
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PERCENTAGE
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const isTotalExam = exa.EME_Id === 9800000;
                                                        const isAvgExam = exa.EME_Id === 9800001;
                                                        const grpDisplayName = exa.EMPG_DistplayName || exa.group?.displayName;

                                                        let val = null;
                                                        if (isTotalExam || isAvgExam) {
                                                            const pVal = getTotalPercentageValue(report, exa.EME_Id, grpDisplayName);
                                                            if (pVal !== null) val = <span className="font-bold">{Number(pVal).toFixed(0)}</span>;
                                                        }

                                                        return (
                                                            <td key={i} className="border-[0.5px] border-gray-500 p-1 text-center">
                                                                {val}
                                                            </td>
                                                        )
                                                    })}
                                                    <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                        {showSuperAverage && (
                                                            <span className="font-bold">
                                                                {(examWiseTotalDetails.find((t: any) => t.AMST_Id === report.AMST_Id) || {}).TotalPercentage}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                        {showSuperAverage && (
                                                            <span className="font-bold">
                                                                {(examWiseTotalDetails.find((t: any) => t.AMST_Id === report.AMST_Id) || {}).totaver}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Rank Row */}
                                                <tr>
                                                    <td className="border-[0.5px] border-gray-500 p-1 text-left font-semibold">
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RANK
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const isTotalExam = exa.EME_Id === 9800000;
                                                        const grpDisplayName = exa.EMPG_DistplayName || exa.group?.displayName;

                                                        let val = null;
                                                        if (isTotalExam) {
                                                            const rVal = getRankValue(report, exa.EME_Id, grpDisplayName);
                                                            if (rVal !== null) val = <span className="font-bold">{rVal}</span>;
                                                        }

                                                        return (
                                                            <td key={i} className="border-[0.5px] border-gray-500 p-1 text-center">
                                                                {val}
                                                            </td>
                                                        )
                                                    })}
                                                    <td colSpan={2} className="border-[0.5px] border-gray-500 p-1 text-center"></td>
                                                </tr>

                                                {/* Non-App Subjects */}
                                                {nonAppSubjects.map((subj: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className="border-[0.5px] border-gray-500 p-1 pl-2 text-left text-[12px]">{subj.ISMS_SubjectName}</td>
                                                        {groupWiseExamList.map((exa: any, j: number) => {
                                                            const grpDisplayName = exa.EMPG_DistplayName || exa.group?.displayName;
                                                            // Logic for non-app subjects is slightly different in Angular:
                                                            // It iterates report.studentmarks again. I'll use the same getMarkValue helper but logic might vary check 'mrks.PassFailFlag'
                                                            const val = getMarkValue(report, subj.ISMS_Id, exa.EME_Id, grpDisplayName, exa.examnamedisplay || exa.EME_ExamName);
                                                            return (
                                                                <td key={j} className="border-[0.5px] border-gray-500 p-1 text-center w-[50px]">
                                                                    {val}
                                                                </td>
                                                            )
                                                        })}
                                                        <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                            {showSuperAverage && <span className="font-bold">{subj.ESTMPPSG_GroupObtMarks}</span>}
                                                        </td>
                                                        <td className="border-[0.5px] border-gray-500 p-1 text-center">
                                                            {showSuperAverage && <span className="font-bold">{subj.ESTMPPSG_GroupObtGrade}</span>}
                                                        </td>
                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>

                                        {/* Bottom Section: Co-Scholastic & Personality */}
                                        <div className="flex border-[0.5px] border-gray-500 border-t-0">

                                            {/* Left Column: Graded Subjects & Personality - Wait, Angular puts Table LEFT: Co-Scholastic? No.
                                                Angular: Table 1 (Graded Subjects), Table 2 (Personality) are in col-sm-7.
                                                Chart is in col-sm-5.
                                            */}
                                            <div className="w-[60%] border-r-[0.5px] border-gray-500">
                                                {/* Graded Subjects */}
                                                <table className="w-full text-[13px] bg-transparent">
                                                    <thead>
                                                        <tr>
                                                            <th className="border-[0.5px] border-gray-500 border-t-0 border-l-0 w-[180px] p-1 text-left">GRADED SUBJECTS</th>
                                                            <th className="border-[0.5px] border-gray-500 border-t-0 w-[70px] p-1 text-center">HALF YEARLY</th>
                                                            <th className="border-[0.5px] border-gray-500 border-t-0 border-r-0 w-[70px] p-1 text-center">FINAL</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {skillDetails.map((skill: any, i: number) => (
                                                            <tr key={i} className="border-b-[0.5px] border-gray-500 last:border-b-0">
                                                                <td className="border-r-[0.5px] border-gray-500 p-1 pl-4 text-left font-normal text-[13px]">&nbsp;&nbsp;&nbsp;{skill.ECACT_SkillName}</td>
                                                                {/* Mapping Grades for this skill */}
                                                                {/* Assuming 2 terms? Angular iterates `getallgrade` matching skill ID */}
                                                                <td className="border-r-[0.5px] border-gray-500 p-1 text-center text-[11px]">
                                                                    {/* Half Yearly Logic - Needs data structure verification. Assuming first match is HY? or filtered? */}
                                                                    {/* Angular does: ng-repeat cce in getallgrade. if cce.ECACT_Id == ccce.ECACT_Id. Show EMGD_Name. */}
                                                                    {/* It renders multiple TDs in Angular. Here strict columns. */}
                                                                    {(gradeDetails.find((g: any) => g.AMST_Id === report.AMST_Id && g.ECACT_Id === skill.ECACT_Id && g.ECSACTT_Score > 0 /* Add term logic if needed */) || {}).EMGD_Name}
                                                                </td>
                                                                <td className="p-1 text-center text-[11px]">
                                                                    {/* Final Logic - Placeholder or second item */}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                                {/* Personality Profile */}
                                                <table className="w-full text-[13px] bg-transparent mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th className="border-[0.5px] border-gray-500 border-l-0 p-1 text-left text-[10px] font-medium">&nbsp;&nbsp;&nbsp;PERSONALITY PROFILE</th>
                                                            <th className="border-[0.5px] border-gray-500 p-1 text-center w-[70px]">HALF YEARLY</th>
                                                            <th className="border-[0.5px] border-gray-500 border-r-0 p-1 text-center w-[70px]">FINAL</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {personalityQuestions.map((q, idx) => (
                                                            <tr key={idx} className="border-b-[0.5px] border-gray-500 last:border-b-0">
                                                                <td className="border-r-[0.5px] border-gray-500 p-0.5 pl-2 text-left text-[11px]">&middot; &nbsp;{q}</td>
                                                                <td className="border-r-[0.5px] border-gray-500 p-0.5 text-center"><input type="checkbox" className="w-3 h-3" /></td>
                                                                <td className="p-0.5 text-center"><input type="checkbox" className="w-3 h-3" /></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Right Column: Chart */}
                                            <div className="w-[40%] p-2">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-[13px] border-[0.5px] border-gray-500 border-r-0 border-t-0 border-l-0 text-center pb-2">PERFORMANCE ANALYSIS(TOTAL)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="pt-4 flex justify-center h-[252px]">
                                                                {/* Using a Pie Chart as seen in Angular logic (pieChart id) - wait angular has "pieChart" but also "bar"? angular says "pieChart" 
                                                                    Data sources needed.
                                                                 */}
                                                                <div className="relative w-[250px] h-[250px]">
                                                                    {/* Placeholder Chart */}
                                                                    <Pie
                                                                        data={{
                                                                            labels: ['English', 'Maths', 'Science', 'Social', 'Hindi'], // Mock
                                                                            datasets: [{
                                                                                data: [80, 75, 90, 85, 88], // Mock
                                                                                backgroundColor: [
                                                                                    'rgba(255, 99, 132, 0.6)',
                                                                                    'rgba(54, 162, 235, 0.6)',
                                                                                    'rgba(255, 206, 86, 0.6)',
                                                                                    'rgba(75, 192, 192, 0.6)',
                                                                                    'rgba(153, 102, 255, 0.6)',
                                                                                ]
                                                                            }]
                                                                        }}
                                                                        options={{ responsive: true, maintainAspectRatio: false }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Remarks */}
                                        <table className="w-full border-collapse border border-gray-400 border-t-0 text-[12px] bg-transparent">
                                            <tbody>
                                                <tr>
                                                    <td className="w-[183px] p-2 border-r-0 font-bold align-top h-[70px]">REMARKS :</td>
                                                    <td className="p-2 border-l-0 align-top">
                                                        {remarks.map((r: any, idx: number) => (
                                                            <span key={idx} className="block">{r.remarks}</span>
                                                        ))}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Signatures */}
                                        <table className="w-full border-collapse border border-gray-400 border-t-0 text-[12px] bg-transparent">
                                            <thead>
                                                <tr>
                                                    <th className="border border-gray-400 border-t-0 p-2 h-[70px] align-bottom w-1/4">DATE</th>
                                                    <th className="border border-gray-400 border-t-0 p-2 h-[70px] align-bottom w-1/4">PRINCIPAL&apos;S SIGNATURE</th>
                                                    <th className="border border-gray-400 border-t-0 p-2 h-[70px] align-bottom w-1/4">CLASS TEACHER&apos;S SIGNATURE</th>
                                                    <th className="border border-gray-400 border-t-0 p-2 h-[70px] align-bottom w-1/4">PARENT&apos;S SIGNATURE</th>
                                                </tr>
                                            </thead>
                                        </table>

                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center p-10 text-gray-500">
                        No student details found to display report.
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .print-area {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break-before-always {
                        page-break-before: always !important;
                    }
                }
            `}</style>
        </div>
    );
};
