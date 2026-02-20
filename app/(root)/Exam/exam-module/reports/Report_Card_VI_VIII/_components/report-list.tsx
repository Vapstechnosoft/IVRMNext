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
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
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
    const studentDetails = data.studentDetails || data.studentdetails || [];
    const groupDetails = data.groupDetails || data.getgroupdetails || [];
    const groupWiseExamList = data.groupWiseExamList || data.groupwiseexamlist || [];
    const institution = (data.institutionList && data.institutionList[0]) || data.masterinstitution || data.institution;
    const termDetails = data.termDetails || data.gettermdetails || [];
    const gradeDetails = data.gradeDetails || data.getallgrade || []; // For Co-Scholastic grades

    // Attendance Sources
    const presentAttendance = data.presentAttendance || data.stud_present_attendence || [];
    const workAttendance = data.workAttendance || [];

    // Personality Profile Questions (Hardcoded based on screenshot/legacy)
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

    // Inject Virtual Exams (Total & AVG) if they don't exist
    if (groupDetails && groupDetails.length > 0) {
        groupDetails.forEach((grp: any) => {
            const exams = grp.exams || grp.groupewiseexam || [];

            // Calculate Total Max Marks for the group (sum of normal exams)
            const totalMaxMarks = exams.reduce((sum: number, ex: any) => {
                if (ex.isVirtual || ex.emE_Id > 9800000 || ex.examId > 9800000) return sum;
                return sum + (Number(ex.maxMarks || ex.empsgE_ForMaxMarkrs || ex.EMPSGE_ForMaxMarkrs) || 0);
            }, 0);

            // Inject Total (9800000)
            if (!exams.some((e: any) => e.emE_Id === 9800000 || e.examId === 9800000 || e.examnamedisplay === 'Total')) {
                const totalExam = {
                    emE_Id: 9800000,
                    examId: 9800000,
                    examnamedisplay: 'Total',
                    displayName: 'Total',
                    maxMarks: totalMaxMarks,
                    EMPSGE_ForMaxMarkrs: 50, // Hardcoded 50 based on screenshot "Total 50" or "Total 100" logic, adjusted dynamically usually
                    isVirtual: true
                };
                exams.push(totalExam);
            }

            // Inject AVG (9800001)
            if (!exams.some((e: any) => e.emE_Id === 9800001 || e.examId === 9800001 || e.examnamedisplay === 'AVG')) {
                const avgExam = {
                    emE_Id: 9800001,
                    examId: 9800001,
                    examnamedisplay: 'AVG',
                    displayName: 'AVG',
                    maxMarks: 100,
                    EMPSGE_ForMaxMarkrs: 100,
                    isVirtual: true
                };
                exams.push(avgExam);
            }
        });
    }

    const getAttendance = (amsT_Id: number) => {
        const presentFn = presentAttendance.find((a: any) => (a.amsT_Id === amsT_Id || a.AMST_Id === amsT_Id));
        if (presentFn) return presentFn.attendancePercentage || presentFn.total_Percentage;
        const workFn = workAttendance.find((a: any) => a.studentId === amsT_Id);
        if (workFn) return workFn.total_Percentage;
        return 0;
    };

    // Helper to get mark for a cell
    const getMarkValue = (report: any, subjectId: number, examId: number, isVirtual: boolean, examGroup: any) => {
        let displayValue = '-';
        let rawValue = 0; // For calculation

        if (isVirtual) {
            const nonVirtualExams = (examGroup?.exams || examGroup?.groupewiseexam || []).filter((e: any) => {
                const eId = e.examId || e.EME_Id || e.emE_Id;
                return !(e.isVirtual || eId > 9800000);
            });

            let totalObtained = 0;
            let totalMax = 0;
            let hasMarks = false;

            nonVirtualExams.forEach((nvEx: any) => {
                const nvExId = nvEx.examId || nvEx.EME_Id || nvEx.emE_Id;
                const markObj = (report.marks || report.studentmarks || []).find((m: any) =>
                    (m.subjectId === subjectId && m.examId === nvExId) ||
                    (m.ISMS_Id === subjectId && m.EME_Id === nvExId) ||
                    (m.ismS_Id === subjectId && m.emE_Id === nvExId)
                );

                if (markObj) {
                    const val = markObj.obtainedMarks ?? markObj.ObtainedMarks ?? markObj.marksObtained ?? markObj.MarksObtained;
                    if (val !== undefined && val !== null && !isNaN(Number(val))) {
                        totalObtained += Number(val);
                        hasMarks = true;
                    }
                }
                if (nvEx.maxMarks || nvEx.EMPSGE_ForMaxMarkrs) {
                    totalMax += Number(nvEx.maxMarks || nvEx.EMPSGE_ForMaxMarkrs);
                }
            });

            if (hasMarks) {
                // Check if it's AVG
                const examObj = (examGroup?.exams || []).find((e: any) => (e.examId === examId || e.emE_Id === examId));
                const isAvg = examObj?.examnamedisplay === 'AVG' || examObj?.displayName === 'AVG' || examId === 9800001;

                if (isAvg) {
                    if (totalMax > 0) {
                        rawValue = (totalObtained / totalMax) * 100;
                        displayValue = rawValue.toFixed(0);
                    } else {
                        displayValue = totalObtained.toString();
                        rawValue = totalObtained;
                    }
                } else {
                    displayValue = totalObtained.toString();
                    rawValue = totalObtained;
                }
            }
        } else {
            const mark = (report.marks || report.studentmarks || []).find((m: any) =>
                (m.subjectId === subjectId && m.examId === examId) ||
                (m.ISMS_Id === subjectId && m.EME_Id === examId) ||
                (m.ismS_Id === subjectId && m.emE_Id === examId)
            );

            if (mark) {
                const val = mark.obtainedMarks ?? mark.ObtainedMarks ?? mark.marksObtained ?? mark.MarksObtained ?? mark.obtainedGrade ?? mark.ObtainedGrade;
                if (val !== undefined && val !== null) {
                    displayValue = val;
                    rawValue = Number(val) || 0;
                }
            }
        }
        return { displayValue, rawValue };
    };


    return (
        <div className="space-y-6 printable-content font-serif">
            <div className="flex justify-end no-print">
                <Button onClick={handlePrint} className="flex items-center gap-2 w-fit">
                    <Printer className="w-4 h-4" /> Print Report
                </Button>
            </div>

            <div ref={printRef} className="print-area">
                {studentDetails && studentDetails.length > 0 ? (
                    studentDetails.map((report: any) => (
                        <div key={report.amsT_Id || report.AMST_Id} className="bg-white p-4 mb-8 border border-gray-300 shadow-sm print:shadow-none print:border-none print:m-0 print:p-0 page-break-after-always">

                            {/* Header */}
                            <div className="border border-blue-900 rounded-t-lg mb-2 relative">
                                <div className="absolute top-0 left-0 w-full h-8 bg-transparent border-b border-blue-900 flex items-center px-4">
                                    <h3 className="text-blue-900 font-bold uppercase text-sm">Seniors Progress Card Report</h3>
                                </div>
                                <div className="pt-10 pb-4 px-4 flex flex-row items-center justify-center gap-4">
                                    {(institution && (institution.mI_Logo || institution.logo)) && (
                                        <div className="w-full h-auto flex-shrink-0">
                                            <img src={institution.mI_Logo || institution.logo} alt="Logo" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    {/* <div className="text-center flex-grow">
                                        <h1 className="text-4xl text-blue-900 mb-2" style={{ fontFamily: '"Old English Text MT", serif' }}>
                                            {institution?.mI_Name || "St. Thomas' Church School"}
                                        </h1>
                                        <div className="text-xs space-y-1 text-gray-800">
                                            <p>(Diocese of Calcutta, CNI)</p>
                                            <p>A Christian Minority Co-Educational English Medium School under Article 30 of the Indian Constitution</p>
                                            <p>{institution?.mI_Address1}, {institution?.mI_Address2} {institution?.mI_Address3} - {institution?.mI_Pincode}</p>
                                            <p>Phone No: {institution?.mI_ContactDetails || "N/A"}</p>
                                        </div>
                                    </div> */}
                                </div>
                            </div>

                            {/* Student Info Box */}
                            <div className="border border-gray-400 mb-4">
                                <div className="grid grid-cols-2 text-xs">
                                    <div className="p-2 border-b border-gray-400 border-r">
                                        <span className="font-bold">NAME :</span> {(report.studentName || report.studentname || report.amsT_FirstName)?.toUpperCase()}
                                    </div>
                                    <div className="p-2 border-b border-gray-400 flex justify-between">
                                        <div>
                                            <span className="font-bold">CLASS :</span> {report.className || report.classname} - {report.sectionName || report.sectionname}
                                        </div>
                                        <div>
                                            <span className="font-bold">ROLL NO :</span> {report.rollNo || report.rollno}
                                        </div>
                                        <div>
                                            <span className="font-bold">ADM. NO :</span> {report.admNo || report.admno}
                                        </div>
                                    </div>
                                    <div className="p-2 border-r border-gray-400">
                                        <span className="font-bold">D.O.B :</span> {report.dob}
                                    </div>
                                    <div className="p-2 text-center">
                                        <span className="font-bold">ATTENDANCE:</span> {getAttendance(report.amsT_Id || report.AMST_Id)}%
                                    </div>
                                </div>
                            </div>

                            {/* Statement of Marks Header */}
                            <div className="text-center font-bold border border-gray-400 border-b-0 py-1 text-sm bg-gray-50">
                                STATEMENT OF MARKS
                            </div>

                            {/* Marks Table */}
                            <table className="w-full border-collapse border border-gray-400 text-[8pt]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th rowSpan={2} className="border border-gray-400 p-1 text-left w-64 pl-2">SUBJECTS</th>
                                        {groupDetails.map((grp: any, idx: number) => (
                                            <th key={idx} colSpan={grp.exams?.length || 0} className="border border-gray-400 p-1 text-center font-bold uppercase">
                                                {grp.displayName || grp.empG_DistplayName}
                                            </th>
                                        ))}
                                        <th colSpan={2} className="border border-gray-400 p-1 text-center font-bold uppercase">SUPER AVERAGE</th>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        {groupDetails.flatMap((grp: any) => grp.exams || []).map((ex: any, idx: number) => (
                                            <th key={idx} className="border border-gray-400 p-1 text-center min-w-[30px]">
                                                {ex.examnamedisplay === 'Total' ? 'Total' : ex.examnamedisplay === 'AVG' ? 'AVG' : ex.examnamedisplay}
                                                <div className="text-[7px]">({ex.maxMarks || ex.EMPSGE_ForMaxMarkrs})</div>
                                            </th>
                                        ))}
                                        <th className="border border-gray-400 p-1 text-center">100/50</th>
                                        <th className="border border-gray-400 p-1 text-center">AVG</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const subjects = report.subjects || report.studentsubjects || [];
                                        // Filter unique subjects
                                        const uniqueSubjects = subjects.filter((subj: any, index: number, self: any[]) =>
                                            index === self.findIndex((s) => (s.subjectId || s.ismS_Id) === (subj.subjectId || subj.ismS_Id))
                                        );

                                        // Render Rows
                                        return uniqueSubjects.map((subj: any, idx: number) => {
                                            const isParent = false; // Logic to detect if it's a parent subject like "ENGLISH" with no marks but kids
                                            // TODO: Verify if we can detect parent based on data. For now flat.

                                            return (
                                                <tr key={idx} className={isParent ? "font-bold bg-gray-100" : ""}>
                                                    <td className="border border-gray-400 p-1 pl-2 text-left">{subj.subjectName || subj.ismS_SubjectName}</td>
                                                    {groupDetails.flatMap((grp: any) => (grp.exams || []).map((ex: any) => ({ ...ex, group: grp }))).map((ex: any, exIdx: number) => {
                                                        const { displayValue } = getMarkValue(report, subj.subjectId || subj.ismS_Id, ex.examId || ex.emE_Id, ex.isVirtual, ex.group);
                                                        return (
                                                            <td key={exIdx} className="border border-gray-400 p-1 text-center">
                                                                {displayValue}
                                                            </td>
                                                        );
                                                    })}
                                                    {/* Super Average Placeholders - need calculation logic if data not present */}
                                                    <td className="border border-gray-400 p-1 text-center">-</td>
                                                    <td className="border border-gray-400 p-1 text-center">-</td>
                                                </tr>
                                            );
                                        });

                                    })()}

                                    {/* Footer Rows: TOTAL, PERCENTAGE, RANK */}
                                    {['TOTAL', 'PERCENTAGE', 'RANK'].map((label, rIdx) => (
                                        <tr key={label} className="font-bold">
                                            <td className="border border-gray-400 p-1 pl-2 text-left">{label}</td>
                                            {groupDetails.flatMap((grp: any) => (grp.exams || []).map((ex: any) => ({ ...ex, group: grp }))).map((ex: any, exIdx: number) => {
                                                const isTotalCol = ex.examnamedisplay === 'Total';
                                                const isAvgCol = ex.examnamedisplay === 'AVG';
                                                // Simple aggregation logic for display if data not present
                                                // Ideally these come from 'student_marks' array directly for the group
                                                // For now, placeholders or simple sum from rendered rows if needed.
                                                // The legacy code iterates 'report.student_marks' for these totals.

                                                const totalObj = (report.student_marks || []).find((m: any) =>
                                                    m.EME_Id === (ex.examId || ex.emE_Id) &&
                                                    m.EMPSG_DisplayName === (ex.group?.displayName || ex.group?.empG_DistplayName)
                                                );

                                                let val = '-';
                                                if (totalObj) {
                                                    if (label === 'TOTAL') val = totalObj.ObtainedMarks || '-';
                                                    if (label === 'PERCENTAGE') val = totalObj.TotalPercentage || '-';
                                                    if (label === 'RANK') val = totalObj.ESTMPP_SectionRank || '-';
                                                }

                                                return (
                                                    <td key={exIdx} className="border border-gray-400 p-1 text-center">
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                            <td className="border border-gray-400 p-1 text-center">-</td>
                                            <td className="border border-gray-400 p-1 text-center">-</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Co-Scholastic */}
                            {report.activities && report.activities.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-xs font-bold uppercase mb-1">CO-SCHOLASTIC / ACTIVITY AREA</h4>
                                    <table className="w-full border-collapse border border-gray-400 text-[8pt]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-400 p-1 text-left w-1/3 pl-2">Activity Area</th>
                                                {termDetails.map((term: any) => (
                                                    <th key={term.ecT_Id} className="border border-gray-400 p-1 text-center">{term.ecT_TermName}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.activities.map((act: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-400 p-1 pl-2">{act.activityArea}</td>
                                                    {termDetails.map((term: any) => (
                                                        <td key={term.ecT_Id} className="border border-gray-400 p-1 text-center">
                                                            {act.termGrades?.find((tg: any) => tg.termId === term.ecT_Id)?.grade || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Split Section: Graded + Personality | Chart */}
                            <div className="mt-4 flex gap-4">
                                <div className="w-2/3 flex flex-col gap-4">
                                    {/* Graded Subjects */}
                                    <table className="w-full border-collapse border border-gray-400 text-[8pt]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-400 p-1 text-left pl-2">GRADED SUBJECTS</th>
                                                <th className="border border-gray-400 p-1 text-center w-24">HALF YEARLY</th>
                                                <th className="border border-gray-400 p-1 text-center w-24">FINAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Hardcoded or dynamic graded subjects like Art/Handwriting */}
                                            {/* Using dummy mapping if data not explicit, usually in 'skills' or specifics */}
                                            {['ART', 'HAND WRITING'].map(sub => (
                                                <tr key={sub}>
                                                    <td className="border border-gray-400 p-1 pl-2">{sub}</td>
                                                    <td className="border border-gray-400 p-1 text-center">A</td>
                                                    <td className="border border-gray-400 p-1 text-center">B</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Personality Profile */}
                                    <table className="w-full border-collapse border border-gray-400 text-[8pt]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-400 p-1 text-left pl-2">PERSONALITY PROFILE</th>
                                                <th className="border border-gray-400 p-1 text-center w-24">HALF YEARLY</th>
                                                <th className="border border-gray-400 p-1 text-center w-24">FINAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {personalityQuestions.map((q, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-400 p-1 pl-2">• {q}</td>
                                                    <td className="border border-gray-400 p-1 text-center"><input type="checkbox" /></td>
                                                    <td className="border border-gray-400 p-1 text-center"><input type="checkbox" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="w-1/3 border border-gray-400 p-2">
                                    <h4 className="text-center font-bold text-xs mb-2">PERFORMANCE ANALYSIS(TOTAL)</h4>
                                    <div className="h-64">
                                        {/* Mock Chart Data - Should be dynamic based on subjects */}
                                        <Bar
                                            data={{
                                                labels: (report.subjects || []).slice(0, 5).map((s: any) => s.subjectName?.substring(0, 10) || "Sub"), // Simplified labels
                                                datasets: [
                                                    {
                                                        label: 'Marks Obtained',
                                                        data: [65, 59, 80, 81, 56],
                                                        backgroundColor: 'rgba(53, 162, 235, 0.8)',
                                                    },
                                                    {
                                                        label: 'Average Marks',
                                                        data: [28, 48, 40, 19, 86],
                                                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'top' as const },
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="mt-12 pt-8 border-t-0 border-gray-400 grid grid-cols-3 gap-8 text-center text-[8pt] font-bold">
                                <div>
                                    <div className="border-t border-gray-600 mx-8 pt-1">PRINCIPAL</div>
                                </div>
                                <div>
                                    <div className="border-t border-gray-600 mx-8 pt-1">CLASS TEACHER</div>
                                </div>
                                <div>
                                    <div className="border-t border-gray-600 mx-8 pt-1">PARENT / GUARDIAN</div>
                                </div>
                            </div>

                        </div>
                    ))
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
                    .page-break-after-always {
                        page-break-after: always !important;
                    }
                }
            `}</style>
        </div>
    );
};
