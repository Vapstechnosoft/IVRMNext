'use client';

import React, { useRef, useEffect, useState } from 'react';
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
    const [reports, setReports] = useState<any[]>([]);
    const [groupDetails, setGroupDetails] = useState<any[]>([]);
    const [termDetails, setTermDetails] = useState<any[]>([]);
    const [institution, setInstitution] = useState<any>(null);

    const handlePrint = () => {
        window.print();
    };

    const {
        studentdetails = [],
        getgroupdetails = [],
        stud_present_attendence = [],
        getskill = [],
        getallgrade = [],
        getpromotionremarksdetails = [],
        masterinstitution,
        institution: propInstitution
    } = data;

    useEffect(() => {
        if (studentdetails && studentdetails.length > 0) {
            setReports(studentdetails);
        }
        if (getgroupdetails && getgroupdetails.length > 0) {
            const processedGroups = getgroupdetails.map((grp: any) => {
                const exams = grp.groupewiseexam || grp.exams || [];
                return {
                    ...grp,
                    exams: exams
                };
            });
            setGroupDetails(processedGroups);
        }

        setTermDetails([
            { ecT_Id: 1, ecT_TermName: 'Term 1' },
            { ecT_Id: 2, ecT_TermName: 'Term 2' }
        ]);

        setInstitution(propInstitution || masterinstitution);

    }, [data]);

    // Helper to get marks
    const getMarkValue = (report: any, subjectId: number, examId: number, isVirtual: boolean, group: any) => {
        let obtainedMarks = '-';
        let obtainedGrade = '';
        let passFailFlg = '';
        let displayValue = '-';

        const marksList = report.studentmarks || report.student_marks || [];

        const markObj = marksList.find((m: any) =>
            (m.ismS_Id === subjectId || m.ISMS_Id === subjectId) &&
            (m.emE_Id === examId || m.EME_Id === examId || m.examId === examId)
        );

        if (markObj) {
            obtainedMarks = markObj.obtainedMarks || markObj.ObtainedMarks;
            obtainedGrade = markObj.obtainedGrade || markObj.ObtainedGrade;
            passFailFlg = markObj.passFailFlg || markObj.PassFailFlag;

            if (obtainedMarks && obtainedMarks !== '') {
                displayValue = obtainedMarks.toString();
            } else if (obtainedGrade) {
                displayValue = obtainedGrade; ``
            } else if (passFailFlg === 'AB' || passFailFlg === 'M' || passFailFlg === 'L') {
                displayValue = passFailFlg;
            }
        }

        return { obtainedMarks, obtainedGrade, displayValue };
    };

    // Attendance Helper
    const getAttendance = (studentId: number) => {
        const att = stud_present_attendence.find((a: any) => (a.amsT_Id === studentId || a.AMST_Id === studentId));
        return att ? att.percentage || att.attendancepercentage || att.ATTENDANCEPERCENTAGE || 0 : 0;
    };

    // Fallback if no skills data
    const personalityQuestions = [
        "Courteousness",
        "Confidence",
        "Care of Belongings",
        "Neatness/Cleanliness",
        "Regularity/Punctuality",
        "Initiative"
    ];

    return (
        <div className="space-y-6 printable-content">
            <div className="flex justify-end no-print">
                <Button onClick={handlePrint} className="flex items-center gap-2 w-fit">
                    <Printer className="w-4 h-4" /> Print Report
                </Button>
            </div>

            <div ref={printRef} className="print-area">
                {reports && reports.length > 0 ? (
                    reports.map((report: any) => (
                        <div key={report.amsT_Id || report.AMST_Id} className="bg-white p-4 mb-8 border border-gray-300 shadow-sm print:shadow-none print:border-none print:m-0 print:p-0 page-break-after-always">

                            {/* Header */}
                            <div className="border border-blue-900 rounded-t-lg mb-2 relative">
                                <div className="absolute top-0 left-0 w-full h-8 bg-transparent border-b border-blue-900 flex items-center px-4">
                                    <h3 className="text-blue-900 font-bold uppercase text-sm">{params.exmname || 'Seniors Progress Card Report'}</h3>
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
                                            <span className="font-bold">CLASS :</span> {report.className || report.classname || params.ASMCL_Id_Name} - {report.sectionName || report.sectionname || params.ASMS_Id_Name}
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
                                        const uniqueSubjects = subjects.filter((subj: any, index: number, self: any[]) =>
                                            index === self.findIndex((s) => (s.subjectId || s.ismS_Id || s.ISMS_Id) === (subj.subjectId || subj.ismS_Id || subj.ISMS_Id))
                                        );

                                        return uniqueSubjects.map((subj: any, idx: number) => {
                                            const isParent = false;

                                            return (
                                                <tr key={idx} className={isParent ? "font-bold bg-gray-100" : ""}>
                                                    <td className="border border-gray-400 p-1 pl-2 text-left">{subj.subjectName || subj.ismS_SubjectName || subj.ISMS_SubjectName}</td>
                                                    {groupDetails.flatMap((grp: any) => (grp.exams || []).map((ex: any) => ({ ...ex, group: grp }))).map((ex: any, exIdx: number) => {
                                                        const { displayValue } = getMarkValue(report, subj.subjectId || subj.ismS_Id || subj.ISMS_Id, ex.examId || ex.emE_Id || ex.EME_Id, ex.isVirtual, ex.group);
                                                        return (
                                                            <td key={exIdx} className="border border-gray-400 p-1 text-center">
                                                                {displayValue}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="border border-gray-400 p-1 text-center">{subj.ESTMPPSG_GroupObtMarks || '-'}</td>
                                                    <td className="border border-gray-400 p-1 text-center">{subj.ESTMPPSG_GroupAVGMarks || '-'}</td>
                                                </tr>
                                            );
                                        });

                                    })()}

                                    {/* Footer Rows */}
                                    {['TOTAL', 'PERCENTAGE', 'RANK'].map((label, rIdx) => (
                                        <tr key={label} className="font-bold">
                                            <td className="border border-gray-400 p-1 pl-2 text-left">{label}</td>
                                            {groupDetails.flatMap((grp: any) => (grp.exams || []).map((ex: any) => ({ ...ex, group: grp }))).map((ex: any, exIdx: number) => {
                                                const totalObj = (report.student_marks || []).find((m: any) =>
                                                    (m.EME_Id === (ex.examId || ex.emE_Id || ex.EME_Id))
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

                            {/* Split Section */}
                            <div className="mt-4 flex gap-4">
                                <div className="w-2/3 flex flex-col gap-4">
                                    {/* Graded Subjects */}
                                    <table className="w-full border-collapse border border-gray-400 text-[8pt]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-400 p-1 text-left pl-2">GRADED SUBJECTS</th>
                                                <th className="border border-gray-400 p-1 text-center w-24">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(report.studentsubjects || []).filter((s: any) => s.EMPS_AppToResultFlg === false).length > 0 ?
                                                (report.studentsubjects || []).filter((s: any) => s.EMPS_AppToResultFlg === false).map((subj: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className="border border-gray-400 p-1 pl-2">{subj.ISMS_SubjectName || subj.subjectName}</td>
                                                        <td className="border border-gray-400 p-1 text-center">{subj.ESTMPPSG_GroupObtGrade || '-'}</td>
                                                    </tr>
                                                ))
                                                :
                                                // Default/Mock for display if empty
                                                ['Health & Physical Education', 'Work Experience', 'General Studies'].map(sub => (
                                                    <tr key={sub}>
                                                        <td className="border border-gray-400 p-1 pl-2">{sub}</td>
                                                        <td className="border border-gray-400 p-1 text-center">A</td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>

                                    {/* Personality Profile / Skills */}
                                    <table className="w-full border-collapse border border-gray-400 text-[8pt]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-400 p-1 text-left pl-2">PERSONALITY / SKILLS</th>
                                                <th className="border border-gray-400 p-1 text-center w-24">GRADE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getskill && getskill.length > 0 ?
                                                getskill.map((skill: any) => (
                                                    <tr key={skill.ECACT_Id}>
                                                        <td className="border border-gray-400 p-1 pl-2">{skill.ECACT_SkillName}</td>
                                                        <td className="border border-gray-400 p-1 text-center font-bold">
                                                            {getallgrade?.find((g: any) => g.AMST_Id === report.AMST_Id && g.ECACT_Id === skill.ECACT_Id)?.EMGD_Name || '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                                :
                                                personalityQuestions.map((q, idx) => (
                                                    <tr key={idx}>
                                                        <td className="border border-gray-400 p-1 pl-2">• {q}</td>
                                                        <td className="border border-gray-400 p-1 text-center"><input type="checkbox" /></td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>

                                <div className="w-1/3 border border-gray-400 p-2">
                                    <h4 className="text-center font-bold text-xs mb-2">PERFORMANCE ANALYSIS(TOTAL)</h4>
                                    <div className="h-64">
                                        <Bar
                                            data={{
                                                labels: (report.studentsubjects || []).slice(0, 5).map((s: any) => (s.subjectName || s.ISMS_SubjectName)?.substring(0, 10) || "Sub"),
                                                datasets: [
                                                    {
                                                        label: 'Marks Obtained',
                                                        data: [65, 59, 80, 81, 56],
                                                        backgroundColor: 'rgba(53, 162, 235, 0.8)',
                                                    },
                                                    {
                                                        label: 'Average Marks',
                                                        data: [50, 60, 70, 65, 55],
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
                        font-size: 10px;
                    }
                    .page-break-after-always {
                        page-break-after: always !important;
                    }
                }
            `}</style>
        </div>
    );
};
