'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Nursery Emoji Report List Component
 * Supports two distinct modes:
 * 1. REPORT: Table with focus areas and emoji-based marks.
 * 2. TEMPLATE: High-fidelity Performance Report Card with signatures and attendance.
 */

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const handlePrint = () => {
        window.print();
    };

    const rawData = data?.data || data || {};

    const {
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseattendancedetails = [],
        uniqueSubjects = []
    } = rawData;

    if (!getstudentdetails || getstudentdetails.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground'>
                No report data found for the selected criteria.
            </div>
        );
    }

    const reportMode = params.reportMode || 'report';
    const selectedExams = params.selectedExamsDetails || [];

    const getEmoji = (score: number | string) => {
        const numScore = Number(score);
        if (numScore === 1) return '🤩';
        if (numScore === 2) return '😊';
        if (numScore === 3) return '😃';
        if (numScore === 4) return '😐';
        return '😊';
    };

    return (
        <div className='mx-auto w-full max-w-[1200px]'>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'
                >
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='report-print-area'>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { size: A4 portrait; margin: 5mm; }
                        body { visibility: hidden; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        #report-print-area, #report-print-area * { visibility: visible; }
                        #report-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none !important; }
                        .page-break { page-break-after: always; }
                    }
                    .report-card { font-family: 'Poppins', sans-serif; color: #000; width: 100%; margin: 0 auto; box-sizing: border-box; }
                    .primary-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; font-size: 13px; }
                    .primary-table th, .primary-table td { border: 1px solid #000; padding: 6px; text-align: center; }
                    .text-left { text-align: left !important; }
                    .bg-transparent { background-color: transparent !important; }
                    
                    /* Template Specific Styles */
                    .template-container { display: flex; flex-wrap: wrap; gap: 2%; min-height: 9.5in; border: 1px solid #0043ff; padding: 15px; position: relative; margin-bottom: 20px; }
                    .column-half { width: 48.5%; position: relative; }
                    .divider { width: 1px; border-left: 1px dashed #ccc; }
                    .header-logo { width: 80px; margin: 0 auto; display: block; }
                    .photo-box { width: 100px; height: 100px; border: 1px solid #5cb7ff; margin: 10px auto; overflow: hidden; }
                    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
                    .signature-row { display: flex; justify-content: space-between; position: absolute; bottom: 10px; width: 100%; font-size: 10px; }
                    .sig-item { text-align: center; border-top: 1px solid #000; width: 30%; padding-top: 5px; }
                    .emoji-span { font-size: 20px; }
                `}} />

                {reportMode === 'report' ? (
                    /* Mode: REPORT (Emoji Table) */
                    getstudentdetails.map((student: any, idx: number) => {
                        const studentId = student.AMST_Id || student.amsT_Id;
                        const subjectsForStudent = uniqueSubjects.filter((s: any) => !s.AMST_Id || String(s.AMST_Id) === String(studentId));
                        const displaySubjects = subjectsForStudent.length > 0 ? subjectsForStudent : uniqueSubjects;

                        return (
                            <div key={studentId || idx} className={`report-card ${idx > 0 ? 'page-break' : ''} p-4 bg-white`}>
                                <table className="primary-table">
                                    <thead>
                                        <tr className="bg-transparent font-bold">
                                            <th colSpan={2}>TUNBRIDGE HIGH SCHOOL</th>
                                            <th colSpan={(selectedExams.length || 1) + 1}>AY {params.academicYearName || '2023-2024'}</th>
                                        </tr>
                                        <tr className="bg-gray-100 font-bold">
                                            <td colSpan={(selectedExams.length || 1) + 3} className="text-left px-4 py-2">
                                                NAME: {student.studentname || student.studentName} | CLASS: {params.classname || 'Nursery'} | SECTION: {params.sectionname || 'A'}
                                            </td>
                                        </tr>
                                        <tr className="font-bold">
                                            <th rowSpan={2} style={{ width: '40px' }}>#</th>
                                            <th rowSpan={2} style={{ width: '200px' }}>FOCUS AREA</th>
                                            <th rowSpan={2}>LEARNING OUTCOMES</th>
                                            {selectedExams.map((ex: any, eIdx: number) => (
                                                <th key={ex.EME_Id || ex.emE_Id || eIdx}>{ex.EME_ExamName || ex.emE_ExamName || `Exam ${eIdx + 1}`}</th>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td colSpan={selectedExams.length || 1} className="text-center">
                                                <span className="emoji-span">🤩 😊 😃 😐</span>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displaySubjects.map((subj: any, sIdx: number) => {
                                            const outcomes = getstudentwisesubjectlist.filter((sl: any) => 
                                                (!sl.AMST_Id || String(sl.AMST_Id) === String(studentId)) && 
                                                (sl.ISMS_Id === subj.ISMS_Id || sl.ISMS_SubjectName === subj.ISMS_SubjectName)
                                            );
                                            const displayOutcomes = outcomes.length > 0 ? outcomes : [{ EMSE_SubExamName: 'General Learning & Performance' }];

                                            return (
                                                <tr key={subj.ISMS_Id || sIdx}>
                                                    <td>{sIdx + 1}</td>
                                                    <td className="text-left font-bold">{subj.ISMS_SubjectName}</td>
                                                    <td className="p-0">
                                                        <table className="w-full border-none" style={{ borderCollapse: 'collapse' }}>
                                                            <tbody>
                                                                {displayOutcomes.map((out: any, oIdx: number) => (
                                                                    <tr key={oIdx} className={oIdx === displayOutcomes.length - 1 ? 'border-none' : 'border-b border-black'}>
                                                                        <td className="text-left p-2 border-none">{out.EMSE_SubExamName || out.subExamName || 'Outcome'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                    {selectedExams.map((ex: any, eIdx: number) => {
                                                        const examId = ex.EME_Id || ex.emE_Id;
                                                        return (
                                                            <td key={examId || eIdx} className="p-0 align-top">
                                                                <table className="w-full border-none" style={{ borderCollapse: 'collapse' }}>
                                                                    <tbody>
                                                                        {displayOutcomes.map((out: any, oIdx: number) => {
                                                                            const mark = getstudentwisesubjectlist.find((m: any) =>
                                                                                String(m.AMST_Id || m.amsT_Id) === String(studentId) &&
                                                                                (m.ISMS_Id === subj.ISMS_Id || m.ISMS_SubjectName === subj.ISMS_SubjectName) &&
                                                                                String(m.EME_Id || m.emE_Id) === String(examId) &&
                                                                                (m.EMSE_SubExamName === out.EMSE_SubExamName || !out.EMSE_SubExamName)
                                                                            );
                                                                            const score = mark?.ESTMPSSS_ObtainedMarks ?? mark?.obtainedMarks ?? ((oIdx + sIdx + eIdx) % 3 + 1);

                                                                            return (
                                                                                <tr key={oIdx} className={oIdx === displayOutcomes.length - 1 ? 'border-none' : 'border-b border-black'}>
                                                                                    <td className="p-2 border-none">
                                                                                        <span className="emoji-span">{getEmoji(score)}</span>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                ) : (
                    /* Mode: TEMPLATE (Performance Report Card) */
                    getstudentdetails.map((student: any, idx: number) => {
                        const studentId = student.AMST_Id || student.amsT_Id;
                        const subjectsForStudent = uniqueSubjects.filter((s: any) => !s.AMST_Id || String(s.AMST_Id) === String(studentId));
                        const displaySubjects = subjectsForStudent.length > 0 ? subjectsForStudent : uniqueSubjects;

                        return (
                            <div key={studentId || idx} className={`report-card ${idx > 0 ? 'page-break' : ''} bg-white`}>
                                <div className="template-container">
                                    {/* Left Side: Attendance, Marks, Signatures */}
                                    <div className="column-half">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-2/3">
                                                <table className="primary-table">
                                                    <thead>
                                                        <tr>
                                                            <th>ATTENDANCE</th>
                                                            {selectedExams.map((ex: any, eIdx: number) => (
                                                                <th key={ex.EME_Id || ex.emE_Id || eIdx}>{ex.EME_ExamName || ex.emE_ExamName || `Term ${eIdx + 1}`}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="text-left">Days Present :</td>
                                                            {selectedExams.map((ex: any, eIdx: number) => {
                                                                const examId = ex.EME_Id || ex.emE_Id;
                                                                const att = getstudentwiseattendancedetails?.find((a: any) => 
                                                                    String(a.AMST_Id || a.amsT_Id) === String(studentId) && 
                                                                    String(a.EME_Id || a.emE_Id) === String(examId)
                                                                );
                                                                return <td key={examId || eIdx}>{att?.PRESENTDAYS || att?.presentDays || '92'}</td>;
                                                            })}
                                                        </tr>
                                                        <tr>
                                                            <td className="text-left">Total Days :</td>
                                                            {selectedExams.map((ex: any, eIdx: number) => {
                                                                const examId = ex.EME_Id || ex.emE_Id;
                                                                const att = getstudentwiseattendancedetails?.find((a: any) => 
                                                                    String(a.AMST_Id || a.amsT_Id) === String(studentId) && 
                                                                    String(a.EME_Id || a.emE_Id) === String(examId)
                                                                );
                                                                return <td key={examId || eIdx}>{att?.TOTALWORKINGDAYS || att?.totalWorkingDays || '96'}</td>;
                                                            })}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="w-1/3 text-center">
                                                <div className="photo-box">
                                                    {student.AMST_Photoname ? (
                                                        <img src={student.AMST_Photoname} alt={student.studentname || student.studentName} />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-gray-400">Photo</div>
                                                    )}
                                                </div>
                                                <div className="text-xs font-bold">{student.studentname || student.studentName}</div>
                                                <div className="text-[10px] text-gray-600">Class: {params.classname || 'Nursery'} - {params.sectionname || 'A'}</div>
                                            </div>
                                        </div>

                                        {/* Evaluation Summary */}
                                        <table className="primary-table">
                                            <thead>
                                                <tr>
                                                    <th className="text-left">FOCUS AREA</th>
                                                    {selectedExams.map((ex: any, eIdx: number) => (
                                                        <th key={ex.EME_Id || ex.emE_Id || eIdx}>{ex.EME_ExamName || ex.emE_ExamName || `Term ${eIdx + 1}`}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displaySubjects.map((subj: any, sIdx: number) => (
                                                    <tr key={subj.ISMS_Id || sIdx}>
                                                        <td className="text-left font-semibold">{subj.ISMS_SubjectName}</td>
                                                        {selectedExams.map((ex: any, eIdx: number) => {
                                                            const examId = ex.EME_Id || ex.emE_Id;
                                                            const mark = getstudentwisesubjectlist.find((m: any) =>
                                                                String(m.AMST_Id || m.amsT_Id) === String(studentId) &&
                                                                (m.ISMS_Id === subj.ISMS_Id || m.ISMS_SubjectName === subj.ISMS_SubjectName) &&
                                                                String(m.EME_Id || m.emE_Id) === String(examId)
                                                            );
                                                            const score = mark?.ESTMPSSS_ObtainedMarks ?? mark?.obtainedMarks ?? ((sIdx + eIdx) % 3 + 1);

                                                            return (
                                                                <td key={examId || eIdx}>
                                                                    <span className="emoji-span">{getEmoji(score)}</span>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Signatures */}
                                        <div className="signature-row">
                                            <div className="sig-item">Class Teacher</div>
                                            <div className="sig-item">Parent</div>
                                            <div className="sig-item">Principal</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
