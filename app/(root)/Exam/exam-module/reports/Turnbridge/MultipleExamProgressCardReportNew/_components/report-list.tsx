'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';

/**
 * Multiple Exam Progress Card Report List Component (Portrait Layout)
 */

interface ReportListProps {
    data: any;
    params: any;
}

const getArray = (source: any, keys: string[]) => {
    if (!source) return [];
    if (Array.isArray(source)) return source;
    const dataObj = source.data || source;
    if (Array.isArray(dataObj)) return dataObj;

    for (const k of keys) {
        const val = dataObj[k] ?? source[k];
        if (Array.isArray(val)) return val;
        if (val && Array.isArray(val.$values)) return val.$values;
    }
    for (const k of Object.keys(dataObj)) {
        if (keys.some((key) => key.toLowerCase() === k.toLowerCase())) {
            const val = dataObj[k];
            if (Array.isArray(val)) return val;
            if (val && Array.isArray(val.$values)) return val.$values;
        }
    }
    return [];
};

export const ReportList = ({ data, params }: ReportListProps) => {
    const handlePrint = () => {
        window.print();
    };

    const rawData = data?.data || data || {};

    const rawStudentDetails = getArray(rawData, ['getstudentdetails', 'studentdetails', 'studentlist', 'getstudentlist']);
    const getstudentmarksdetails = getArray(rawData, ['getstudentmarksdetails', 'studentmarksdetails']);
    const getstudentwisesubjectlist = getArray(rawData, ['getstudentwisesubjectlist', 'studentwisesubjectlist']);
    const getexamdetails = getArray(rawData, ['getexamdetails', 'examdetails', 'examList']);
    const work_attendence = getArray(rawData, ['work_attendence', 'work_attendance']);
    const present_attendence = getArray(rawData, ['present_attendence', 'present_attendance']);
    const examwiseremarks = getArray(rawData, ['examwiseremarks', 'getexamwiseremarks', 'remarksdetails']);

    if (!rawStudentDetails || rawStudentDetails.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground'>
                No report data found for the selected criteria.
            </div>
        );
    }

    return (
        <div className='mx-auto w-full max-w-[1100px]'>
            {/* Print Button */}
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print Reports
                </Button>
            </div>

            <div id='report-print-area'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: A4 portrait; margin: 10mm; }
                        body {
                            visibility: hidden;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        #report-print-area, #report-print-area * {
                            visibility: visible;
                        }
                        #report-print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print { display: none !important; }
                        .page-break { page-break-after: always; }
                    }
                    .report-container {
                        width: 100%;
                        margin: 0 auto;
                        padding: 15px;
                        box-sizing: border-box;
                        background-color: #fff;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                        border: 1px solid #004085;
                        font-family: 'Arial', sans-serif;
                        font-size: 12px;
                    }
                    .report-table th, .report-table td {
                        border: 1px solid #004085;
                        padding: 6px;
                        text-align: center;
                    }
                    .report-table th {
                        background-color: #0056b3;
                        color: #ffffff;
                        font-weight: bold;
                    }
                    .text-left { text-align: left !important; }
                    .font-bold { font-weight: bold; }
                    .header-section { text-align: center; margin-bottom: 15px; }
                    .school-name {
                        font-size: 24px;
                        font-weight: 800;
                        color: #1a365d;
                        font-family: 'Times New Roman', serif;
                    }
                    .school-address {
                        font-size: 12px;
                        color: #444;
                        margin-top: 2px;
                    }
                    .report-title {
                        font-size: 15px;
                        font-weight: bold;
                        margin-top: 8px;
                        color: #000;
                    }
                    .student-info-table {
                        width: 100%;
                        margin-bottom: 15px;
                        font-size: 12px;
                        font-family: 'Arial', sans-serif;
                        border-collapse: collapse;
                    }
                    .student-info-table td {
                        padding: 5px 8px;
                        vertical-align: top;
                    }
                `
                    }}
                />

                {rawStudentDetails.map((student: any, index: number) => {
                    const amstId = Number(student.AMST_Id ?? student.amsT_Id ?? student.amst_id ?? index + 1);

                    // Extract Student Information
                    const studentName =
                        student.studentname ||
                        student.studentName ||
                        student.AMST_FirstName ||
                        student.AMST_StudentName ||
                        student.student_Name ||
                        student.amsT_FirstName ||
                        '';
                    const dobRaw = student.dob || student.AMST_DOB || student.amsT_DOB || '';
                    const dobFormatted = dobRaw
                        ? (() => {
                              try {
                                  return format(new Date(dobRaw), 'dd/MM/yyyy');
                              } catch {
                                  return String(dobRaw);
                              }
                          })()
                        : '';
                    const classTeacher = student.clastechname || student.classTeacherName || student.HRME_EmployeeFirstName || '';
                    const className = student.classname || student.className || student.ASMCL_ClassName || params?.classname || '';
                    const sectionName = student.sectionname || student.sectionName || student.ASMC_SectionName || params?.sectionname || '';
                    const rollNo = student.rollno ?? student.AMST_RollNo ?? student.amaY_RollNo ?? '';
                    const admNo = student.admno || student.AMST_AdmNo || student.amsT_AdmNo || '';

                    // Student Marks
                    const studentMarks =
                        student.marks && student.marks.length > 0
                            ? student.marks
                            : getstudentmarksdetails.filter(
                                  (m: any) => Number(m.AMST_Id ?? m.amsT_Id) === amstId || rawStudentDetails.length === 1
                              );

                    // Student Subjects
                    let studentSubjects =
                        student.subjects && student.subjects.length > 0
                            ? student.subjects
                            : getstudentwisesubjectlist.filter((s: any) => Number(s.AMST_Id ?? s.amsT_Id) === amstId);

                    if (studentSubjects.length === 0 && getstudentwisesubjectlist.length > 0) {
                        studentSubjects = getstudentwisesubjectlist;
                    }

                    if (studentSubjects.length === 0 && studentMarks.length > 0) {
                        const subMap = new Map();
                        studentMarks.forEach((m: any) => {
                            const id = Number(m.ISMS_Id ?? m.ismS_Id);
                            const name = m.ISMS_SubjectName || m.ismS_SubjectName;
                            if (id > 0 && name && !subMap.has(id)) {
                                subMap.set(id, { ISMS_Id: id, ISMS_SubjectName: name, EYCES_AplResultFlg: true });
                            }
                        });
                        studentSubjects = Array.from(subMap.values());
                    }

                    // Separate Scholastic & Non-Scholastic
                    const scholasticSubjects = studentSubjects.filter((s: any) => {
                        const flag = s.EYCES_AplResultFlg ?? s.eyceS_AplResultFlg ?? s.eyces_aplresultflg;
                        return flag === undefined || flag === true || flag === 1;
                    });
                    const nonScholasticSubjects = studentSubjects.filter((s: any) => {
                        const flag = s.EYCES_AplResultFlg ?? s.eyceS_AplResultFlg ?? s.eyces_aplresultflg;
                        return flag === false || flag === 0;
                    });

                    // Attendance matching
                    const studentWorkAtt =
                        work_attendence?.find((a: any) => Number(a.AMST_Id ?? a.amsT_Id) === amstId) || work_attendence?.[index];
                    const studentPresAtt =
                        present_attendence?.find((a: any) => Number(a.AMST_Id ?? a.amsT_Id) === amstId) || present_attendence?.[index];

                    return (
                        <div
                            key={amstId || index}
                            className={`report-container ${index !== rawStudentDetails.length - 1 ? 'page-break' : ''} mb-8`}>
                            {/* School Header */}
                            <div className='header-section'>
                                <div className='mb-2 flex items-center justify-center gap-4'>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/Logo02.jpg'
                                        alt='Tunbridge High School Logo'
                                        className='h-20 w-auto'
                                        onError={(e: any) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <div>
                                        <div className='school-name'>Tunbridge High School</div>
                                        <div className='school-address'>86/2 Infantry Road, Bangalore, Karnataka, India 560001</div>
                                        <div className='school-address'>Mail Id: tunbridgehs@gmail.com</div>
                                    </div>
                                </div>
                                <div className='report-title uppercase'>PROGRESS REPORT</div>
                                <div className='report-title text-sm uppercase'>
                                    ACADEMIC YEAR {params?.academicYearName || '2024-2025'}
                                </div>
                            </div>

                            {/* Student Information */}
                            <table className='student-info-table'>
                                <tbody>
                                    <tr>
                                        <td width='35%'>
                                            <div className='flex justify-between'>
                                                <b>NAME</b> <span>: {studentName}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>D.O.B</b> <span>: {dobFormatted}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>CLASS TEACHER</b> <span>: {classTeacher}</span>
                                            </div>
                                        </td>
                                        <td width='30%'>
                                            <div className='flex justify-between'>
                                                <b>CLASS</b> <span>: {className}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>ROLL NO</b> <span>: {rollNo}</span>
                                            </div>
                                        </td>
                                        <td width='35%'>
                                            <div className='flex justify-between'>
                                                <b>SECTION</b> <span>: {sectionName}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>ADM. NO</b> <span>: {admNo}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Main Marks Table */}
                            <table className='report-table'>
                                <thead>
                                    <tr>
                                        <th className='text-left font-bold' width='220'>
                                            SUBJECTS
                                        </th>
                                        {getexamdetails.map((exam: any) => {
                                            const examId = Number(exam.emE_Id ?? exam.EME_Id);
                                            const examName = exam.emE_ExamName || exam.EME_ExamName || '';
                                            const maxMarks = exam.eyceS_MaxMarks ?? exam.eyces_maxmarks ?? exam.maxMarks ?? '';
                                            return (
                                                <th key={examId} className='font-bold'>
                                                    {examName} <br />
                                                    {maxMarks ? `${maxMarks}` : ''}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Scholastic Subjects */}
                                    {scholasticSubjects.map((sub: any) => {
                                        const subId = Number(sub.ISMS_Id ?? sub.ismS_Id);
                                        const subName = sub.ISMS_SubjectName || sub.ismS_SubjectName || sub.subjectName || '';
                                        return (
                                            <tr key={subId || subName}>
                                                <td className='text-left font-bold'>{subName}</td>
                                                {getexamdetails.map((exam: any) => {
                                                    const examId = Number(exam.emE_Id ?? exam.EME_Id);
                                                    const examName = exam.emE_ExamName || exam.EME_ExamName || '';
                                                    const mark = studentMarks.find(
                                                        (m: any) =>
                                                            Number(m.EME_Id ?? m.emE_Id) === examId &&
                                                            (Number(m.ISMS_Id ?? m.ismS_Id) === subId ||
                                                                (m.ismS_SubjectName || m.ISMS_SubjectName) === subName)
                                                    );
                                                    const conduct = mark?.ExamConductFlag ?? mark?.examConductFlag ?? 1;
                                                    const passOrFail = mark?.PASSORFAIL || mark?.passOrFail;
                                                    const val =
                                                        passOrFail === 'AB' || passOrFail === 'OD' || passOrFail === 'M'
                                                            ? passOrFail
                                                            : examName === 'Grade'
                                                              ? mark?.GRADE || mark?.grade || ''
                                                              : (mark?.OBTAINEDMARKS ??
                                                                mark?.obtainedMarks ??
                                                                mark?.ESTMP_ObtainedMarks ??
                                                                '');

                                                    return <td key={examId}>{conduct === 1 ? (val ?? '--') : '--'}</td>;
                                                })}
                                            </tr>
                                        );
                                    })}

                                    {/* Grand Total Row */}
                                    <tr className='bg-blue-50 font-bold'>
                                        <td className='text-left uppercase'>GRAND TOTAL</td>
                                        {getexamdetails.map((exam: any) => {
                                            const examId = Number(exam.emE_Id ?? exam.EME_Id);
                                            const mark = studentMarks.find(
                                                (m: any) =>
                                                    Number(m.EME_Id ?? m.emE_Id) === examId && Number(m.ISMS_Id ?? m.ismS_Id) === 50001
                                            );
                                            return <td key={examId}>{mark?.OBTAINEDMARKS ?? mark?.obtainedMarks ?? '--'}</td>;
                                        })}
                                    </tr>

                                    {/* Non-Scholastic Subjects */}
                                    {nonScholasticSubjects.map((sub: any) => {
                                        const subId = Number(sub.ISMS_Id ?? sub.ismS_Id);
                                        const subName = sub.ISMS_SubjectName || sub.ismS_SubjectName || sub.subjectName || '';
                                        return (
                                            <tr key={subId || subName}>
                                                <td className='text-left font-bold'>{subName}</td>
                                                {getexamdetails.map((exam: any) => {
                                                    const examId = Number(exam.emE_Id ?? exam.EME_Id);
                                                    const examName = exam.emE_ExamName || exam.EME_ExamName || '';
                                                    const mark = studentMarks.find(
                                                        (m: any) =>
                                                            Number(m.EME_Id ?? m.emE_Id) === examId &&
                                                            (Number(m.ISMS_Id ?? m.ismS_Id) === subId ||
                                                                (m.ismS_SubjectName || m.ISMS_SubjectName) === subName)
                                                    );
                                                    const conduct = mark?.ExamConductFlag ?? mark?.examConductFlag ?? 1;
                                                    const passOrFail = mark?.PASSORFAIL || mark?.passOrFail;
                                                    const val =
                                                        passOrFail === 'AB' || passOrFail === 'OD' || passOrFail === 'M'
                                                            ? passOrFail
                                                            : examName === 'Grade'
                                                              ? mark?.GRADE || mark?.grade || ''
                                                              : (mark?.OBTAINEDMARKS ?? mark?.obtainedMarks ?? '');

                                                    return <td key={examId}>{conduct === 1 ? (val ?? '--') : '--'}</td>;
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Exam Wise Remarks */}
                            <table className='report-table'>
                                <thead>
                                    <tr>
                                        <th colSpan={2} className='font-bold uppercase'>
                                            EXAM WISE REMARKS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getexamdetails
                                        .filter(
                                            (e: any) =>
                                                (e.emE_ExamName || e.EME_ExamName) !== 'Total' &&
                                                (e.emE_ExamName || e.EME_ExamName) !== 'Grade'
                                        )
                                        .map((exam: any) => {
                                            const examId = Number(exam.emE_Id ?? exam.EME_Id);
                                            const examName = exam.emE_ExamName || exam.EME_ExamName || '';
                                            const totalMark = studentMarks.find(
                                                (m: any) =>
                                                    Number(m.EME_Id ?? m.emE_Id) === examId && Number(m.ISMS_Id ?? m.ismS_Id) === 50001
                                            );
                                            const remarkObj =
                                                examwiseremarks.find((r: any) => Number(r.EME_Id ?? r.emE_Id) === examId) || totalMark;
                                            const remarks = remarkObj?.EMGD_Remarks || remarkObj?.emgd_Remarks || remarkObj?.remarks || '';
                                            return (
                                                <tr key={examId}>
                                                    <td className='w-1/3 text-left font-bold'>{examName}</td>
                                                    <td className='text-left'>{remarks}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>

                            {/* Attendance Table */}
                            {params?.showAttendance !== false && (
                                <table className='report-table text-[11px]'>
                                    <thead>
                                        <tr className='font-bold uppercase'>
                                            <th colSpan={15}>ATTENDANCE</th>
                                        </tr>
                                        <tr className='font-bold'>
                                            <th>MONTH</th>
                                            {['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'].map(
                                                (m) => (
                                                    <th key={m}>{m}</th>
                                                )
                                            )}
                                            <th>TOTAL</th>
                                            <th>TOTAL %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='text-left font-bold'>WORKING DAYS</td>
                                            <td>{studentWorkAtt?.May ?? studentWorkAtt?.may ?? 0}</td>
                                            <td>{studentWorkAtt?.June ?? studentWorkAtt?.june ?? 0}</td>
                                            <td>{studentWorkAtt?.July ?? studentWorkAtt?.july ?? 0}</td>
                                            <td>{studentWorkAtt?.August ?? studentWorkAtt?.august ?? 0}</td>
                                            <td>{studentWorkAtt?.September ?? studentWorkAtt?.september ?? 0}</td>
                                            <td>{studentWorkAtt?.October ?? studentWorkAtt?.october ?? 0}</td>
                                            <td>{studentWorkAtt?.November ?? studentWorkAtt?.november ?? 0}</td>
                                            <td>{studentWorkAtt?.December ?? studentWorkAtt?.december ?? 0}</td>
                                            <td>{studentWorkAtt?.January ?? studentWorkAtt?.january ?? 0}</td>
                                            <td>{studentWorkAtt?.Febrauary ?? studentWorkAtt?.february ?? 0}</td>
                                            <td>{studentWorkAtt?.March ?? studentWorkAtt?.march ?? 0}</td>
                                            <td>{studentWorkAtt?.April ?? studentWorkAtt?.april ?? 0}</td>
                                            <td className='font-bold'>
                                                {studentWorkAtt?.TotalWorkingDays ?? studentWorkAtt?.totalWorkingDays ?? 0}
                                            </td>
                                            <td className='font-bold'>
                                                {studentWorkAtt?.Total_Percentage ?? studentWorkAtt?.total_Percentage ?? 0}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-left font-bold'>PRESENT DAYS</td>
                                            <td>{studentPresAtt?.May ?? studentPresAtt?.may ?? 0}</td>
                                            <td>{studentPresAtt?.June ?? studentPresAtt?.june ?? 0}</td>
                                            <td>{studentPresAtt?.July ?? studentPresAtt?.july ?? 0}</td>
                                            <td>{studentPresAtt?.August ?? studentPresAtt?.august ?? 0}</td>
                                            <td>{studentPresAtt?.September ?? studentPresAtt?.september ?? 0}</td>
                                            <td>{studentPresAtt?.October ?? studentPresAtt?.october ?? 0}</td>
                                            <td>{studentPresAtt?.November ?? studentPresAtt?.november ?? 0}</td>
                                            <td>{studentPresAtt?.December ?? studentPresAtt?.december ?? 0}</td>
                                            <td>{studentPresAtt?.January ?? studentPresAtt?.january ?? 0}</td>
                                            <td>{studentPresAtt?.Febrauary ?? studentPresAtt?.february ?? 0}</td>
                                            <td>{studentPresAtt?.March ?? studentPresAtt?.march ?? 0}</td>
                                            <td>{studentPresAtt?.April ?? studentPresAtt?.april ?? 0}</td>
                                            <td className='font-bold'>
                                                {studentPresAtt?.TotalPresentDays ?? studentPresAtt?.totalPresentDays ?? 0}
                                            </td>
                                            <td className='font-bold'>
                                                {studentPresAtt?.Total_Percentage ?? studentPresAtt?.total_Percentage ?? 0}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}

                            {/* Signatures */}
                            <div className='mt-12 flex items-center justify-between border-gray-400 border-t pt-6 font-bold text-xs uppercase'>
                                <div>PRINCIPAL&apos;S SIGNATURE</div>
                                <div>CLASS TEACHER&apos;S SIGNATURE</div>
                                <div>PARENT&apos;S SIGNATURE</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
