'use client';

import { Button } from '@/components/ui/button';
import { Printer, RefreshCcw } from 'lucide-react';
import { useRef, useMemo } from 'react';
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
    performanceAnalysis: boolean;
    generatedDate?: Date;
}

export const ReportList = ({ data, academicYear, performanceAnalysis, generatedDate }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        getstudentmarksdetails = [],
        gettermdetails = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseactiviteslist = [],
        work_attendence = [],
        present_attendence = [],
        getpromotionremarksdetails = [],
        getinstitution = [],
    } = data;

    // Transformation Logic (Exact Parity with legacy JS)
    const { processedReports, groupwiseexamlist } = useMemo(() => {
        const fullGroupWiseExamList: any[] = [];
        
        getgroupdetails.forEach((grp: any) => {
            const tempExams: any[] = [];
            let counttotal = 0;
            getgroupexamdetails.forEach((d: any) => {
                if (grp.empG_DistplayName === d.empG_DistplayName) {
                    counttotal += d.empsgE_ForMaxMarkrs;
                    const exam = {
                        EMPG_GroupName: d.empG_GroupName,
                        EME_Id: d.emE_Id,
                        EME_ExamName: d.emE_ExamName,
                        EME_ExamOrder: d.emE_ExamOrder,
                        EMPG_DistplayName: d.empG_DistplayName,
                        EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                        examnamedisplay: d.emE_ExamCode
                    };
                    tempExams.push(exam);
                    fullGroupWiseExamList.push(exam);
                }
            });
            grp.empsG_MarksValue = counttotal;
            grp.groupewiseexam = tempExams;
        });

        // Add Total and Grade columns at the end of the global list
        fullGroupWiseExamList.push({
            EME_Id: 9800000,
            EMPG_DistplayName: "Total",
            EME_ExamName: "Total",
            EME_Marks: "Total"
        });
        fullGroupWiseExamList.push({
            EME_Id: 9800001,
            EMPG_DistplayName: "Grade",
            EME_ExamName: "Grade",
            EME_Marks: "Grade"
        });

        const reports = getstudentdetails.map((stu: any) => {
            const studentId = stu.AMST_Id || stu.amsT_Id;

            // Student Wise Subject List
            const studentsubjects = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);
            
            // Student Wise Discipline List (Main Areas)
            const activity_main_list_area: any[] = [];
            getstudentwiseactiviteslist.forEach((act: any) => {
                if ((act.AMST_Id || act.amsT_Id) === studentId) {
                    if (!activity_main_list_area.some(a => (a.ECACT_SkillName || a.ecacT_SkillName) === (act.ECACT_SkillName || act.ecacT_SkillName))) {
                        activity_main_list_area.push({ 
                            ECACT_SkillName: act.ECACT_SkillName || act.ecacT_SkillName, 
                            ECACT_Id: act.ECACT_Id || act.ecacT_Id
                        });
                    }
                }
            });

            // Student Wise Skills/Sub-Activities
            const activity_main_list: any[] = [];
            getstudentwiseactiviteslist.forEach((act: any) => {
                if ((act.AMST_Id || act.amsT_Id) === studentId) {
                    const skillArea = act.ECACTA_SkillArea || act.ecactA_SkillArea;
                    if (skillArea && !activity_main_list.some(a => a.ECACTA_SkillArea === skillArea)) {
                        activity_main_list.push({ 
                            ECACTA_SkillArea: skillArea, 
                            ECACT_Id: act.ECACT_Id || act.ecacT_Id,
                            activity_score_details: []
                        });
                    }
                }
            });

            // Populate scores
            activity_main_list.forEach((act: any) => {
                const scores: any[] = [];
                gettermdetails.forEach((term: any) => {
                    getstudentwiseactiviteslist.forEach((dd: any) => {
                        const ddStudentId = dd.AMST_Id || dd.amsT_Id;
                        const ddSkillArea = dd.ECACTA_SkillArea || dd.ecactA_SkillArea;
                        const ddTermId = dd.ECT_Id || dd.ecT_Id;
                        const termId = term.ecT_Id || term.ECT_Id;

                        if (ddStudentId === studentId && act.ECACTA_SkillArea === ddSkillArea && termId === ddTermId) {
                            scores.push({ EMGD_Name: dd.EMGD_Name || dd.emgD_Name, ecT_Id: ddTermId });
                        }
                    });
                });
                act.activity_score_details = scores;
            });

            // Marks
            const studentmarks = getstudentmarksdetails.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);
            
            // Remarks
            const promo = getpromotionremarksdetails.find((d: any) => (d.AMST_Id || d.amsT_Id) === studentId);
            
            return {
                ...stu,
                studentsubjects,
                activity_main_list_area,
                activity_main_list,
                studentmarks,
                remarks: promo?.eprD_Remarks || promo?.EPRD_Remarks || '',
                promotedclass: promo?.eprD_ClassPromoted || promo?.EPRD_ClassPromoted || '',
                workAttendance: work_attendence.find((a: any) => (a.AMST_Id || a.amsT_Id) === studentId),
                presentAttendance: present_attendence.find((a: any) => (a.AMST_Id || a.amsT_Id) === studentId)
            };
        });

        return { processedReports: reports, groupwiseexamlist: fullGroupWiseExamList };
    }, [data]);

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=1100,height=850');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>Progress Card Report</title>
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/PrintPdf_Bootstrap.css">
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/printpdf.css">
                        <style>
                            @page { size: portrait; margin: 10mm; }
                            body { font-family: sans-serif !important; font-size: 13px; color: black; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .pagelayout { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px; page-break-after: always; background: white; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td { border: 1px solid black !important; }
                            .bg-gray { background-color: #BABABA !important; }
                            .margin-top-10 { margin-top: 10px; }
                            .margin-top-20 { margin-top: 20px; }
                            .margin-top-50 { margin-top: 50px; }
                            .margin-top-80 { margin-top: 80px; }
                            table { width: 100%; border-collapse: collapse; }
                            td, th { padding: 4px; }
                            .grade-table th, .grade-table td { text-align: center; }
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
                .pagelayout { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px; background: white; max-width: 1000px; margin-left: auto; margin-right: auto; font-family: sans-serif; }
                .table-bordered td, .table-bordered th { border: 1px solid black !important; padding: 5px; }
                .bg-gray { background-color: #BABABA !important; color: black !important; }
                .photo-img { border: 1px solid black !important; margin-left: 72%; margin-top: -160px; position: relative; z-index: 10; }
                @media print {
                    .no-print { display: none; }
                }
            `}</style>

            <div className="flex justify-end no-print gap-4">
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 shadow-lg">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>

            <div ref={printRef} id="HHS02" className="bg-gray-100 p-4">
                {processedReports.map((report: any, index: number) => {
                    // Chart 1: Student Performance Index (Class Avg vs Student Score)
                    const chartData1 = {
                        labels: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg).map((s: any) => s.ISMS_SubjectName || s.ismS_SubjectName),
                        datasets: [
                            {
                                label: 'Class Average',
                                data: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg).map((s: any) => s.ESTMPPS_ClassAverage || 0),
                                backgroundColor: '#FF5733',
                                borderColor: 'black',
                                borderWidth: 1,
                                barPercentage: 0.2,
                                categoryPercentage: 0.5
                            },
                            {
                                label: 'Student Score',
                                data: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg).map((s: any) => s.ESTMPPS_ObtainedMarks || 0),
                                backgroundColor: '#00c1e4',
                                borderColor: 'black',
                                borderWidth: 1,
                                barPercentage: 0.2,
                                categoryPercentage: 0.5
                            }
                        ]
                    };

                    // Chart 2: Student Performance Analysis (Section Avg vs Student Score)
                    const chartData2 = {
                        labels: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg).map((s: any) => s.ISMS_SubjectName || s.ismS_SubjectName),
                        datasets: [
                            {
                                label: 'Section Average',
                                data: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg).map((s: any) => s.ESTMPPS_SectionAverage || 0),
                                backgroundColor: '#1cc405',
                                borderColor: 'black',
                                borderWidth: 1,
                                barPercentage: 0.2,
                                categoryPercentage: 0.5
                            },
                            {
                                label: 'Student Score',
                                data: report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg).map((s: any) => s.ESTMPPS_ObtainedMarks || 0),
                                backgroundColor: '#770396',
                                borderColor: 'black',
                                borderWidth: 1,
                                barPercentage: 0.2,
                                categoryPercentage: 0.5
                            }
                        ]
                    };

                    return (
                        <div key={index} id={`std_${report.AMST_Id || report.amsT_Id}`}>
                            <div className="pagelayout" style={{ pageBreakBefore: 'always' }}>
                                {/* Header */}
                                <div className="row margin-top-5">
                                    <table align="center" className="w-full">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <img src="https://vapsclg.blob.core.windows.net/files/3/InstitutionLogo/6ef102c1-0117-446e-93fa-9b6d9cad9fda.jpg" className="w-full" alt="Header Banner" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row">
                                    <h3 className="text-center text-xl font-bold">ACHIEVEMENT RECORD {academicYear}</h3>
                                </div>

                                {/* Student Profile */}
                                <div className="mt-4 space-y-1">
                                    {[
                                        { label: 'Name of the student', value: report.studentname || report.studentName },
                                        { label: 'Admission number', value: report.admno || report.admissionNo },
                                        { label: 'Class & Section', value: `${report.classname || ''} ${report.sectionname || ''}` },
                                        { label: 'Date of birth', value: report.dob },
                                        { label: 'Mother\'s name', value: report.mothername || report.motherName },
                                        { label: 'Father\'s name', value: report.fathername || report.fatherName },
                                    ].map((item, i) => (
                                        <div key={i} className="flex text-sm font-bold ml-[5%]">
                                            <div className="w-48">{item.label}</div>
                                            <div className="w-4 text-center">:</div>
                                            <div>{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Photo */}
                                <img src={report.AMST_Photoname || report.photoName || report.AMST_PhotoName} height="150" width="150" className="photo-img" alt="Student Photo" />

                                {/* Scholastic Report */}
                                <div className="mt-4">
                                    <h3 className="text-center font-bold text-lg mb-4">SCHOLASTIC REPORT</h3>
                                    <table className="table-bordered w-full text-[13px]">
                                        <thead>
                                            <tr className="bg-gray">
                                                <th className="text-left"><b>SUBJECT</b></th>
                                                {getgroupdetails.map((grp: any, i: number) => (
                                                    <th key={i} className="text-center" colSpan={groupwiseexamlist.length}>
                                                        <strong>{grp.empG_GroupName}</strong>
                                                    </th>
                                                ))}
                                            </tr>
                                            <tr className="bg-gray">
                                                <th className="text-left"><b>&nbsp;</b></th>
                                                {groupwiseexamlist.map((grpexam: any, i: number) => (
                                                    <th key={i} className="text-center">
                                                        <strong>{grpexam.EME_ExamName}</strong>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.studentsubjects.filter((s: any) => s.EMPS_AppToResultFlg || s.empS_AppToResultFlg).map((subj: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className="text-left font-normal">{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>
                                                    {groupwiseexamlist.map((grpexam: any, idx: number) => {
                                                        const mrks = report.studentmarks.find((m: any) => 
                                                            (subj.ISMS_Id || subj.ismS_Id) === (m.ISMS_Id || m.ismS_Id) && 
                                                            (grpexam.EME_Id || grpexam.emE_Id) === (m.EME_Id || m.emE_Id)
                                                        );
                                                        
                                                        if (!mrks) return <td key={idx} className="text-center"></td>;

                                                        return (
                                                            <td key={idx} className="text-center">
                                                                {['AB', 'M', 'L'].includes(mrks.PassFailFlag || mrks.passFailFlag) ? (
                                                                    <span>{mrks.PassFailFlag || mrks.passFailFlag}</span>
                                                                ) : grpexam.EME_Marks === 'Grade' || grpexam.EME_Id === 9800001 ? (
                                                                    <span>{mrks.ObtainedGrade || mrks.obtainedGrade}</span>
                                                                ) : (
                                                                    <span>{mrks.ObtainedMarks || mrks.obtainedMarks}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Grading Scale */}
                                <div className="mt-4">
                                    <h3 className="font-bold underline text-md uppercase">SCHOLASTIC GRADING SCALE</h3>
                                    <table className="table-bordered w-full text-sm grade-table">
                                        <thead>
                                            <tr className="bg-gray">
                                                <th className="text-center">Grade</th>
                                                <th>A1</th><th>A2</th><th>B1</th><th>B2</th><th>C1</th><th>C2</th><th>D</th><th>E</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="bg-gray font-bold">Mark</td>
                                                <td>91-100</td><td>81-90</td><td>71-80</td><td>61-70</td><td>51-60</td><td>41-50</td><td>33-40</td><td>0-32</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Chart 1: Performance Index */}
                                <div className="mt-6 flex flex-col items-center">
                                    <h4 className="text-center font-bold">STUDENT PERFORMANCE INDEX</h4>
                                    <div className="w-[500px] h-[300px]">
                                        <Bar 
                                            data={chartData1}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { position: 'top' } },
                                                scales: {
                                                    y: { beginAtZero: true },
                                                    x: { ticks: { maxRotation: 0, minRotation: 0 } }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Activities and Second Graph */}
                                <div className="grid grid-cols-2 mt-8 gap-4 items-start">
                                    <div>
                                        {report.activity_main_list_area.map((acti: any, idx: number) => (
                                            <div key={idx} className="mb-4">
                                                <h4 className="text-center font-bold mb-2">{acti.ECACT_SkillName}</h4>
                                                <table className="table-bordered w-full text-[13px]">
                                                    <thead>
                                                        <tr className="bg-gray">
                                                            <th className="text-left">Particulars</th>
                                                            {gettermdetails.map((cos: any, cidx: number) => (
                                                                <th key={cidx} className="text-center">{cos.ecT_TermName}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {report.activity_main_list
                                                            .filter((subjco: any) => acti.ECACT_Id === subjco.ECACT_Id)
                                                            .map((subjco: any, sidx: number) => (
                                                                <tr key={sidx}>
                                                                    <td className="text-left font-bold">{subjco.ECACTA_SkillArea}</td>
                                                                    {gettermdetails.map((cos: any, cidx: number) => (
                                                                        <td key={cidx} className="text-center">
                                                                            {subjco.activity_score_details
                                                                                .filter((sc: any) => cos.ecT_Id === sc.ecT_Id)
                                                                                .map((sc: any, scIdx: number) => (
                                                                                    <b key={scIdx}>{sc.EMGD_Name}</b>
                                                                                ))}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <h4 className="text-center font-bold">STUDENT PERFORMANCE ANALYSIS</h4>
                                        <div className="w-[350px] h-[350px]">
                                            <Bar 
                                                data={chartData2}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { position: 'top' } },
                                                    scales: {
                                                        y: { beginAtZero: true },
                                                        x: { ticks: { maxRotation: 0, minRotation: 0 } }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Health Status */}
                                <div className="mt-8">
                                    <h4 className="text-center font-bold underline mb-2 uppercase">HEALTH STATUS</h4>
                                    <table className="table-bordered w-full text-center text-sm">
                                        <thead>
                                            <tr className="bg-gray">
                                                <th>Height (in cm)</th>
                                                <th>Weight (in kg)</th>
                                                <th>Blood Group</th>
                                                <th>Dental Hygiene</th>
                                                <th>Vision</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="font-bold">{report.AMST_height || report.AMST_Height || ''}</td>
                                                <td className="font-bold">{report.AMST_Weight || ''}</td>
                                                <td className="font-bold">{report.AMST_BloodGroup || ''}</td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance Details */}
                                <div className="mt-8">
                                    <h3 className="text-center font-bold underline mb-2 uppercase">ATTENDANCE DETAILS</h3>
                                    <table className="table-bordered w-full text-center text-sm grade-table">
                                        <tbody>
                                            <tr>
                                                <th className="bg-gray">Total number of working days</th>
                                                <td className="w-24 font-bold">{report.workAttendance?.TotalSchoolDays || ''}</td>
                                                <th className="bg-gray">Number of days attended</th>
                                                <td className="w-24 font-bold">{report.workAttendance?.Total_Percentage || ''}</td>
                                                <th className="bg-gray">Attendance Percentage</th>
                                                <td className="w-24 font-bold">{report.presentAttendance?.Total_Percentage || ''}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks & Result */}
                                <div className="mt-8 grid grid-cols-1 gap-4">
                                    <table className="table-bordered w-full text-left text-sm grade-table">
                                        <tbody>
                                            <tr>
                                                <th className="bg-gray w-48 uppercase">REMARKS</th>
                                                <th className="font-bold">pass</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table className="table-bordered w-full text-left text-sm grade-table">
                                        <tbody>
                                            <tr>
                                                <th className="bg-gray w-48 uppercase">RESULT</th>
                                                <th className="font-bold">{report.ESTMP_Result}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures */}
                                <div className="mt-16">
                                    <div className="grid grid-cols-3 w-full text-center font-bold">
                                        <div>Principal’s Signature</div>
                                        <div>Institution Seal</div>
                                        <div>Class Teacher’s Signature</div>
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
