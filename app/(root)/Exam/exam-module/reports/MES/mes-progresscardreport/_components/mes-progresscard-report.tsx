'use client';

import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

/* ---------- Performance Chart Component ---------- */
function PerformanceChart({
    studentId,
    chartData,
    onChartReady
}: {
    studentId: number;
    chartData?: { subjects: string[]; marks: number[] };
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
                            backgroundColor: 'rgba(30, 144, 255, 0.6)',
                            borderColor: 'rgba(30, 144, 255, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { font: { size: 10 } }
                        },
                        x: {
                            ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    animation: {
                        duration: 500,
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
        <div style={{ height: '200px', width: '100%' }}>
            <canvas ref={canvasRef} id={`pieChartMES${studentId}`} />
        </div>
    );
}

interface MESProgressCardReportProps {
    reportData: any[];
    saveList: any[];
    workAttendance: any[];
    presentAttendance: any[];
    promotionRemarks: any[];
    examName: string;
    examCode: string;
    year: string;
    institution?: IMasterInstitution | Institution | null;
}

export default function MESProgressCardReport({
    reportData,
    saveList,
    workAttendance,
    presentAttendance,
    promotionRemarks,
    examName,
    examCode,
    year,
    institution
}: MESProgressCardReportProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const handlePrint = useReactToPrint({
        contentRef: printRef
    });

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => ({ ...prev, [id]: dataUrl }));
    }, []);

    if (!reportData || reportData.length === 0) return null;

    return (
        <div className='space-y-6'>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

                .mes-report-container {
                    font-family: 'Roboto', sans-serif !important;
                    color: black;
                }

                .mes-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0.5rem;
                }

                .mes-table th, .mes-table td {
                    border: 1px solid #000;
                    padding: 6px;
                    text-align: center;
                    font-size: 12px;
                }

                .mes-header-bg {
                    background-color: #f0f7ff !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .mes-info-label {
                    font-weight: 700;
                    color: #1a365d;
                }

                .mes-card {
                    border: 10px solid #1a365d;
                    background: white;
                    margin-bottom: 40px;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                    body * { visibility: hidden !important; }
                    #mes-print-area, #mes-print-area * { visibility: visible !important; }
                    #mes-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    .mes-page-break { page-break-after: always !important; }
                    
                    .mes-card {
                        border: 10px solid #1a365d !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        margin-bottom: 0 !important;
                    }
                    .mes-header-bg {
                        background-color: #f0f7ff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            <div className='no-print mb-4 flex justify-end'>
                <Button onClick={() => handlePrint()} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            <div id='mes-print-area' ref={printRef} className='mes-report-container'>
                {reportData.map((report, index) => {
                    const studentMarks = saveList.filter((m) => m.amsT_Id === report.amsT_Id);
                    const scholasticMarks = studentMarks.filter((m) => m.eyceS_AplResultFlg === true);
                    const coScholasticMarks = studentMarks.filter((m) => m.eyceS_AplResultFlg === false);

                    const chartData = {
                        subjects: scholasticMarks.map((m) => m.ismS_SubjectName),
                        marks: scholasticMarks.map((m) => m.estmpS_ObtainedMarks || 0)
                    };

                    return (
                        <div key={report.amsT_Id} className='mes-card mx-auto p-8 shadow-sm' style={{ width: '210mm', minHeight: '290mm' }}>
                            {/* Header Image */}
                            <div className='mb-6 text-center'>
                                <img
                                    src='https://vapsclg.blob.core.windows.net/files/78/ISM_Attachments/bdb3c5ea-581f-46bd-9516-d391b5a2b53e.jpg'
                                    alt='School Header'
                                    className='mx-auto h-auto max-h-32 w-full object-contain'
                                />
                            </div>

                            {/* Report Title */}
                            <div className='mb-6 text-center'>
                                <div className='mb-2 inline-block rounded-sm bg-blue-900 px-8 py-2 text-white'>
                                    <h2 className='font-bold text-xl uppercase tracking-widest'>PROGRESS REPORT CARD</h2>
                                </div>
                                <h3 className='font-bold text-gray-800 text-lg'>
                                    {examName || report.emE_ExamName} - ({year})
                                </h3>
                            </div>

                            {/* Student Info Table */}
                            <table className='mes-table' style={{ border: 'none', marginBottom: '1.5rem' }}>
                                <tbody style={{ border: 'none' }}>
                                    <tr style={{ border: 'none' }}>
                                        <td style={{ border: 'none', textAlign: 'left', width: '33%' }}>
                                            <span className='mes-info-label'>Name :</span> {report.amsT_FirstName}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left', width: '33%' }}>
                                            <span className='mes-info-label'>Class :</span> {report.asmcL_ClassName}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left', width: '33%' }}>
                                            <span className='mes-info-label'>Roll No :</span> {report.amaY_RollNo}
                                        </td>
                                    </tr>
                                    <tr style={{ border: 'none' }}>
                                        <td style={{ border: 'none', textAlign: 'left' }}>
                                            <span className='mes-info-label'>Adm No :</span> {report.amsT_AdmNo}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left' }}>
                                            <span className='mes-info-label'>Section :</span> {report.asmC_SectionName}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left' }}>
                                            <span className='mes-info-label'>Attendance :</span>
                                            {(() => {
                                                const workAtt = workAttendance.find((att) => att.AMST_Id === report.amsT_Id);
                                                const presAtt = presentAttendance.find((att) => att.AMST_Id === report.amsT_Id);
                                                return workAtt && presAtt
                                                    ? ` ${presAtt.TotalPresentDays} / ${workAtt.TotalWorkingDays}`
                                                    : ' -';
                                            })()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Scholastic Table */}
                            <div className='mb-8'>
                                <table className='mes-table'>
                                    <thead>
                                        <tr className='mes-header-bg'>
                                            <th className='w-12'>SL</th>
                                            <th className='px-4 text-left'>SCHOLASTIC SUBJECTS</th>
                                            <th className='w-20'>MAX</th>
                                            <th className='w-20'>MIN</th>
                                            <th className='w-20'>OBTAINED</th>
                                            <th className='w-16'>GRADE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scholasticMarks.map((marks, mIndex) => (
                                            <tr key={mIndex}>
                                                <td>{mIndex + 1}</td>
                                                <td className='px-4 text-left font-medium'>{marks.ismS_SubjectName}</td>
                                                <td>{marks.eyceS_MaxMarks}</td>
                                                <td>{marks.eyceS_MinMarks}</td>
                                                <td className='font-bold'>
                                                    {marks.estmpS_PassFailFlg === 'AB'
                                                        ? 'AB'
                                                        : marks.eyceS_MarksDisplayFlg
                                                          ? marks.estmpS_ObtainedMarks
                                                          : '-'}
                                                </td>
                                                <td className='font-bold'>
                                                    {marks.estmpS_PassFailFlg === 'AB' ? 'AB' : marks.estmpS_ObtainedGrade}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className='mes-header-bg font-bold'>
                                            <td colSpan={2} className='px-4 text-right uppercase'>
                                                GRAND TOTAL
                                            </td>
                                            <td>{report.estmP_TotalMaxMarks}</td>
                                            <td>{report.estmP_MinMarks}</td>
                                            <td>{report.estmP_TotalObtMarks}</td>
                                            <td>{report.estmP_TotalGrade}</td>
                                        </tr>
                                        <tr className='mes-header-bg font-bold'>
                                            <td colSpan={2} className='px-4 text-right uppercase'>
                                                PERCENTAGE
                                            </td>
                                            <td colSpan={4} className='text-center'>
                                                {report.estmP_Percentage}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Co-Scholastic & Chart Grid */}
                            <div className='mb-8 grid grid-cols-2 gap-8'>
                                <div>
                                    <div className='mb-1 bg-blue-900 py-1 text-center font-bold text-white text-xs uppercase'>
                                        Co-Scholastic Performance
                                    </div>
                                    <table className='mes-table'>
                                        <thead>
                                            <tr className='mes-header-bg'>
                                                <th className='px-4 text-left'>Subject</th>
                                                <th className='w-20'>Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coScholasticMarks.map((marks, mIndex) => (
                                                <tr key={mIndex}>
                                                    <td className='px-4 text-left'>{marks.ismS_SubjectName}</td>
                                                    <td className='font-bold'>{marks.estmpS_ObtainedGrade}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='flex flex-col rounded border border-gray-300 p-2'>
                                    <div className='mb-2 bg-blue-900 py-1 text-center font-bold text-white text-xs uppercase'>
                                        Subject Analysis
                                    </div>
                                    <div className='relative min-h-[150px] flex-1'>
                                        {/* Canvas for screen */}
                                        <div className='no-print'>
                                            <PerformanceChart
                                                studentId={report.amsT_Id}
                                                chartData={chartData}
                                                onChartReady={handleChartReady}
                                            />
                                        </div>
                                        {/* Image for print */}
                                        {chartImages[report.amsT_Id] && (
                                            <img
                                                src={chartImages[report.amsT_Id]}
                                                alt='Performance Analysis'
                                                className='hidden h-auto w-full object-contain print:block'
                                                style={{ maxHeight: '200px' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className='mb-8'>
                                <div className='mb-2 inline-block bg-blue-900 px-4 py-1 font-bold text-white text-xs uppercase'>
                                    Class Teacher's Remarks
                                </div>
                                <div className='border-gray-400 border-b-2 border-dotted pb-2 text-sm italic'>
                                    {promotionRemarks.find((p) => p.amsT_Id === report.amsT_Id)?.emeR_Remarks ||
                                        'Satisfactory progress shown in all subjects.'}
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className='mt-12 mb-8 grid grid-cols-3 gap-8 text-center'>
                                <div className='border-black border-t pt-2'>
                                    <p className='font-bold text-xs uppercase'>Class Teacher</p>
                                </div>
                                <div className='border-black border-t pt-2'>
                                    <p className='font-bold text-xs uppercase'>Principal</p>
                                </div>
                                <div className='border-black border-t pt-2'>
                                    <p className='font-bold text-xs uppercase'>Parent</p>
                                </div>
                            </div>

                            {/* Grading Scale */}
                            <div className='mt-auto pt-4'>
                                <table className='mes-table' style={{ fontSize: '10px', width: '80%', margin: '0 auto' }}>
                                    <thead>
                                        <tr className='mes-header-bg'>
                                            <th colSpan={8}>ACADEMIC GRADING SCALE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='mes-header-bg font-bold'>Grade</td>
                                            <td>A+</td>
                                            <td>A</td>
                                            <td>B+</td>
                                            <td>B</td>
                                            <td>C+</td>
                                            <td>C</td>
                                            <td>D</td>
                                        </tr>
                                        <tr>
                                            <td className='mes-header-bg font-bold'>Range</td>
                                            <td>91-100</td>
                                            <td>81-90</td>
                                            <td>71-80</td>
                                            <td>61-70</td>
                                            <td>51-60</td>
                                            <td>41-50</td>
                                            <td>0-40</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {index < reportData.length - 1 && <div className='mes-page-break' />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
