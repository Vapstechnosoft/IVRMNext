'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
    data: any;
    date: string;
    onPrint?: () => void;
}

/* ---------- Performance Chart Component ---------- */
function PerformanceChart({ studentId, chartData, onChartReady }: {
    studentId: number;
    chartData?: { subjects: string[]; marks: number[]; highest: number[]; average: number[] };
    onChartReady?: (id: number, dataUrl: string) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !chartData || chartData.subjects.length === 0) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const loadChart = async () => {
            const ChartJS = (await import('chart.js/auto')).default;

            const chart = new ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.subjects,
                    datasets: [
                        {
                            label: 'Marks Obtained',
                            data: chartData.marks,
                            backgroundColor: 'rgb(63,81,181)',
                            borderColor: 'black',
                            borderWidth: 1,
                        },
                        {
                            label: 'Average Marks',
                            data: chartData.average,
                            backgroundColor: 'rgb(255,87,34)',
                            borderColor: 'black',
                            borderWidth: 1,
                        },
                        {
                            label: 'Highest',
                            data: chartData.highest,
                            backgroundColor: 'rgb(0,255,0)',
                            borderColor: 'black',
                            borderWidth: 1,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { font: { size: 10 }, maxRotation: 25, minRotation: 25 }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { font: { size: 10 } }
                        }
                    },
                    plugins: {
                        legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } }
                    },
                    animation: {
                        duration: 1,
                        onComplete: () => {
                            if (onChartReady && canvasRef.current) {
                                onChartReady(studentId, canvasRef.current.toDataURL());
                            }
                        }
                    }
                }
            });

            return () => chart.destroy();
        };
        loadChart();
    }, [chartData, studentId, onChartReady]);

    if (!chartData || chartData.subjects.length === 0) return null;

    return (
        <div className="relative w-full h-[300px]">
            <canvas ref={canvasRef} id={`pieChart${studentId}`} className="max-w-full h-[300px]" />
        </div>
    );
}

export default function FinalNdasReportDisplay({ data, date, onPrint }: Props) {
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseskillslist = [],
        getstudentwiseactiviteslist = [],
        getstudent_examwisemarks = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        gettermdetails = [],
        getstudentwiseattendancedetails = []
    } = data;

    // Build groupwiseexamlist as in old JS
    const groupwiseexamlist: any[] = [];
    getgroupdetails.forEach((dd: any) => {
        const temp: any[] = [];
        let counttotal = 0;
        getgroupexamdetails.forEach((d: any) => {
            if (dd.empG_DistplayName === d.empG_DistplayName) {
                counttotal += d.empsgE_ForMaxMarkrs;
                temp.push({
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamName
                });
                groupwiseexamlist.push({
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamName
                });
            }
        });

        temp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: "Marks Obtained",
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total'
        });

        temp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800001,
            EME_ExamName: "Grade",
            EME_ExamOrder: 9800001,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: "Grade"
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: "Marks Obtained",
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total'
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800001,
            EME_ExamName: "Grade",
            EME_ExamOrder: 9800001,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: "Grade"
        });
        
        dd.groupewiseexam = temp;
    });

    const hiddenHeaders = [
        "Multiple Assessment",
        "Subject Enrichment Activity",
        "Portfolio",
        "Multiple Assessment2",
        "Subject Enrichment Activity2",
        "Portfolio2"
    ];

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => ({ ...prev, [id]: dataUrl }));
    }, []);

    const handlePrintClick = useCallback(() => {
        getstudentdetails.forEach((stu: any) => {
            const canvas = document.getElementById(`pieChart${stu.amsT_Id}`) as HTMLCanvasElement;
            if (canvas) {
                setChartImages((prev) => ({ ...prev, [stu.amsT_Id]: canvas.toDataURL() }));
            }
        });
        setTimeout(() => {
            if (onPrint) onPrint();
            else window.print();
        }, 300);
    }, [getstudentdetails, onPrint]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    return (
        <>
            <style jsx global>{`
                .nds-report { font-family: sans-serif; color: black; }
                .nds-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .nds-table th, .nds-table td { border: 1px solid black; padding: 5px; text-align: center; }
                .nds-text-left { text-align: left !important; }
                .nds-text-center { text-align: center !important; }
                .nds-text-right { text-align: right !important; }
                .nds-chart-image { display: none; }
                
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * { visibility: hidden; }
                    #nds-print-area, #nds-print-area * { visibility: visible; }
                    #nds-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .nds-card { page-break-after: always; border: 1px solid black !important; margin-bottom: 20px !important; }
                    .nds-chart-canvas { display: none; }
                    .nds-chart-image { display: block !important; maxWidth: 100%; height: auto; }
                }
            `}</style>

            <div className='no-print my-4 flex justify-end'>
                <Button onClick={handlePrintClick} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All
                </Button>
            </div>

            <div id='nds-print-area' className='nds-report'>
                {getstudentdetails.map((report: any) => {
                    const studentMarks = getstudentmarksdetails.filter((m: any) => m.amsT_Id === report.amsT_Id);
                    const studentSubjects = getstudentwisesubjectlist.filter((s: any) => s.amsT_Id === report.amsT_Id);
                    const studentActivities = getstudentwiseactiviteslist.filter((a: any) => a.amsT_Id === report.amsT_Id);
                    const studentAttendance = getstudentwiseattendancedetails.find((a: any) => a.amsT_Id === report.amsT_Id) || {};

                    // Chart data
                    const chartData = {
                        subjects: studentSubjects.map((s: any) => s.subjectName),
                        marks: studentSubjects.map((s: any) => s.subjectObtainedMarks || 0),
                        highest: studentSubjects.map((s: any) => s.ESTMPPS_ClassHighest || 0),
                        average: studentSubjects.map((s: any) => s.ESTMPPS_ClassAverage || 0),
                    };

                    return (
                        <div key={report.amsT_Id} id={`std_${report.amsT_Id}`} className="nds-card border border-black mb-[80px] p-[20px]">
                            <div className="reportbody">

                                {/* Header */}
                                <div className="text-center">
                                    <img src="https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/37ca65ba-17e9-4187-98a0-c25cd3229410.jpg" className="w-[96%] ml-[2%] img-responsive" alt="Header" />
                                </div>
                                <br />

                                {/* <div style={{ textAlign: 'center', margin: '15px 0' }}>
                                    <div style={{ width: '80%', margin: '5px auto' }}>
                                        <h4 style={{ margin: 0, fontWeight: 'normal', fontSize: '18px', lineHeight: '1.5' }}>
                                            Website:
                                            <a href="https://notredameacademyntpcsolapur.com" target="_blank" style={{ color: 'blue', textDecoration: 'underline' }}>
                                                https://notredameacademyntpcsolapur.com
                                            </a>
                                            <br />
                                            Email:
                                            <a href="mailto:notredameacademyntpc@gmail.com" style={{ color: 'blue', textDecoration: 'underline' }}>
                                                notredameacademyntpc@gmail.com
                                            </a>
                                            <br />
                                            Phone: +91 8618096186
                                        </h4>
                                    </div>
                                </div> */}

                                <div className="text-center my-[15px]">
                                    <div className="w-[30%] mx-auto my-[5px] h-[28px] flex items-center justify-center">
                                        <h4 className="m-0 font-normal text-[20px]">ACADEMIC SESSION 2025-2026</h4>
                                    </div>
                                    <div className="w-[30%] mx-auto my-[5px] h-[28px] flex items-center justify-center">
                                        <h4 className="m-0 font-normal text-[18px]">Annual Report Card</h4>
                                    </div>
                                </div>

                                {/* Student Details */}
                                <table className="w-full border-[1.5px] border-black border-collapse mt-[40px]">
                                    <tbody>
                                        <tr>
                                            <td className="text-left pl-[20px]"><b>Student Name : {report.studentName}</b></td>
                                            <td className="text-left pl-[20px]"><b>Grade & Section : {report.className} / {report.sectionName}</b></td>
                                            <td className="text-left pl-[20px]"><b>Admn. No. : {report.admissionNo}</b></td>
                                        </tr>
                                        <tr className="h-[10px]"></tr>
                                        <tr>
                                            <td className="text-left pl-[20px]"><b>Father&apos;s Name : {report.fatherName || ''}</b></td>
                                            <td className="text-left pl-[20px]"><b>Date of Birth : {report.dob}</b></td>
                                            <td className="text-left pl-[20px]"><b>Roll No : {report.rollNo || ''}</b></td>
                                        </tr>
                                        <tr className="h-[10px]"></tr>
                                        <tr>
                                            <td className="text-left pl-[20px]"><b>Mother&apos;s Name : {report.motherName || ''}</b></td>
                                            <td className="text-left pl-[20px]">&nbsp;</td>
                                            <td className="text-left pl-[20px]">&nbsp;</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Scholastic Table */}
                                <div className="w-full">
                                    <div className="w-full">
                                        <table className="w-full border-collapse border border-black">
                                            <thead>
                                                <tr>
                                                    <td className="text-left w-[100px] bg-[#0a58ca] text-white border border-black"><b></b> </td>
                                                    {getgroupdetails.map((grp: any, gIdx: number) => (
                                                        <td key={gIdx} colSpan={grp.groupewiseexam.length} className="bg-[#0a58ca] text-white border border-black">
                                                            <b>{grp.empG_DistplayName}</b>
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th className="text-center w-[100px] bg-[#0a58ca] text-white border border-black"><b>Subject Name</b></th>
                                                    {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                        <th key={eIdx} className="text-center w-[150px] bg-[#0a58ca] text-white border border-black">
                                                            <b>{grpexam.examnamedisplay}</b>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentSubjects.filter((subj: any) => subj.EMPS_AppToResultFlg !== false).map((subj: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className="nds-text-left"><b>{subj.subjectName}</b></td>
                                                        {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                            const mrks = studentMarks.find((m: any) => m.ismS_SubjectName === subj.subjectName && m.emE_Id === grpexam.EME_Id && m.empsG_DisplayName === grpexam.EMPG_DistplayName);
                                                            return (
                                                                <td key={eIdx} className="nds-text-center">
                                                                    {mrks && (
                                                                        <>
                                                                            {['AB', 'M', 'L'].includes(mrks.passFailFlag) ? (
                                                                                <span style={{ fontSize: '16px' }}>
                                                                                    <b>{mrks.passFailFlag}</b>
                                                                                    {mrks.obtainedMarks > 0 && grpexam.EME_ExamName !== 'Grade' && ` (${mrks.obtainedMarks})`}
                                                                                </span>
                                                                            ) : grpexam.EME_ExamName !== 'Grade' ? (
                                                                                <span style={{ fontSize: '16px' }}><b>{mrks.obtainedMarks}</b></span>
                                                                            ) : (
                                                                                <span style={{ fontSize: '16px' }}><b>{mrks.obtainedGrade}</b></span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tbody>
                                                <tr>
                                                    <td className="nds-text-left" style={{ fontSize: '20px' }}>TOTAL </td>
                                                    <td colSpan={5}>&nbsp;</td>
                                                    <td>
                                                        {getstudent_examwisemarks.filter((mrks: any) => mrks.EMPSG_DisplayName === 'TERM I' && mrks.amsT_Id === report.amsT_Id).map((mrks: any, idx: number) => (
                                                            <b key={idx}>{mrks.ObtainedMarks}</b>
                                                        ))}
                                                    </td>
                                                    <td className="nds-text-center">
                                                        {getstudent_examwisemarks.filter((mrks: any) => mrks.EMPSG_DisplayName === 'TERM I' && mrks.amsT_Id === report.amsT_Id).map((mrks: any, idx: number) => (
                                                            <b key={idx}>{mrks.ObtainedGrade}</b>
                                                        ))}
                                                    </td>
                                                    <td colSpan={5}>&nbsp;</td>
                                                    <td>
                                                        {getstudent_examwisemarks.filter((mrks: any) => mrks.EMPSG_DisplayName === 'TERM II' && mrks.amsT_Id === report.amsT_Id).map((mrks: any, idx: number) => (
                                                            <b key={idx}>{mrks.ObtainedMarks}</b>
                                                        ))}
                                                    </td>
                                                    <td className="nds-text-center">
                                                        {getstudent_examwisemarks.filter((mrks: any) => mrks.EMPSG_DisplayName === 'TERM II' && mrks.amsT_Id === report.amsT_Id).map((mrks: any, idx: number) => (
                                                            <b key={idx}>{mrks.ObtainedGrade}</b>
                                                        ))}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="nds-text-left" style={{ fontSize: '20px' }}> PERCENTAGE</td>
                                                    <td colSpan={5}>&nbsp;</td>
                                                    <td className="nds-text-center" colSpan={2}>
                                                        {getstudent_examwisemarks.filter((mrks: any) => mrks.EMPSG_DisplayName === 'TERM I' && mrks.amsT_Id === report.amsT_Id).map((mrks: any, idx: number) => (
                                                            <b key={idx}>{Number(mrks.TotalPercentage).toFixed(2)}%</b>
                                                        ))}
                                                    </td>
                                                    <td className="nds-text-center" colSpan={7}>
                                                        {getstudent_examwisemarks.filter((mrks: any) => mrks.EMPSG_DisplayName === 'TERM II' && mrks.amsT_Id === report.amsT_Id).map((mrks: any, idx: number) => (
                                                            <b key={idx} className="nds-text-right" style={{ marginRight: '-400px' }}>{Number(mrks.TotalPercentage).toFixed(2)}%</b>
                                                        ))}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Additional Subjects */}
                                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                    <h3 style={{ display: 'inline-block', fontSize: '19px', padding: '5px 15px', margin: 0 }}>Additional Subjects</h3>
                                </div>

                                <table className="nds-table">
                                    <thead>
                                        <tr>
                                            <td style={{ width: '100px', backgroundColor: '#0a58ca', color: 'white' }} className="nds-text-left"><b></b></td>
                                            <td colSpan={4} className="nds-text-center" style={{ backgroundColor: '#0a58ca', color: 'white' }}><b>TERM I</b></td>
                                            <td colSpan={6} className="nds-text-center" style={{ backgroundColor: '#0a58ca', color: 'white' }}><b>TERM II</b></td>
                                        </tr>
                                        <tr>
                                            <th style={{ width: '100px', backgroundColor: '#0a58ca', color: 'white' }} className="nds-text-center"><b>Subject Name</b></th>
                                            {groupwiseexamlist.filter((g: any) => !hiddenHeaders.includes(g.examnamedisplay)).map((grpexam: any, eIdx: number) => (
                                                <th key={eIdx} className="nds-text-center" style={{ width: '150px', backgroundColor: '#0a58ca', color: 'white' }}>
                                                    <b>{grpexam.examnamedisplay}</b>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentSubjects.filter((subj: any) => subj.EMPS_AppToResultFlg === false).map((subj: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className="nds-text-left"><b>{subj.subjectName}</b></td>
                                                {groupwiseexamlist.filter((g: any) => !hiddenHeaders.includes(g.examnamedisplay)).map((grpexam: any, eIdx: number) => {
                                                    const mrks = studentMarks.find((m: any) => m.ismS_SubjectName === subj.subjectName && m.emE_Id === grpexam.EME_Id && m.empsG_DisplayName === grpexam.EMPG_DistplayName);
                                                    return (
                                                        <td key={eIdx} className="nds-text-center">
                                                            {mrks && (
                                                                <>
                                                                    {['AB', 'M', 'L'].includes(mrks.passFailFlag) ? (
                                                                        <span style={{ fontSize: '16px' }}>
                                                                            <b>{mrks.passFailFlag}</b>
                                                                            {mrks.obtainedMarks > 0 && grpexam.EME_ExamName !== 'Grade' && ` (${mrks.obtainedMarks})`}
                                                                        </span>
                                                                    ) : grpexam.EME_ExamName !== 'Grade' ? (
                                                                        <span style={{ fontSize: '16px' }}><b>{mrks.obtainedMarks}</b></span>
                                                                    ) : (
                                                                        <span style={{ fontSize: '16px' }}><b>{mrks.obtainedGrade}</b></span>
                                                                    )}
                                                                </>
                                                                    )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Co-Scholastic & Grade Brackets */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ width: '60%', marginTop: '10px' }}>
                                        <div><h3>CO – SCHOLASTIC</h3></div>
                                        <table className="nds-table">
                                            <thead>
                                                <tr>
                                                    <td style={{ width: '200px', backgroundColor: '#0a58ca', color: 'white' }} className="nds-text-center"><b>Subjects</b></td>
                                                    {gettermdetails.map((cos: any, cIdx: number) => (
                                                        <td key={cIdx} className="nds-text-center" style={{ backgroundColor: '#0a58ca', color: 'white' }}><b>{cos.ecT_TermName}</b></td>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.activity_main_list?.map((subjco: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className="nds-text-left"><b>{subjco.ECACTA_SkillArea}</b></td>
                                                        {gettermdetails.map((cos: any, cIdx: number) => {
                                                            const sc = subjco.activity_score_details?.find((s: any) => s.ecT_Id === cos.ecT_Id);
                                                            return (
                                                                <td key={cIdx} className="nds-text-center">
                                                                    <b>{sc?.ECSACTT_Score}</b>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className='mt-10 text-blue-800 font-bold'><h3>CO-SCHOLASTIC GRADE BRACKET</h3></div>
                                        <table className="nds-table">
                                            <tbody>
                                                <tr>
                                                    <td className="nds-text-left"><b>Grades</b></td>
                                                    <td className="nds-text-center">A</td><td className="nds-text-center">B</td><td className="nds-text-center">C</td><td className="nds-text-center">D</td><td className="nds-text-center">E</td>
                                                </tr>
                                                <tr>
                                                    <td className="nds-text-left"><b>Description</b></td>
                                                    <td className="nds-text-left">Excellent</td><td className="nds-text-left">Very Good</td><td className="nds-text-left">Good</td><td className="nds-text-left">Fair</td><td className="nds-text-left">Needs Improvemt</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ width: '35%' }}>
                                        <table className="nds-table">
                                            <tbody>
                                                <tr><td colSpan={2} className="nds-text-center"><b>SCHOLASTIC GRADE BRACKET</b></td></tr>
                                                <tr>
                                                    <td className="nds-text-left"><b>Grades</b></td>
                                                    <td className="nds-text-left"><b>Ranges</b></td>
                                                </tr>
                                                <tr><td className="nds-text-center">A1</td><td className="nds-text-center">91 - 100</td></tr>
                                                <tr><td className="nds-text-center">A2</td><td className="nds-text-center">81 - 90</td></tr>
                                                <tr><td className="nds-text-center">B1</td><td className="nds-text-center">71 - 80</td></tr>
                                                <tr><td className="nds-text-center">B2</td><td className="nds-text-center">61 - 70</td></tr>
                                                <tr><td className="nds-text-center">C1</td><td className="nds-text-center">51 - 60</td></tr>
                                                <tr><td className="nds-text-center">C2</td><td className="nds-text-center">41 - 50</td></tr>
                                                <tr><td className="nds-text-center">D</td><td className="nds-text-center">33 - 40</td></tr>
                                                <tr><td className="nds-text-center">E</td><td className="nds-text-center">0-32</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Attendance */}
                                <div className="col-sm-12" style={{ marginTop: '45px' }}>
                                    <table className="nds-table" style={{ tableLayout: 'fixed' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '33%' }}><b>Attendance</b></th>
                                                <th style={{ width: '33%' }}><b>Expected Attendance</b></th>
                                                <th style={{ width: '33%' }}><b>Actual Attendance</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>TERM 1</td>
                                                <td><strong>180</strong></td>
                                                <td><b>{studentAttendance.Half_ATTENDANCEPERCENTAGE}</b></td>
                                            </tr>
                                            <tr>
                                                <td>TERM 2</td>
                                                <td><strong>180</strong></td>
                                                <td><b>{studentAttendance.Annual_ATTENDANCEPERCENTAGE ? Number(studentAttendance.Annual_ATTENDANCEPERCENTAGE).toFixed(0) : 0}</b></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <br />
                                </div>

                                {/* Remarks & Signatures */}
                                <div className="col-sm-12">
                                    <table className="nds-table">
                                        <tbody>
                                            <tr><td className="nds-text-left" colSpan={2}><b>GENERAL REMARKS</b></td></tr>
                                            <tr>
                                                <td className="nds-text-left" style={{ width: '190px' }}><b>Promoted to class</b></td>
                                                <td className="nds-text-left">{report.promotedclass}</td>
                                            </tr>
                                            <tr>
                                                <td className="nds-text-left" style={{ width: '190px' }}><b>Remarks</b></td>
                                                <td className="nds-text-left">{report.remarks}</td>
                                            </tr>
                                            <tr>
                                                <td className="nds-text-left" style={{ width: '190px' }}><b>School reopen date</b></td>
                                                <td className="nds-text-left">{formatDate(date)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                                        <div style={{ flex: 1, textAlign: 'left', marginTop: '40px' }}>
                                            <b style={{ fontSize: '18px' }}>Class Teacher&apos;s Signature</b>
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'center', marginTop: '40px' }}>
                                            <b style={{ fontSize: '18px' }}>Principal&apos;s Signature</b>
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'right', marginTop: '40px' }}>
                                            <b style={{ fontSize: '18px' }}>Parent&apos;s Signature</b>
                                        </div>
                                    </div>
                                </div>

                                {/* Chart (Hidden in UI, used for print) */}
                                {/* <div className="nds-chart-canvas" style={{ marginTop: '40px' }}>
                                    <PerformanceChart
                                        studentId={report.amsT_Id}
                                        chartData={chartData}
                                        onChartReady={handleChartReady}
                                    />
                                </div>
                                {chartImages[report.amsT_Id] && (
                                    <img src={chartImages[report.amsT_Id]} className="nds-chart-image" alt="Chart" style={{ marginTop: '40px' }} />
                                )} */}

                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
