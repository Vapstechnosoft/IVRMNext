'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

interface SopiaReportViewProps {
    data: {
        apiData: any;
        payload: any;
    };
}

export default function SopiaExamReportItoIVView({ data }: SopiaReportViewProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const { apiData, payload } = data;

    const students = apiData.examwisedetailsnew || [];
    const activities = apiData.getstudentwiseactiviteslist || [];
    const strength = apiData.examwisemarksprocess?.[0] || {};
    const attendance = apiData.work_attendence || [];
    const performance = apiData.examwisemarksprocess1 || [];
    const remarks = apiData.getpromotionremarksdetails || [];

    // Grouping subjects by student
    const getStudentMarks = (amstId: number) => {
        return students.filter((s: any) => s.AMST_Id === amstId);
    };

    const getStudentActivities = (amstId: number) => {
        const studentActs = activities.filter((a: any) => a.AMST_Id === amstId);
        // Group by category if needed, but legacy shows them in a list
        return studentActs;
    };

    const getStudentPerformance = (amstId: number) => {
        return performance.filter((p: any) => p.AMST_Id === amstId);
    };

    const getStudentRemarks = (amstId: number) => {
        return remarks.find((r: any) => r.amsT_Id === amstId)?.ecterE_Remarks || '';
    };

    const getUniqueSubjects = (amstId: number) => {
        const studentPerf = getStudentPerformance(amstId);
        const subjects = Array.from(new Set(studentPerf.map((p: any) => p.TTMSUAB_Abbreviation)));
        return subjects;
    };

    const handlePrint = () => {
        if (!reportRef.current) return;
        const printContents = reportRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        const popupWin = window.open('', '_blank', 'width=800,height=900');
        popupWin?.document.open();
        popupWin?.document.write(`
            <html>
                <head>
                    <title>Sophia Exam Report I to IV</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; font-family: 'Times New Roman', serif; }
                            .page-break { page-break-after: always; }
                            .no-print { display: none; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                            th, td { border: 1px solid black; padding: 4px; text-align: center; font-size: 12px; }
                            .text-left { text-align: left; }
                            .text-right { text-align: right; }
                            .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }
                            .student-info { border: 1px solid black; padding: 10px; margin-bottom: 10px; }
                            .info-row { display: flex; margin-bottom: 2px; }
                            .info-label { width: 150px; }
                            .info-value { flex: 1; }
                            .remarks-box { border: 1px solid black; padding: 10px; margin-top: 10px; height: 60px; }
                            .footer-signatures { display: flex; justify-content: space-between; margin-top: 40px; }
                            .footer-signatures div { width: 30%; text-align: center; border-top: 1px solid black; padding-top: 5px; }
                            .co-scholastic-header { background: #f0f0f0; font-weight: bold; padding: 5px; border: 1px solid black; text-align: center; }
                        }
                        body { font-family: 'Times New Roman', serif; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                        th, td { border: 1px solid black; padding: 4px; text-align: center; font-size: 14px; }
                        .text-left { text-align: left; }
                        .text-right { text-align: right; }
                        .report-container { width: 210mm; margin: auto; padding: 10mm; background: white; border: 1px solid #ccc; }
                        .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; margin-top: 50px; }
                        .student-info { border: 1px solid black; padding: 10px; margin-bottom: 10px; }
                        .info-row { display: flex; margin-bottom: 2px; }
                        .info-label { width: 150px; font-weight: bold; }
                        .remarks-box { border: 1px solid black; padding: 10px; margin-top: 10px; min-height: 60px; }
                        .footer-signatures { display: flex; justify-content: space-between; margin-top: 60px; }
                        .footer-signatures div { width: 30%; text-align: center; font-weight: bold; }
                        .co-scholastic-header { background: #f0f0f0; font-weight: bold; padding: 5px; border: 1px solid black; text-align: center; margin-top: 15px; }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${printContents}
                </body>
            </html>
        `);
        popupWin?.document.close();
    };

    const groupedStudents = students.reduce((acc: any[], curr: any) => {
        if (!acc.some(s => s.AMST_Id === curr.AMST_Id)) {
            acc.push(curr);
        }
        return acc;
    }, []);

    return (
        <div className='space-y-4'>
            <div className='flex justify-end pr-4'>
                <Button onClick={handlePrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print Report
                </Button>
            </div>

            <div ref={reportRef} className='bg-gray-100 p-4'>
                {groupedStudents.map((student: any, idx: number) => {
                    const studentMarks = getStudentMarks(student.AMST_Id);
                    const studentAtt = attendance.find((a: any) => a.AMST_Id === student.AMST_Id) || {};
                    const studentActs = getStudentActivities(student.AMST_Id);
                    const studentPerf = getStudentPerformance(student.AMST_Id);
                    const subjects = getUniqueSubjects(student.AMST_Id);
                    const studentRemark = getStudentRemarks(student.AMST_Id);

                    return (
                        <div key={student.AMST_Id} className='report-container page-break mb-8'>
                            {/* Header Section */}
                            <div className='header-info'>
                                <div className='text-right w-full flex justify-between px-4'>
                                    <span>{payload.examName}</span>
                                    <span>{payload.yearName}</span>
                                </div>
                            </div>

                            {/* Student Profile */}
                            <div className='student-info'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-1'>
                                        <div className='flex'><span className='w-32 font-bold'>Name</span>: {student.AMST_FirstName} {student.AMST_MiddleName} {student.AMST_LastName}</div>
                                        <div className='flex'><span className='w-32 font-bold'>Class & Division</span>: {student.ASMCL_ClassName} {student.ASMC_SectionName}</div>
                                        <div className='flex'><span className='w-32 font-bold'>Date of Birth</span>: {student.AMST_DOB ? format(new Date(student.AMST_DOB), 'dd-MMM-yyyy') : ''}</div>
                                        <div className='flex'><span className='w-32 font-bold'>Student House</span>: {student.SPCCMH_HouseName}</div>
                                    </div>
                                    <div className='space-y-1'>
                                        <div className='flex'><span className='w-40 font-bold'>Standard Strength</span>: {strength.classstrength}</div>
                                        <div className='flex'><span className='w-40 font-bold'>Division Strength</span>: {strength.Sectionstrength}</div>
                                        <div className='flex'><span className='w-40 font-bold'>Attendance</span>: {studentAtt.TotalWorkingDays}/{studentAtt.TotalSchoolDays}</div>
                                        <div className='flex'><span className='w-40 font-bold'>Attendance %</span>: {studentAtt.Total_Percentage?.toFixed(0)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <table>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={{ width: '50px' }}>SL.No</th>
                                        <th rowSpan={2}>Subjects</th>
                                        <th colSpan={3}>Marks</th>
                                    </tr>
                                    <tr>
                                        <th style={{ width: '60px' }}>Max</th>
                                        <th style={{ width: '60px' }}>Min</th>
                                        <th style={{ width: '100px' }}>Obtained</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentMarks.filter((m:any) => m.SUBJECTGROUP !== 'AVERAGE').map((mark: any, midx: number) => (
                                        <tr key={midx}>
                                            <td>{mark.ROWNUMBER || midx + 1}</td>
                                            <td className='text-left font-bold'>{mark.ISMS_SubjectName}</td>
                                            <td>{mark.EYCES_MaxMarks}</td>
                                            <td>{mark.EYCES_MinMarks}</td>
                                            <td className='font-bold'>
                                                {mark.ESTMPS_ObtainedMarks}
                                                {mark.ESTMPS_ObtainedMarks < mark.EYCES_MinMarks && ' (F)'}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Empty row for spacing like legacy */}
                                    <tr style={{ height: '30px' }}><td colSpan={5}></td></tr>
                                    <tr className='font-bold'>
                                        <td></td>
                                        <td className='text-right'>TOTAL</td>
                                        <td>{studentMarks[0]?.ESTMPS_Marks_Max}</td>
                                        <td>{studentMarks[0]?.ESTMPS_Marks_Min}</td>
                                        <td>{studentMarks[0]?.ESTMPS_Marks_Total}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Percentage and Position */}
                            <div className='border border-t-0 p-2'>
                                <div>Percentage: {studentMarks[0]?.ESTMP_Percentage?.toFixed(0)}</div>
                            </div>
                            <div className='border border-t-0 p-2'>
                                <div>Position: {studentMarks[0]?.ESTMP_Result === 'Pass' ? studentMarks[0]?.ESTMP_ClassRank : ''}</div>
                            </div>

                            {/* Co-Scholastic Subjects */}
                            <div className='co-scholastic-header'>CO-SCHOLASTIC SUBJECTS</div>
                            <table>
                                <tbody>
                                    {studentActs.map((act: any, aix: number) => (
                                        <tr key={aix}>
                                            <td style={{ width: '50px' }}>{aix + 1}</td>
                                            <td className='text-left'>{act.ECACTA_SkillArea}</td>
                                            <td style={{ width: '100px' }}>{act.EMGD_Name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Performance of the Year */}
                            <div className='text-center font-bold mt-4 mb-2'>PERFORMANCE OF THE YEAR</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>Sl.No</th>
                                        <th style={{ width: '250px' }}>Examination</th>
                                        {subjects.map((sub: any) => (
                                            <th key={sub}>{sub}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {['First Unit Test', 'First Term Examination', 'Second Unit Test'].map((examName, eidx) => (
                                        <tr key={examName}>
                                            <td>{eidx + 1}</td>
                                            <td className='text-left'>{examName}</td>
                                            {subjects.map((sub: any) => {
                                                const mark = studentPerf.find((p: any) => p.EME_ExamName === examName && p.TTMSUAB_Abbreviation === sub);
                                                return (
                                                    <td key={sub}>
                                                        {mark ? (
                                                            <>
                                                                {mark.ESTMPS_ObtainedMarks}/{mark.ESTMPS_MaxMarks}
                                                                {mark.ESTMPS_ObtainedMarks < mark.ESTMPS_MinMarks && ' (F)'}
                                                            </>
                                                        ) : '-'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Remarks */}
                            <div className='remarks-box'>
                                Teacher's Remarks : <strong>{studentRemark}</strong>
                            </div>

                            {/* Signatures */}
                            <div className='footer-signatures'>
                                <div>CLASS TEACHER</div>
                                <div>PRINCIPAL</div>
                                <div>PARENT</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
