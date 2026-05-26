'use client';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface StJamesIVReportListProps {
    data: any;
    institution: any;
}

export default function StJamesIVReportList({ data, institution }: StJamesIVReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    const _handleExport = () => {};

    // Prepare data
    const getstudentdetails = data?.getstudentdetails || [];
    const getexamdetails = data?.getexamdetails || [];
    const getstudentmarksdetails = data?.getstudentmarksdetails || [];
    const getstudentwisesubjectlistnew = data?.getstudentwisesubjectlistnew || [];
    const getexamwisetotaldetails = data?.getexamwisetotaldetails || [];
    const getstudentwiseattendancedetails = data?.getstudentwiseattendancedetails || [];
    const year = data?.year || '';
    const displayAttendance = data?.displayAttendance || false;

    const tempexamdetails: any[] = [];
    getexamdetails.forEach((exam: any) => {
        tempexamdetails.push({ ...exam, columname: 'Marks', EME_Id: exam.emE_Id });
    });

    const students = getstudentdetails.map((student: any) => {
        const studentId = student.amsT_Id || student.AMST_Id;
        const subjects = getstudentwisesubjectlistnew.filter((s: any) => Number(s.amsT_Id || s.AMST_Id) === Number(studentId)) || [];
        const marks = getstudentmarksdetails.filter((m: any) => Number(m.amsT_Id || m.AMST_Id) === Number(studentId)) || [];
        const markstotal = getexamwisetotaldetails.filter((t: any) => Number(t.amsT_Id || t.AMST_Id) === Number(studentId)) || [];
        const attendance = getstudentwiseattendancedetails.filter((a: any) => Number(a.amsT_Id || a.AMST_Id) === Number(studentId)) || [];
        return {
            ...student,
            subjects,
            marks,
            markstotal,
            attendance
        };
    });

    const getMarksDisplay = (mrks: any, colm: any) => {
        if (!mrks) return '';
        if (colm.columname === 'Marks') {
            if (mrks.PassFailFlg === 'AB' && mrks.complusoryflag !== 'C') return mrks.PassFailFlg;
            if (mrks.PassFailFlg === 'AB' && mrks.complusoryflag === 'C') return mrks.PassFailFlg;
            if (mrks.PassFailFlg === 'Fail' && mrks.complusoryflag === 'C') return <span className='underline'>{mrks.obtainmarks}</span>;
            if (mrks.PassFailFlg === 'Fail' && mrks.complusoryflag !== 'C') return <span className='underline'>{mrks.obtainmarks}</span>;
            return mrks.obtainmarks;
        }
        if (colm.columname === 'Point' && colm.emE_ExamDescription !== 'UAT') {
            if (mrks.PassFailFlg === 'AB' && mrks.complusoryflag !== 'C') return mrks.PassFailFlg;
            if (mrks.PassFailFlg === 'Fail' && mrks.complusoryflag !== 'C')
                return <span className='underline'>{mrks.ObtainedGradePoints}</span>;
            return mrks.ObtainedGradePoints;
        }
        return '';
    };

    const getGradeDisplay = (mrks: any, colm: any) => {
        if (!mrks) return '';
        if (colm.columname === 'Marks') {
            if (mrks.PassFailFlg === 'AB' && mrks.complusoryflag !== 'C') return mrks.PassFailFlg;
            if (mrks.PassFailFlg === 'AB' && mrks.complusoryflag === 'C') return mrks.PassFailFlg;
            if (mrks.PassFailFlg === 'Fail' && mrks.complusoryflag === 'C' && mrks.Marksdispaly === 1)
                return <span className='underline'>{mrks.obtainmarks}</span>;
            if (mrks.PassFailFlg === 'Fail' && mrks.complusoryflag !== 'C' && mrks.Marksdispaly === 1)
                return <span className='underline'>{mrks.obtainmarks}</span>;
            if (mrks.PassFailFlg !== 'Fail' && mrks.PassFailFlg !== 'AB' && mrks.Marksdispaly === 1) return mrks.obtainmarks;

            if (mrks.PassFailFlg === 'Fail' && mrks.complusoryflag === 'C' && mrks.Gradedisplay === 1)
                return <span className='underline'>{mrks.ObtainedGrade}</span>;
            if (mrks.PassFailFlg === 'Fail' && mrks.complusoryflag !== 'C' && mrks.Gradedisplay === 1)
                return <span className='underline'>{mrks.ObtainedGrade}</span>;
            if (mrks.PassFailFlg !== 'Fail' && mrks.PassFailFlg !== 'AB' && mrks.Gradedisplay === 1) return mrks.ObtainedGrade;
        }
        return '';
    };

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return Number.isNaN(d.getTime())
            ? date
            : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    };

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
              display: none;
            }
            .page-break {
              page-break-before: always;
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
            </div>

            <div className='w-full bg-white p-8' id='printable-area'>
                {students.map((report: any, idx: number) => (
                    <div key={idx} className={idx > 0 ? 'page-break mt-16' : ''}>
                        {/* Header Section */}
                        <div className='mb-6 flex flex-col text-sm'>
                            <div className='mb-6 text-center font-bold text-lg'>ACADEMIC YEAR {year}</div>

                            <div className='mb-2 flex justify-between font-bold'>
                                <div className='w-1/3'>{report.studentname}</div>
                                <div className='flex w-1/3 justify-between'>
                                    <span>
                                        Class : {report.classname} {report.sectionname}
                                    </span>
                                    <span>Roll : {report.rollno}</span>
                                </div>
                                <div className='w-1/3 text-right'>Reg.No.: {report.admno}</div>
                            </div>

                            <div className='flex justify-between font-bold'>
                                <div className='w-1/3'>{report.spccmH_HouseName}</div>
                                <div className='w-1/3 text-center'>Number of boys in class : {report.totalboys}</div>
                                <div className='w-1/3 text-right'>D.O.B : {formatDate(report.dob)}</div>
                            </div>
                        </div>

                        {/* Grades Table */}
                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border-2 border-gray-400 text-center font-bold text-sm'>
                                <thead className='border-gray-400 border-b-0 border-double'>
                                    <tr>
                                        <td rowSpan={2} className='w-[250px] border border-gray-400 bg-white p-2' />
                                        {getexamdetails.map((exam: any, eIdx: number) => {
                                            return (
                                                <td
                                                    key={`exam-${eIdx}`}
                                                    colSpan={1}
                                                    className='border border-gray-400 bg-white p-2 text-center'>
                                                    {exam.emE_ExamName}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        {tempexamdetails.map((colm: any, cIdx: number) => (
                                            <td key={`col-${cIdx}`} className='border border-gray-400 bg-white p-2 text-center'>
                                                {colm.columname}
                                            </td>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='border-gray-400 border-t-0 border-double'>
                                    {report.subjects
                                        .filter((s: any) => s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={`subj-${sIdx}`}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>
                                                    {subj.ismS_SubjectName || subj.subjectname || ''}
                                                </td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = report.marks.find(
                                                        (m: any) => m.emeid === colm.EME_Id && m.subjectorder === subj.subjectorder
                                                    );
                                                    return (
                                                        <td key={`mark-${cIdx}`} className='border border-gray-400 p-2 text-center'>
                                                            {getMarksDisplay(mrks, colm)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>

                                <tbody>
                                    <tr className='border-none'>
                                        <td className='border-none p-2' colSpan={tempexamdetails.length + 1}>
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>

                                <tbody className='border-gray-400 border-double'>
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left'>Total</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find(
                                                (t: any) =>
                                                    t.emE_Id === colm.EME_Id && colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2'
                                            );
                                            return (
                                                <td key={`tot-${cIdx}`} className='border border-gray-400 p-2 text-center'>
                                                    {totl ? (colm.columname === 'Marks' ? totl.estmP_TotalObtMarks : '') : ''}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {report.subjects
                                        .filter((s: any) => !s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={`subj-non-${sIdx}`}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>
                                                    {subj.ismS_SubjectName || subj.subjectname || ''}
                                                </td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = report.marks.find(
                                                        (m: any) => m.emeid === colm.EME_Id && m.subjectorder === subj.subjectorder
                                                    );
                                                    return (
                                                        <td key={`mark-non-${cIdx}`} className='border border-gray-400 p-2 text-center'>
                                                            {getGradeDisplay(mrks, colm)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Extra Details */}
                        <div className='mt-8 font-bold text-sm'>
                            <div className='mb-4 flex'>
                                <div className='w-[20%]'>Class Teacher's Comment :</div>
                                <div className='w-[80%] border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>
                            <div className='mb-4 flex'>
                                <div className='w-full border-black border-b'>&nbsp;</div>
                            </div>

                            {displayAttendance && (
                                <div className='mb-4 flex'>
                                    <div className='w-[15%]'>Attendance</div>
                                    <div className='w-[25%] border-black border-b'>&nbsp;</div>
                                    <div className='w-[15%] text-center'>days out of</div>
                                    <div className='w-[45%] border-black border-b'>&nbsp;</div>
                                </div>
                            )}

                            <div className='mb-4 flex'>
                                <div className='w-[10%]'>Club</div>
                                <div className='w-[90%] border-black border-b'>&nbsp;</div>
                            </div>

                            <div className='mb-4 flex'>
                                <div className='w-[10%]'>Awards</div>
                                <div className='w-[90%] border-black border-b'>&nbsp;</div>
                            </div>

                            <div className='mb-12 flex justify-end'>
                                <div>Promotion Granted/Refused</div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className='mt-10 font-bold text-sm'>
                            <div className='mt-16 flex justify-between'>
                                <div className='flex flex-col items-start'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm lowercase capitalize first-letter:capitalize'>
                                        {report.Classteacher || report.classteacher || 'Class Teacher'}
                                    </div>
                                    <div className='font-bold text-sm'>&emsp; Class Teacher</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Mrs.B.Mathew</div>
                                    <div className='font-bold text-sm'>Junior Head</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Dr.T.H.Ireland</div>
                                    <div className='font-bold text-sm'>Principal</div>
                                </div>
                                <div className='flex flex-col items-end text-right '>
                                    <div className='mt-[2px] w-32 border-black border-t-[1.5px] pt-1 font-bold text-sm'>Parent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
