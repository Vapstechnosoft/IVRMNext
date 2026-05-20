'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef, useMemo, useEffect } from 'react';
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
    academicYear: string;
}

const months = [
    'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April'
];

const monthDisplay = [
    'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'
];

export const ReportList = ({ data, academicYear }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        getstudentmarksdetails = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseskillslist = [],
        work_attendence = [],
        present_attendence = [],
        getinstitution = [],
        clstchname = []
    } = data;

    const inst = getinstitution[0] || {};

    // Transformation Logic (Parity with AngularJS)
    const { processedReports, groupwiseexamlistNew, groupwiseexamlist } = useMemo(() => {
        // Group Wise Exam List
        const groupwiseexamlist_temp: any[] = [];
        getgroupdetails.forEach((dd: any) => {
            getgroupexamdetails.forEach((d: any) => {
                if (dd.empG_DistplayName === d.empG_DistplayName) {
                    groupwiseexamlist_temp.push({
                        EMPG_GroupName: d.empG_GroupName,
                        EME_Id: d.emE_Id,
                        EME_ExamName: d.emE_ExamName,
                        EME_ExamOrder: d.emE_ExamOrder,
                        EMPG_DistplayName: d.empG_DistplayName,
                        EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                        examnamedisplay: d.emE_ExamCode
                    });
                }
            });
        });

        const newGroupExams: any[] = [];
        groupwiseexamlist_temp.forEach((dd: any) => {
            newGroupExams.push({
                EME_Id: dd.EME_Id,
                EMPG_DistplayName: dd.EMPG_DistplayName,
                EME_ExamName: dd.EME_ExamName,
                EME_Marks: "Marks"
            });
            newGroupExams.push({
                EME_Id: dd.EME_Id,
                EMPG_DistplayName: dd.EMPG_DistplayName,
                EME_ExamName: dd.EME_ExamName,
                EME_Marks: "Grade"
            });
        });

        // Unique Skills List
        const uniqueSkills: any[] = [];
        getstudentwiseskillslist.forEach((dd: any) => {
            if (!uniqueSkills.some(s => s.ECSA_Id === dd.ECSA_Id)) {
                uniqueSkills.push(dd);
            }
        });

        const reports = getstudentdetails.map((stu: any) => {
            const studentId = stu.AMST_Id || stu.amsT_Id;

            const studentsubjects = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);
            const studentmarks = getstudentmarksdetails.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);
            const getexammaxmarks = data.getexammaxmarks?.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId) || [];

            const studentwiseskills = getstudentwiseskillslist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);

            return {
                ...stu,
                studentsubjects,
                studentmarks,
                getexammaxmarks,
                uniqueSkills,
                studentwiseskills,
                workAttendance: work_attendence.find((a: any) => (a.AMST_Id || a.amsT_Id) === studentId),
                presentAttendance: present_attendence.find((a: any) => (a.AMST_Id || a.amsT_Id) === studentId)
            };
        });

        return { processedReports: reports, groupwiseexamlistNew: newGroupExams, groupwiseexamlist: groupwiseexamlist_temp };
    }, [data]);

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=1100,height=850');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>RainBow Progress Card Report</title>
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/PrintPdf_Bootstrap.css">
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/printpdf.css">
                        <style>
                            @page { size: portrait; margin: 5mm; }
                            body { font-family: sans-serif !important; font-size: 13px; color: black; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .pagelayout { border: 1px solid black !important; padding: 10px !important; margin-bottom: 20px; page-break-after: always; background: white; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .text-right { text-align: right; }
                            .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td { border: 1px solid black !important; }
                            .margin-top-5 { margin-top: 5px; }
                            .margin-top-10 { margin-top: 10px; }
                            .margin-top-80 { margin-top: 80px; }
                            table { width: 100%; border-collapse: collapse; }
                            td, th { padding: 4px; }
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

    if (processedReports.length === 0) return null;

    return (
        <div className="space-y-6">
            <style>{`
                .pagelayout { border: 1px solid black !important; padding: 10px !important; margin-bottom: 20px; background: white; max-width: 900px; margin-left: auto; margin-right: auto; font-family: sans-serif; }
                .table-bordered td, .table-bordered th { border: 1px solid black !important; }
                .Ndsreport { background-color: #c6dff7 !important; color: black; }
                @media print {
                    .no-print { display: none; }
                }
            `}</style>

            <div className="flex justify-end no-print">
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 shadow-lg">
                    <Printer className="mr-2 h-4 w-4" />
                    Print All Reports
                </Button>
            </div>

            <div ref={printRef} id="HHS02" className="bg-gray-50 p-4">
                {processedReports.map((report: any, index: number) => (
                    <div key={index} id={`std_${report.AMST_Id}`}>
                        {/* Page 1 */}
                        <div className="pagelayout" style={{ pageBreakBefore: 'always' }}>
                            <div className="row margin-top-5">
                                <table align="center" className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="text-center">
                                                <img src="https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/86db53f0-f5e5-488a-85dd-8b6d693396ad.jpg" className="w-full" alt="Header" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="row margin-top-10">
                                <div className="col-sm-12">
                                    <hr style={{ border: 0, borderTop: '1px dashed #000', margin: '20px 0' }} />
                                </div>
                                <div className="grid grid-cols-2 w-full px-4 gap-4">
                                    <div className="flex gap-2">
                                        <b className="w-20">NAME</b> : <b>{report.studentName || report.studentname}</b>
                                    </div>
                                    <div></div>
                                    <div className="flex gap-2">
                                        <b className="w-20">ROLL NO</b> : <b>{report.rollNo || report.rollno || 'N/A'}</b>
                                    </div>
                                    <div className="text-right pr-4">
                                        <b>{report.className || report.classname} &nbsp; &nbsp; {report.sectionName || report.sectionname}</b>
                                    </div>
                                </div>

                                <div className="w-full mt-4 px-2">
                                    <table className="table table-bordered table-condensed text-xs">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }} className="Ndsreport"><b>SL No</b></th>
                                                <th className="text-left Ndsreport" style={{ width: '130px' }}><b>SUBJECT</b></th>
                                                <th className="text-center Ndsreport" style={{ width: '80px' }}><b>MAX MARKS</b></th>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className="text-center" colSpan={2}>
                                                        <strong>{grpexam.EMPG_GroupName}</strong>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg !== 0).map((subj: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className="text-center">{sIdx + 1}</td>
                                                    <td className="text-left">{subj.subjectName || subj.ISMS_SubjectName}</td>
                                                    <td className="text-center">{subj.subjectMaxMarks || subj.ESTMPPS_MaxMarks}</td>
                                                    {groupwiseexamlistNew.map((grpexam: any, gnIdx: number) => (
                                                        <td key={gnIdx} className="text-center">
                                                            {report.studentmarks
                                                                .filter((mrks: any) =>
                                                                    (subj.ISMS_Id === mrks.ismS_Id || subj.ISMS_Id === mrks.ISMS_Id || (subj.subjectName === mrks.ismS_SubjectName)) &&
                                                                    grpexam.EME_Id === mrks.emE_Id &&
                                                                    (mrks.empsG_DisplayName === grpexam.EMPG_DistplayName || mrks.EMPSG_DisplayName === grpexam.EMPG_DistplayName)
                                                                )
                                                                .slice(0, 1) // Only take the first matching mark entry to avoid duplication
                                                                .map((mrks: any, mIdx: number) => (
                                                                    <div key={mIdx}>
                                                                        {grpexam.EME_Marks === 'Marks' ? (
                                                                            ['AB', 'M', 'L'].includes(mrks.passFailFlag || mrks.PassFailFlag) ? (
                                                                                <span>{mrks.passFailFlag || mrks.PassFailFlag}</span>
                                                                            ) : (
                                                                                <span>{mrks.obtainedMarks || mrks.ObtainedMarks}</span>
                                                                            )
                                                                        ) : (
                                                                            <span>{mrks.obtainedGrade || mrks.ObtainedGrade}</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tbody>
                                            <tr>
                                                <td className="Ndsreport text-right font-bold" colSpan={2}>TOTAL</td>
                                                <td className="text-center font-bold">
                                                    {report.ESTMPP_TotalMaxMarks || report.studentsubjects.reduce((acc: number, s: any) => acc + (s.subjectMaxMarks || 0), 0)}
                                                </td>
                                                {groupwiseexamlistNew.map((grpexam: any, gnIdx: number) => (
                                                    <td key={gnIdx} className="text-center font-bold">
                                                        {report.getexammaxmarks
                                                            .filter((total: any) => total.emE_Id === grpexam.EME_Id || total.EME_Id === grpexam.EME_Id || total.examId === grpexam.EME_Id)
                                                            .slice(0, 1)
                                                            .map((total: any, tIdx: number) => (
                                                                <div key={tIdx}>
                                                                    {grpexam.EME_Marks === 'Marks' ? (total.ESTMP_TotalObtMarks || total.overallObtainedMarks) : `${total.ESTMP_Percentage || total.overallPercentage} %`}
                                                                </div>
                                                            ))}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="w-full mt-4 px-2">
                                    <table className="table table-bordered table-condensed text-xs">
                                        <thead>
                                            <tr>
                                                <th className="Ndsreport" style={{ width: '40px' }}><strong>SL No</strong></th>
                                                <th className="Ndsreport text-left"><b>SUBJECT(CO-SCHOLASTIC)</b></th>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className="text-center" style={{ width: '150px' }}>
                                                        <b>{grpexam.EMPG_GroupName}</b>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg === 0).map((subj: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className="text-center">{sIdx + 1}</td>
                                                    <td className="text-left">{subj.subjectName || subj.ISMS_SubjectName}</td>
                                                    {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                        <td key={eIdx} className="text-center">
                                                            {report.studentmarks
                                                                .filter((mrks: any) =>
                                                                    (subj.ISMS_Id === mrks.ismS_Id || subj.ISMS_Id === mrks.ISMS_Id || (subj.subjectName === mrks.ismS_SubjectName)) &&
                                                                    grpexam.EME_Id === mrks.emE_Id &&
                                                                    (mrks.empsG_DisplayName === grpexam.EMPG_DistplayName || mrks.EMPSG_DisplayName === grpexam.EMPG_DistplayName)
                                                                )
                                                                .slice(0, 1)
                                                                .map((mrks: any, mIdx: number) => (
                                                                    <div key={mIdx}>
                                                                        {!['AB', 'M', 'L'].includes(mrks.passFailFlag || mrks.PassFailFlag) && <span>{mrks.obtainedGrade || mrks.ObtainedGrade}</span>}
                                                                    </div>
                                                                ))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="w-full mt-4 px-6 text-xs italic">
                                    <p><b>Note : 1) , A+:(90 to 100) ,A:(70 to 89) ,B+ : (50 to 69 ) ,B : (30 to 49) , C : (0 to 29)</b></p>
                                </div>

                                <div className="w-full mt-6 px-6">
                                    <h3 className="text-lg font-bold">Graphical View</h3>
                                    <div className="flex justify-center py-4" style={{ height: '300px' }}>
                                        <Bar
                                            data={{
                                                labels: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg !== 0).map((s: any) => s.subjectName || s.ISMS_SubjectName),
                                                datasets: [{
                                                    label: 'Percentage',
                                                    data: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg !== 0).map((s: any) => s.subjectPercentage || s.TotalPercentage),
                                                    backgroundColor: 'rgb(255, 87, 34)',
                                                    borderColor: 'black',
                                                    borderWidth: 1
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: { beginAtZero: true, max: 100 },
                                                    x: { ticks: { font: { size: 10 } } }
                                                },
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="w-full mt-6 px-2">
                                    <h3 className="text-lg font-bold px-4">ATTENDANCE</h3>
                                    <table className="table table-bordered table-condensed text-xs">
                                        <thead>
                                            <tr>
                                                <th className="text-left" colSpan={2}></th>
                                                {monthDisplay.map(m => <th key={m} className="text-center">{m}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-left font-bold" colSpan={2}>No of Working Days</td>
                                                {months.map(m => (
                                                    <td key={m} className="text-center font-bold">
                                                        {report.workAttendance?.[m] !== 0 ? report.workAttendance?.[m] : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="text-left font-bold" colSpan={2}>No of Days Present</td>
                                                {months.map(m => (
                                                    <td key={m} className="text-center font-bold">
                                                        {report.presentAttendance?.[m] !== 0 ? report.presentAttendance?.[m] : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="w-full mt-20 flex justify-between px-6 text-sm font-bold">
                                    <div>Class Teacher : {clstchname[0]?.hrmE_EmployeeFirstName || '................................'}</div>
                                    <div>Principal Signature</div>
                                </div>
                            </div>
                        </div>

                        {/* Page 2 (Skills) */}
                        {report.studentwiseskills.length > 0 && (
                            <div className="pagelayout" style={{ pageBreakBefore: 'always' }}>
                                <div className="row margin-top-5">
                                    <table align="center">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <img src="https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/86db53f0-f5e5-488a-85dd-8b6d693396ad.jpg" className="w-full" alt="Header" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row mt-8 px-4">
                                    <h2 className="text-center text-xl font-bold uppercase mb-4">NON-SCHOLASTIC AREA PERFORMANCE {academicYear}</h2>
                                    <table className="table table-bordered table-condensed text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th style={{ width: '50px' }}>Sl No</th>
                                                <th className="text-left" colSpan={3}>AREAS</th>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className="text-center">{grpexam.EME_ExamName}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.uniqueSkills.map((skill: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className="text-center">{sIdx + 1}</td>
                                                    <td className="text-left" colSpan={3}>{skill.ECSA_SkillArea}</td>
                                                    {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                        <td key={eIdx} className="text-center">
                                                            {report.studentwiseskills
                                                                .filter((sk: any) => sk.ECSA_Id === skill.ECSA_Id && sk.EME_Id === grpexam.EME_Id)
                                                                .map((sk: any, skIdx: number) => (
                                                                    <span key={skIdx}>{sk.EMGD_Name}</span>
                                                                ))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="w-full mt-20 flex justify-between px-2 text-sm font-bold">
                                        <div>Class Teacher Signature</div>
                                        <div>Principal Signature</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
