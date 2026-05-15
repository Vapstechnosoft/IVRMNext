'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { format } from 'date-fns';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const students = data?.student_list || [];
    const groupwiseexamlist = data?.groupwiseexamlist || data?.exam_list || [];
    const stud_work_attendence = data?.stud_work_attendence || [];
    const stud_present_attendence = data?.stud_present_attendence || [];
    const getstudentwisesubjectlist = data?.getstudentwisesubjectlist || [];

    const handlePrint = () => {
        window.print();
    };

    if (students.length === 0) {
        return (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-700 shadow-sm'>
                No student data found for the selected criteria.
            </div>
        );
    }

    const getAttendance = (studentId: number, list: any[]) => {
        return list.find((a: any) => a.AMST_Id === studentId) || {};
    };

    const getMark = (report: any, subjectId: number, examId: number, examDisplayName: string) => {
        const marks = report.studentmarks || [];
        return marks.find((m: any) => 
            m.ISMS_Id === subjectId && 
            m.EME_Id === examId && 
            m.EMPSG_DisplayName === examDisplayName
        );
    };

    const getSummaryMark = (studentId: number, examId: number, examDisplayName: string, student_marks: any[]) => {
        return student_marks?.find((m: any) => 
            m.EME_Id === examId && 
            m.EMPSG_DisplayName === examDisplayName
        );
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-end gap-2 pb-4 pt-4'>
                <Button onClick={handlePrint} className='bg-primary text-white shadow-md'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
            </div>

            <div ref={reportRef} className='report-container bg-white p-4 font-serif text-[#1a1a1a]'>
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .report-container, .report-container * { visibility: visible; }
                        .report-container { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 100%; 
                            padding: 0 !important; 
                        }
                        @page { size: portrait; margin: 10mm; }
                        .page-break { page-break-after: always; }
                    }
                    .std-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; border: 1px solid black; }
                    .std-table th, .std-table td { border: 1px solid black; padding: 4px 6px; text-align: center; }
                    .std-table th { background-color: #f3f4f6 !important; font-weight: bold; }
                    .header-section { text-align: center; margin-bottom: 20px; }
                    .student-info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; font-size: 12px; }
                    .info-item { display: flex; gap: 5px; }
                    .info-label { font-weight: bold; min-width: 60px; }
                    .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 50px; }
                    .signature-box { border-top: 1px solid black; text-align: center; padding-top: 5px; font-weight: bold; font-size: 11px; }
                    .remarks-box { margin-top: 20px; display: flex; border-bottom: 1px solid black; padding-bottom: 2px; font-size: 12px; }
                ` }} />

                {students.map((report: any, index: number) => (
                    <div key={report.amsT_Id} className={`report-page ${index !== students.length - 1 ? 'page-break' : ''} mb-20`}>
                        {/* Header */}
                        <div className='header-section'>
                            <h2 className='text-xl font-bold'>PROGRESS REPORT</h2>
                            <h3 className='text-lg font-bold'>ACADEMIC YEAR {data.yearname || data.Year_Name}</h3>
                        </div>

                        {/* Student Details */}
                        <div className='student-info-grid'>
                            <div className='space-y-1'>
                                <div className='info-item'><span className='info-label'>NAME</span>: <span>{report.studentname || report.amsT_FirstName}</span></div>
                                <div className='info-item'><span className='info-label'>CLASS TEACHER</span>: <span>{data.clastechname || data.Class_Teacher_Name}</span></div>
                            </div>
                            <div className='space-y-1'>
                                <div className='info-item'><span className='info-label'>CLASS</span>: <span>{report.classname || data.Class_Name}</span></div>
                                <div className='info-item'><span className='info-label'>SECTION</span>: <span>{report.sectionname || data.Section_Name}</span></div>
                            </div>
                            <div className='space-y-1'>
                                <div className='info-item'><span className='info-label'>ADM.NO</span>: <span>{report.admno || report.amsT_AdmNo}</span></div>
                                <div className='info-item'><span className='info-label'>D.O.B</span>: <span>{report.dob ? format(new Date(report.dob), 'dd-MMM-yyyy').toUpperCase() : ''}</span></div>
                            </div>
                        </div>

                        {/* Marks Table */}
                        <table className='std-table'>
                            <thead>
                                <tr>
                                    <th rowSpan={2} className='text-left'>Subject Name</th>
                                    {groupwiseexamlist.map((grpexam: any, i: number) => grpexam.EME_Id !== 9800000 && (
                                        <th key={i}>
                                            {grpexam.examnamedisplay || grpexam.emE_ExamName}<br />
                                            ({grpexam.EMPSGE_ForMaxMarkrs || grpexam.marks})
                                        </th>
                                    ))}
                                    <th rowSpan={1}>Grand Total</th>
                                    <th>Percentage</th>
                                    <th rowSpan={1}>Grade</th>
                                    <th rowSpan={1} className='text-left'>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.studentsubjects?.filter((s: any) => s.EMPS_AppToResultFlg || s.flag).map((subj: any, i: number) => (
                                    <tr key={i}>
                                        <td className='text-left font-bold'>{subj.ISMS_SubjectName}</td>
                                        {groupwiseexamlist.map((grpexam: any, gi: number) => grpexam.EME_Id !== 9800000 && (
                                            <td key={gi}>
                                                {(() => {
                                                    const m = getMark(report, subj.ISMS_Id, grpexam.EME_Id, grpexam.examnamedisplay || grpexam.EMPG_DistplayName);
                                                    if (!m) return '';
                                                    if (['AB', 'M', 'L'].includes(m.PassFailFlag)) return m.PassFailFlag;
                                                    return m.ObtainedMarks;
                                                })()}
                                            </td>
                                        ))}
                                        <td>{subj.ESTMPPS_ObtainedMarks}</td>
                                        <td>{subj.ESTMPPS_ObtainedPercentage}</td>
                                        <td className='font-bold'>{subj.ESTMPPS_ObtainedGrade}</td>
                                        <td className='text-left text-[9px]'>{subj.ESTMPPS_Remarks}</td>
                                    </tr>
                                ))}
                                
                                {/* Total Row */}
                                <tr className='font-bold bg-gray-50'>
                                    <td className='text-left'>TOTAL</td>
                                    {groupwiseexamlist.map((grpexam: any, i: number) => grpexam.EME_Id !== 9800000 && (
                                        <td key={i}>
                                            {getSummaryMark(report.amsT_Id, grpexam.EME_Id, grpexam.examnamedisplay || grpexam.EMPG_DistplayName, report.student_marks)?.ObtainedMarks}
                                        </td>
                                    ))}
                                    <td>
                                        {getstudentwisesubjectlist.find((p_m: any) => p_m.AMST_Id === report.AMST_Id && p_m.ISMS_Id === 900099)?.ESTMPPS_ObtainedMarks || report.TotalMarks}
                                    </td>
                                    <td>{report.TotalMarks}</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                </tr>

                                {/* Percentage Row */}
                                <tr className='font-bold'>
                                    <td className='text-left'>PERCENTAGE</td>
                                    {groupwiseexamlist.map((grpexam: any, i: number) => grpexam.EME_Id !== 9800000 && (
                                        <td key={i}>
                                            {getSummaryMark(report.amsT_Id, grpexam.EME_Id, grpexam.examnamedisplay || grpexam.EMPG_DistplayName, report.student_marks)?.TotalPercentage}%
                                        </td>
                                    ))}
                                    <td>
                                        {getstudentwisesubjectlist.find((p_m: any) => p_m.AMST_Id === report.AMST_Id && p_m.ISMS_Id === 900099)?.ESTMPPS_ObtainedPercentage}
                                    </td>
                                    <td>{report.TotalPercentage}%</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                </tr>

                                {/* Ranks */}
                                <tr>
                                    <td className='text-left font-bold'>RANK IN SECTION</td>
                                    <td colSpan={groupwiseexamlist.length + 3} className='font-bold'>{report.SectionRank}</td>
                                </tr>
                                <tr>
                                    <td className='text-left font-bold'>RANK IN CLASS</td>
                                    <td colSpan={groupwiseexamlist.length + 3} className='font-bold'>{report.ClassRank}</td>
                                </tr>

                                {/* Non-Result Subjects (Co-Scholastic) */}
                                {report.studentsubjects?.filter((s: any) => !s.EMPS_AppToResultFlg && !s.flag).map((subj: any, i: number) => (
                                    <tr key={i}>
                                        <td className='text-left font-bold'>{subj.ISMS_SubjectName}</td>
                                        {groupwiseexamlist.map((grpexam: any, gi: number) => (
                                            <td key={gi}>
                                                {getMark(report, subj.ISMS_Id, grpexam.EME_Id, grpexam.examnamedisplay || grpexam.EMPG_DistplayName)?.ObtainedGrade}
                                            </td>
                                        ))}
                                        <td>{subj.ESTMPPS_ObtainedMarks}</td>
                                        <td className='font-bold'>{subj.ESTMPPS_ObtainedGrade}</td>
                                        <td className='text-left text-[9px]'>{subj.ESTMPPS_Remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Attendance Table */}
                        <table className='std-table mt-4'>
                            <thead>
                                <tr><th colSpan={16}>ATTENDANCE</th></tr>
                                <tr>
                                    <th colSpan={2} className='text-left'>MONTH</th>
                                    <th>JUN</th><th>JUL</th><th>AUG</th><th>SEP</th><th>OCT</th><th>NOV</th><th>DEC</th><th>JAN</th><th>FEB</th><th>MAR</th><th>APR</th><th>MAY</th>
                                    <th>TOTAL</th>
                                    <th>TOTAL%</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={2} className='text-left font-bold'>WORKING DAYS</td>
                                    {['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April', 'May'].map(m => (
                                        <td key={m}>{getAttendance(report.AMST_Id, stud_work_attendence)[m] || ''}</td>
                                    ))}
                                    <td className='font-bold'>{getAttendance(report.AMST_Id, stud_work_attendence).TotalSchoolDays || params.workingDays}</td>
                                    <td className='font-bold'>{getAttendance(report.AMST_Id, stud_work_attendence).Total_Percentage}%</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className='text-left font-bold'>PRESENT DAYS</td>
                                    {['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'Febrauary', 'March', 'April', 'May'].map(m => (
                                        <td key={m}>{getAttendance(report.AMST_Id, stud_present_attendence)[m] || ''}</td>
                                    ))}
                                    <td className='font-bold'>{getAttendance(report.AMST_Id, stud_present_attendence).TotalPresentDays || params.presentDays}</td>
                                    <td className='font-bold'>{getAttendance(report.AMST_Id, stud_present_attendence).Total_Percentage}%</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Remarks */}
                        <div className='remarks-box'>
                            <span className='font-bold mr-2 uppercase'>Class Teacher's Remarks :</span>
                            <div className='flex-1'></div>
                        </div>

                        {/* Footer */}
                        <div className='footer-grid'>
                            <div className='signature-box'>Parent's Signature</div>
                            <div className='signature-box'>Class Teacher's Signature</div>
                            <div className='signature-box'>Principal's Signature</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
