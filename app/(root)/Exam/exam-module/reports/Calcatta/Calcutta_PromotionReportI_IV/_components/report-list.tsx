import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportViewProps {
    data: any;
    institution: IMasterInstitution | Institution | null;
}

const CalcuttaPromotionReportView = ({ data, institution }: CalcuttaPromotionReportViewProps) => {
    const handleExport = () => {};
    const handlePrint = () => {
        window.print();
    };

    if (!data || !data.studentdetails || data.studentdetails.length === 0) {
        return (
            <div className='flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm'>
                <p className='font-medium text-gray-500 text-lg'>No data available. Please generate the report.</p>
            </div>
        );
    }

    const { getgroupdetails, groupwiseexamlist, studentdetails } = data;

    return (
        <div>
            <style>
                {`
                @media print {
                    @page { margin: 10mm; }
                    body {
                        visibility: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                }
                `}
            </style>
            
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
                <Button
                    onClick={handleExport}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <FileSpreadsheet className='h-4 w-4' /> Excel
                </Button>
            </div>

            <div id='printable-area'>
                {studentdetails.map((student: any, index: number) => {
                    const dob = student.amsT_DOB ? new Date(student.amsT_DOB).toLocaleDateString('en-GB') : '';

                    return (
                        <div key={student.amsT_Id || index} className={`min-w-[800px] bg-white p-4 font-sans text-[13px] ${index < studentdetails.length - 1 ? 'page-break mb-8' : ''}`}>
                            
                            {/* Header */}
                            <div className='mb-4 flex items-center justify-between'>
                                <div className='w-1/4'>
                                    {institution?.mI_Logo && <img src={institution.mI_Logo} alt='Institution Logo' className='max-h-24' />}
                                </div>
                                <div className='w-2/4 text-center'>
                                    <h2 className='font-bold text-sky-800 text-xl uppercase'>ACHIEVEMENT RECORD</h2>
                                    <p className='font-semibold text-gray-700 text-sm'>ACADEMIC YEAR: {student.asmaY_Year}</p>
                                </div>
                                <div className='w-1/4' />
                            </div>

                            {/* Student Info */}
                            <div className='mb-6 flex items-start justify-between rounded border border-gray-300 p-4 font-bold text-[13px] text-sky-800'>
                                <div className='flex w-3/4 flex-col gap-2'>
                                    <div className='flex'>
                                        <span className='w-48 text-black'>Student Name</span> <span className='w-4 text-black'>:</span>{' '}
                                        <span className='text-black uppercase'>{student.amsT_FirstName}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-48 text-black'>Admission Number</span> <span className='w-4 text-black'>:</span>{' '}
                                        <span className='text-black'>{student.amsT_AdmNo}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-48 text-black'>Class & Section</span> <span className='w-4 text-black'>:</span>{' '}
                                        <span className='text-black uppercase'>{student.asmcL_ClassName} - {student.asmC_SectionName}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-48 text-black'>Date of Birth</span> <span className='w-4 text-black'>:</span>{' '}
                                        <span className='text-black'>{dob}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-48 text-black'>Mother's Name</span> <span className='w-4 text-black'>:</span>{' '}
                                        <span className='text-black uppercase'>{student.amsT_MotherName}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-48 text-black'>Father's Name</span> <span className='w-4 text-black'>:</span>{' '}
                                        <span className='text-black uppercase'>{student.amsT_FatherName}</span>
                                    </div>
                                </div>
                                
                                {/* Photo */}
                                <div className='h-[140px] w-[120px] overflow-hidden border-2 border-sky-800'>
                                    {student.amsT_Photoname ? (
                                        <img src={student.amsT_Photoname} alt="Student" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">Photo</div>
                                    )}
                                </div>
                            </div>

                            {/* Scholastic Areas */}
                            <h3 className='mb-2 text-center font-bold text-lg text-sky-800 uppercase'>Part I: Scholastic Areas</h3>
                            <table className='mb-6 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                                <thead>
                                    <tr>
                                        <td rowSpan={2} className='border border-gray-300 bg-gray-200 p-2 text-left font-bold text-black'>Subjects</td>
                                        {getgroupdetails && getgroupdetails.map((grp: any, idx: number) => (
                                            <td key={idx} colSpan={grp.groupewiseexam?.length || 1} className='border border-gray-300 bg-gray-200 p-2 font-bold text-black uppercase'>
                                                {grp.empG_DistplayName}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className='border border-gray-300 bg-gray-200'>
                                        {groupwiseexamlist && groupwiseexamlist.map((exam: any, idx: number) => (
                                            <td key={idx} className='border border-gray-300 p-2 font-bold text-black'>
                                                {exam.examnamedisplay} <br/>
                                                {exam.EMPSGE_ForMaxMarkrs ? `(${exam.EMPSGE_ForMaxMarkrs})` : ''}
                                            </td>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='text-black'>
                                    {student.studentsubjects && student.studentsubjects.length > 0 ? student.studentsubjects.map((subj: any, idx: number) => {
                                        if (subj.EYCES_MarksDisplayFlg || subj.eyceS_MarksDisplayFlg) {
                                            return (
                                                <tr key={idx} className='border border-gray-300'>
                                                    <td className='border border-gray-300 p-2 text-left'>{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>
                                                    
                                                    {groupwiseexamlist && groupwiseexamlist.map((exam: any, eIdx: number) => {
                                                        let cellValue: any = '';
                                                        
                                                        if (exam.EME_Id === 9800000) {
                                                            const mr1 = student.examwisetotal?.find((t: any) => t.empG_DistplayName === exam.EMPG_DistplayName && t.ISMS_Id === subj.ISMS_Id);
                                                            if (mr1) {
                                                                if (mr1.estmpS_PassFailFlg !== 'AB') {
                                                                    cellValue = mr1.estmpS_ObtainedMarks; // could also show grade
                                                                } else {
                                                                    cellValue = 'AB';
                                                                }
                                                            }
                                                        } else if (exam.EME_Id === 98000012) {
                                                            const mr1 = student.examwisetotal?.find((t: any) => t.empG_DistplayName === exam.EMPG_DistplayName && t.ISMS_Id === subj.ISMS_Id);
                                                            if (mr1) {
                                                                if (mr1.estmpS_PassFailFlg !== 'AB') {
                                                                    cellValue = mr1.estmppS_ClassHighest;
                                                                } else {
                                                                    cellValue = 'AB';
                                                                }
                                                            }
                                                        } else {
                                                            const mr = student.student_marks?.find((m: any) => m.EME_Id === exam.EME_Id && m.ISMS_Id === subj.ISMS_Id);
                                                            if (mr) {
                                                                if (mr.ESTMPS_PassFailFlg !== 'AB' && mr.ESTMPS_PassFailFlg !== 'M') {
                                                                    cellValue = mr.ESTMPS_ObtainedMarks;
                                                                } else if (mr.ESTMPS_PassFailFlg === 'AB') {
                                                                    cellValue = 'AB';
                                                                } else if (mr.ESTMPS_PassFailFlg === 'M') {
                                                                    cellValue = 'M';
                                                                }
                                                            }
                                                        }

                                                        return (
                                                            <td key={eIdx} className='border border-gray-300 p-2'>{cellValue}</td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        }
                                        return null;
                                    }) : (
                                        <tr>
                                            <td colSpan={(groupwiseexamlist?.length || 0) + 1} className="p-4 text-center text-gray-500 italic">Empty</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Chart */}
                            {student.chartData && student.chartData.length > 0 && (
                                <div className='mt-8 mb-8'>
                                    <h4 className='mb-4 text-center font-bold text-[14px] text-sky-800 uppercase underline'>STUDENT PERFORMANCE ANALYSIS</h4>
                                    <div className='mx-auto h-[350px] w-full max-w-[900px] border border-gray-200 pt-6'>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <BarChart
                                                data={student.chartData}
                                                margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                                            >
                                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                                <XAxis dataKey='subject' tick={{ fontSize: 11 }} tickLine={false} axisLine={true} interval={0} angle={-25} textAnchor="end" />
                                                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={true} domain={[0, 'dataMax + 10']} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Legend verticalAlign='bottom' height={36} iconType='rect' wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                                <Bar dataKey='highest' fill='#3f51b5' name='Class Highest' barSize={20} />
                                                <Bar dataKey='average' fill='#ff5722' name='Section Average' barSize={20} />
                                                <Bar dataKey='obtained' fill='#00ff00' name='Obtained Marks' barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Attendance and Remarks */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className='mb-2 text-center font-bold text-[14px] text-sky-800 uppercase underline'>ATTENDANCE DETAILS</h4>
                                    <table className='w-full border-collapse border border-gray-300 text-center text-[12px] text-black'>
                                        <thead>
                                            <tr className='border border-gray-300 bg-gray-200'>
                                                <td className='border border-gray-300 p-2 font-bold'>Term</td>
                                                <td className='border border-gray-300 p-2 font-bold'>Total Days</td>
                                                <td className='border border-gray-300 p-2 font-bold'>Present</td>
                                                <td className='border border-gray-300 p-2 font-bold'>%</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {student.attendance && student.attendance.length > 0 ? student.attendance.map((att: any, idx: number) => (
                                                <tr key={idx} className='border border-gray-300'>
                                                    <td className='border border-gray-300 p-2'>{att.term || `Term ${idx+1}`}</td>
                                                    <td className='border border-gray-300 p-2'>{att.classheld}</td>
                                                    <td className='border border-gray-300 p-2'>{att.classatt}</td>
                                                    <td className='border border-gray-300 p-2'>{att.percentage}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="p-2 text-center text-gray-500 italic">Empty</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h4 className='mb-2 text-center font-bold text-[14px] text-sky-800 uppercase underline'>REMARKS</h4>
                                    <div className="min-h-[100px] w-full rounded border border-gray-300 p-3 text-[13px] text-black">
                                        {student.suggestions && student.suggestions.length > 0 ? (
                                            <ul className="list-inside list-disc">
                                                {student.suggestions.map((sug: string, idx: number) => (
                                                    <li key={idx}>{sug}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-500 italic">Empty</span>
                                        )}
                                        {student.remarks && (
                                            <p className="mt-2 font-semibold">Promotion Status: {student.remarks}</p>
                                        )}
                                        {student.promotedclass && (
                                            <p className="font-semibold">Promoted To: {student.promotedclass}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className='mt-24 flex items-end justify-between font-bold text-[13px] text-black'>
                                <div className="border-t border-black pt-2 text-center w-48">Class Teacher</div>
                                <div className="border-t border-black pt-2 text-center w-48">Principal</div>
                                <div className="border-t border-black pt-2 text-center w-48">Parent</div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportView;
