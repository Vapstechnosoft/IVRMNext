'use client';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface StJamesXI_XIIReportListProps {
    data: any;
    reporttype: string;
    displayAttendance: boolean;
}

export default function StJamesXI_XIIReportList({ data, reporttype, displayAttendance }: StJamesXI_XIIReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    const getstudentdetails = data?.getstudentdetails || [];
    const getexamdetails = data?.getexamdetails || [];
    const getstudentmarksdetails = data?.getstudentmarksdetails || [];
    const getstudentwisesubjectlistnew = data?.getstudentwisesubjectlistnew || [];
    const getexamwisetotaldetails = data?.getexamwisetotaldetails || [];
    const getstudentwiseattendancedetails = data?.getstudentwiseattendancedetails || [];
    const year = data?.year || '';

    const tempexamdetails: any[] = [];
    if (reporttype === 'indi') {
        getexamdetails.forEach((exam: any) => {
            tempexamdetails.push({ ...exam, EME_Id: exam.emE_Id, columname: 'Marks', emE_ExamCode: exam.emE_ExamCode });
            tempexamdetails.push({ ...exam, EME_Id: exam.emE_Id, columname: 'Point', emE_ExamCode: exam.emE_ExamCode });
        });
    } else {
        // Promotion
        const promoExamDetails = [...getexamdetails, { empG_GroupName: 'Final Average', empsG_Order: 10001 }];
        promoExamDetails.forEach((dd: any) => {
            tempexamdetails.push({ Groupname: dd.empG_GroupName, columnid: dd.empsG_Order, columname: 'Marks' });
            tempexamdetails.push({ Groupname: dd.empG_GroupName, columnid: dd.empsG_Order, columname: 'Point' });
        });
    }

    const students = getstudentdetails.map((student: any) => {
        const studentId = student.amsT_Id || student.AMST_Id;
        const subjects = getstudentwisesubjectlistnew
            .filter((sub: any) => Number(sub.amsT_Id || sub.AMST_Id) === Number(studentId))
            .map((sub: any) => ({
                ismS_SubjectName: sub.subjectname || sub.ISMS_SubjectName || sub.ismS_SubjectName,
                ISMS_Id: sub.subid || sub.ISMS_Id || sub.ismS_Id,
                eyceS_AplResultFlg: sub.eyceS_AplResultFlg !== undefined ? sub.eyceS_AplResultFlg : sub.EYCES_AplResultFlg,
                subjectorder: sub.subjectorder || sub.ISMS_Order || sub.ismS_Order,
                ismS_SubjectCode: sub.ISMS_SubjectCode || sub.ismS_SubjectCode,
                subid: sub.subid || sub.ISMS_Id || sub.ismS_Id
            }));

        const marks = getstudentmarksdetails.filter((m: any) => Number(m.amsT_Id || m.AMST_Id) === Number(studentId));
        const markstotal = getexamwisetotaldetails.filter((t: any) => Number(t.amsT_Id || t.AMST_Id) === Number(studentId));
        const attendance = getstudentwiseattendancedetails.filter((a: any) => Number(a.amsT_Id || a.AMST_Id) === Number(studentId));

        return { ...student, subjects, marks, markstotal, attendance };
    });

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return Number.isNaN(d.getTime())
            ? date
            : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    };

    const getMarksVal = (mrks: any, colm: any) => {
        if (!mrks) return '';
        const obtMarks = reporttype === 'indi' ? mrks.obtainmarks : mrks.ESTMPPSG_GroupObtMarks;
        const passFail = reporttype === 'indi' ? mrks.PassFailFlg : mrks.ESTMPPS_PassFailFlg;
        const _comp = mrks.complusoryflag;
        const obtPoints = reporttype === 'indi' ? mrks.ObtainedGradePoints : mrks.ESTMPPSG_GradePoints;

        if (colm.columname === 'Marks') {
            if (passFail === 'AB') return passFail;
            if (passFail === 'Fail') return <span className='underline'>{obtMarks}</span>;
            return obtMarks;
        }
        if (colm.columname === 'Point') {
            if (passFail === 'AB') return passFail;
            if (passFail === 'Fail') return <span className='underline'>{obtPoints}</span>;
            return obtPoints;
        }
        return '';
    };

    const getGradeVal = (mrks: any, colm: any, isCCA: boolean) => {
        if (!mrks) return '';
        const obtGrade = reporttype === 'indi' ? mrks.ObtainedGrade : mrks.ESTMPPSG_GroupObtGrade;
        const obtMarks = reporttype === 'indi' ? mrks.obtainmarks : mrks.ESTMPPSG_GroupObtMarks;
        const passFail = reporttype === 'indi' ? mrks.PassFailFlg : mrks.ESTMPPS_PassFailFlg;

        if (colm.columname === 'Marks') {
            if (passFail === 'AB') return passFail;
            if (isCCA) return passFail === 'Fail' ? <span className='underline'>{obtMarks}</span> : obtMarks;
            return passFail === 'Fail' ? <span className='underline'>{obtGrade}</span> : obtGrade;
        }
        return '';
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
            .table-bordered > tbody > tr > td {
              border-left: 1px solid black !important;
              border-right: 1px solid black !important;
              border-top: 0px !important;
              border-bottom: 0px solid black !important;
              padding: 8px 15px !important;
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
                        <div className='mb-6 flex flex-col text-sm'>
                            <div className='mb-6 text-center font-bold text-lg'>ACADEMIC YEAR {year}</div>

                            <div className='mb-2 flex justify-between font-bold'>
                                <div className='w-1/3'>{report.studentname}</div>
                                <div className='flex w-1/3 justify-between px-4'>
                                    <span>
                                        Class : {report.classname} {report.sectionname}
                                    </span>
                                    <span>Roll : {report.rollno}</span>
                                </div>
                                <div className='w-1/3 text-right'>Reg.No. : {report.admno}</div>
                            </div>
                            <div className='flex justify-between font-bold'>
                                <div className='w-1/3'>{report.spccmH_HouseName || report.SPCCMH_HouseName}</div>
                                <div className='w-1/3 text-center'>Number of boys in class : {report.totalboys}</div>
                                <div className='w-1/3 text-right'>D.O.B : {formatDate(report.dob)}</div>
                            </div>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border-2 border-gray-400 font-bold text-sm'>
                                <thead className='border-4 border-gray-400 border-double'>
                                    <tr>
                                        <th className='w-[250px] border border-gray-400 p-2 text-left' rowSpan={2} />
                                        {getexamdetails.map((exam: any, eIdx: number) => (
                                            <th key={eIdx} className='border border-gray-400 p-2 text-center' colSpan={2}>
                                                {reporttype === 'indi' ? exam.emE_ExamName : exam.empG_GroupName}
                                            </th>
                                        ))}
                                        {reporttype === 'promotion' && (
                                            <th className='border border-gray-400 p-2 text-center' colSpan={2}>
                                                Final Average
                                            </th>
                                        )}
                                    </tr>
                                    <tr>
                                        {tempexamdetails.map((colm: any, cIdx: number) => (
                                            <th key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                {colm.columname}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className='border-4 border-gray-400 border-double'>
                                    {report.subjects
                                        .filter((s: any) => s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>{subj.ismS_SubjectName}</td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = report.marks.find((m: any) =>
                                                        reporttype === 'indi'
                                                            ? m.emeid === colm.EME_Id && m.subid === subj.subid
                                                            : m.EMPSG_GroupName === colm.Groupname && m.ISMS_Id === subj.subid
                                                    );
                                                    return (
                                                        <td key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                            {getMarksVal(mrks, colm)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    {report.subjects
                                        .filter((s: any) => !s.eyceS_AplResultFlg)
                                        .map((subj: any, sIdx: number) => (
                                            <tr key={sIdx}>
                                                <td className='border border-gray-400 p-2 pl-6 text-left'>{subj.ismS_SubjectName}</td>
                                                {tempexamdetails.map((colm: any, cIdx: number) => {
                                                    const mrks = report.marks.find((m: any) =>
                                                        reporttype === 'indi'
                                                            ? m.emeid === colm.EME_Id && m.subid === subj.subid
                                                            : m.EMPSG_GroupName === colm.Groupname && m.ISMS_Id === subj.subid
                                                    );
                                                    return (
                                                        <td key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                            {getGradeVal(mrks, colm, subj.ismS_SubjectCode === 'CCA')}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>

                                <tbody>
                                    <tr className='border-none'>
                                        <td className='p-2' colSpan={tempexamdetails.length + 1}>
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>

                                <tbody className='border-4 border-gray-400 border-double'>
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Total (Eng + 3)</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? Number(t.emE_Id) === Number(colm.EME_Id) &&
                                                      colm.emE_ExamCode !== 'IA1' &&
                                                      colm.emE_ExamCode !== 'IA2'
                                                    : t.GROUPNAME === colm.Groupname
                                            );
                                            const val = totl
                                                ? colm.columname === 'Marks'
                                                    ? reporttype === 'indi'
                                                        ? totl.estmP_TotalObtMarks
                                                        : totl.TOTALOBTAINEDMARKS
                                                    : reporttype === 'indi'
                                                      ? totl.estmP_GradePoints
                                                      : totl.GRANDTOTALPOINT
                                                : '';
                                            return (
                                                <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Average (Eng + 3)</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? Number(t.emE_Id) === Number(colm.EME_Id) &&
                                                      colm.emE_ExamCode !== 'IA1' &&
                                                      colm.emE_ExamCode !== 'IA2'
                                                    : t.GROUPNAME === colm.Groupname
                                            );
                                            const val =
                                                totl && colm.columname === 'Marks'
                                                    ? reporttype === 'indi'
                                                        ? totl.estmP_Percentage
                                                        : totl.PERCENTAGEOBTAINED
                                                    : '';
                                            return (
                                                <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {displayAttendance && (
                                        <tr>
                                            <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Attendance</td>
                                            {tempexamdetails.map((colm: any, cIdx: number) => {
                                                const att = report.attendance.find((a: any) =>
                                                    reporttype === 'indi'
                                                        ? Number(a.emE_Id) === Number(colm.EME_Id) &&
                                                          colm.emE_ExamCode !== 'IA1' &&
                                                          colm.emE_ExamCode !== 'IA2'
                                                        : a.GROUPNAME === colm.Groupname
                                                );
                                                const val =
                                                    att && colm.columname === 'Marks'
                                                        ? reporttype === 'indi'
                                                            ? `${att.percentage} %`
                                                            : `${att.PERCENTAGEOBTAINED} %`
                                                        : '';
                                                return (
                                                    <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )}
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 text-left font-bold'>Position</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? Number(t.emE_Id) === Number(colm.EME_Id) &&
                                                      colm.emE_ExamCode !== 'IA1' &&
                                                      colm.emE_ExamCode !== 'IA2'
                                                    : t.GROUPNAME === colm.Groupname
                                            );
                                            const val =
                                                totl && colm.columname === 'Marks'
                                                    ? reporttype === 'indi'
                                                        ? totl.estmP_SectionPosition
                                                        : totl.POSITION
                                                    : '';
                                            return (
                                                <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-8 font-bold text-sm'>
                            <div className='mb-12'>Class Teacher's Comment :</div>
                            <div className='mt-16 flex justify-between px-10'>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold'>Dr.T.H.Ireland</div>
                                    <div className='text-xs'>Principal/Secretary</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-48 border-black border-t-[1.5px] pt-1 font-bold lowercase capitalize first-letter:capitalize'>
                                        {report.classteacher || report.Classteacher || 'Class Teacher'}
                                    </div>
                                    <div className='text-xs'>Class Teacher</div>
                                </div>
                                <div className='flex flex-col items-center text-center'>
                                    <div className='w-32 border-black border-t-[1.5px] pt-1 font-bold'>&nbsp;</div>
                                    <div className='text-xs'>Parent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
