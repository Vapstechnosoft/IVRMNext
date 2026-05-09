'use client';

import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import { format } from 'date-fns';

interface StJamesIXXReportListProps {
    data: any;
    institution: any;
}

export default function StJamesIXXReportList({ data, institution }: StJamesIXXReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    if (!data) return null;

    const {
        getstudentmarksdetails = [],
        getstudentwisesubjectlistnew = [],
        getstudentdetails = [],
        getexamdetails = [],
        getstudentwiseattendancedetails = [],
        getexamwisetotaldetails = [],
        reporttype,
        year,
        displayAttendance
    } = data;

    const tempexamdetails: any[] = [];
    if (reporttype === 'indi') {
        getexamdetails.forEach((exam: any) => {
            tempexamdetails.push({ EME_Id: exam.emE_Id, columnid: exam.emE_Id, columname: "Marks", emE_ExamCode: exam.emE_ExamCode });
            tempexamdetails.push({ EME_Id: exam.emE_Id, columnid: exam.emE_Id, columname: "Point", emE_ExamCode: exam.emE_ExamCode });
        });
    } else if (reporttype === 'groupwise') {
        // In JS: $scope.getexamdetails.push({ empG_GroupName : "Final Average", empsG_Order : 10001});
        const promotionExams = [...getexamdetails, { empG_GroupName: "Final Average", empsG_Order: 10001 }];
        promotionExams.forEach((exam: any) => {
            tempexamdetails.push({ Groupname: exam.empG_GroupName, columnid: exam.empsG_Order, columname: "Marks" });
            tempexamdetails.push({ Groupname: exam.empG_GroupName, columnid: exam.empsG_Order, columname: "Point" });
        });
    }

    const students = getstudentdetails.map((student: any) => {
        const studentId = student.amsT_Id || student.AMST_Id;
        const subjects = getstudentwisesubjectlistnew
            .filter((sub: any) => Number(sub.amsT_Id || sub.AMST_Id) === Number(studentId))
            .map((sub: any) => ({
                ISMS_SubjectName: sub.subjectname || sub.ISMS_SubjectName,
                ISMS_Id: sub.subid || sub.ISMS_Id,
                EYCES_AplResultFlg: sub.EYCES_AplResultFlg,
                subjectorder: sub.subjectorder || sub.ISMS_Order,
                ISMS_SubjectCode: sub.ISMS_SubjectCode
            }));

        const marks = getstudentmarksdetails.filter((m: any) => Number(m.amsT_Id || m.AMST_Id) === Number(studentId));
        const markstotal = getexamwisetotaldetails.filter((t: any) => Number(t.amsT_Id || t.AMST_Id) === Number(studentId));
        const attendance = getstudentwiseattendancedetails.filter((a: any) => Number(a.amsT_Id || a.AMST_Id) === Number(studentId));

        return { ...student, subjects, marks, markstotal, attendance };
    });

    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return isNaN(d.getTime()) ? date : format(d, 'dd-MMM-yyyy');
    };

    return (
        <div className='mt-8 space-y-8'>
            <div className='flex justify-end gap-2 px-4 no-print'>
                <button
                    onClick={handlePrint}
                    className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
                    <Printer className='h-4 w-4' /> Print
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; }
                    .page-break { page-break-before: always; }
                    .stjames-report { padding: 20px; }
                }
                .td-250 { width: 250px; }
                .padding-left-25 { padding-left: 25px !important; }
                .link { text-transform: lowercase; display: inline-block; }
                .link::first-line { text-transform: capitalize; }
            `}</style>

            <div id='print-area' className='bg-white'>
                {students.map((report: any, index: number) => (
                    <div key={report.AMST_Id} className={`stjames-report ${index > 0 ? 'page-break' : ''} p-8`}>
                        <div className='text-center mb-6'>
                            <h2 className='font-bold text-lg'>ACADEMIC YEAR {year}</h2>
                        </div>

                        <div className='mb-6 space-y-2'>
                            <div className='flex justify-between font-bold'>
                                <div className='w-1/3 text-left'>{report.studentname}</div>
                                <div className='w-1/3 text-center'>Class : {report.classname} {report.sectionname} &nbsp; Roll : {report.rollno}</div>
                                <div className='w-1/3 text-right'>Reg.No.: {report.admno}</div>
                            </div>
                            <div className='flex justify-between font-bold'>
                                <div className='w-1/3 text-left'>{report.SPCCMH_HouseName}</div>
                                <div className='w-1/3 text-center'>Number of boys in class : {report.totalboys}</div>
                                <div className='w-1/3 text-right'>D.O.B : {formatDate(report.dob)}</div>
                            </div>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border border-gray-400 text-sm'>
                                <thead>
                                    <tr>
                                        <th className='border border-gray-400 p-2 text-left w-[250px]' rowSpan={2}></th>
                                        {(reporttype === 'indi' ? getexamdetails : [...getexamdetails, { empG_GroupName: "Final Average" }]).map((exam: any, eIdx: number) => (
                                            <th key={eIdx} className='border border-gray-400 p-2 text-center' colSpan={2}>
                                                <b>{reporttype === 'indi' ? exam.emE_ExamName : exam.empG_GroupName}</b>
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {tempexamdetails.map((colm: any, cIdx: number) => (
                                            <th key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                <b>{colm.columname}</b>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Subjects with AplResultFlg */}
                                    {report.subjects.filter((s: any) => s.EYCES_AplResultFlg).map((subj: any, sIdx: number) => (
                                        <tr key={sIdx}>
                                            <td className='border border-gray-400 p-2 pl-6 font-bold'>{subj.ISMS_SubjectName}</td>
                                            {tempexamdetails.map((colm: any, cIdx: number) => {
                                                const mrks = report.marks.find((m: any) =>
                                                    reporttype === 'indi'
                                                        ? (Number(m.emeid) === Number(colm.EME_Id) && Number(m.subjectorder) === Number(subj.subjectorder))
                                                        : (m.EMPSG_GroupName === colm.Groupname && Number(m.EMPS_SubjOrder) === Number(subj.subjectorder))
                                                );

                                                if (!mrks) return <td key={cIdx} className='border border-gray-400 p-2'></td>;

                                                const isMarks = colm.columname === 'Marks';
                                                const isPoint = colm.columname === 'Point';
                                                const passFail = reporttype === 'indi' ? mrks.PassFailFlg : mrks.ESTMPPS_PassFailFlg;
                                                const obtainMarks = reporttype === 'indi' ? mrks.obtainmarks : mrks.ESTMPPSG_GroupObtMarks;
                                                const gradePoints = reporttype === 'indi' ? mrks.ObtainedGradePoints : mrks.ESTMPPSG_GradePoints;

                                                return (
                                                    <td key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                        {isMarks && (
                                                            <span className={passFail === 'Fail' ? 'underline' : ''}>
                                                                {passFail === 'AB' ? 'AB' : obtainMarks}
                                                            </span>
                                                        )}
                                                        {isPoint && (
                                                            <span className={passFail === 'Fail' ? 'underline' : ''}>
                                                                {passFail === 'AB' ? 'AB' : gradePoints}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* Subjects without AplResultFlg */}
                                    {report.subjects.filter((s: any) => !s.EYCES_AplResultFlg).map((subj: any, sIdx: number) => (
                                        <tr key={sIdx}>
                                            <td className='border border-gray-400 p-2 pl-6 font-bold'>{subj.ISMS_SubjectName}</td>
                                            {tempexamdetails.map((colm: any, cIdx: number) => {
                                                const mrks = report.marks.find((m: any) =>
                                                    reporttype === 'indi'
                                                        ? (Number(m.emeid) === Number(colm.EME_Id) && Number(m.subjectorder) === Number(subj.subjectorder))
                                                        : (m.EMPSG_GroupName === colm.Groupname && Number(m.EMPS_SubjOrder) === Number(subj.subjectorder))
                                                );

                                                if (!mrks) return <td key={cIdx} className='border border-gray-400 p-2'></td>;

                                                const isMarks = colm.columname === 'Marks';
                                                const passFail = reporttype === 'indi' ? mrks.PassFailFlg : mrks.ESTMPPS_PassFailFlg;

                                                let displayValue = '';
                                                if (reporttype === 'indi') {
                                                    if (mrks.Marksdispaly === 1) displayValue = mrks.obtainmarks;
                                                    else if (mrks.Gradedisplay === 1) displayValue = mrks.ObtainedGrade;
                                                } else {
                                                    if (subj.ISMS_SubjectCode !== 'CCA') displayValue = mrks.ESTMPPSG_GroupObtGrade;
                                                    else displayValue = mrks.ESTMPPSG_GroupObtMarks;
                                                }

                                                return (
                                                    <td key={cIdx} className='border border-gray-400 p-2 text-center'>
                                                        {isMarks && (
                                                            <span className={passFail === 'Fail' ? 'underline' : ''}>
                                                                {passFail === 'AB' ? 'AB' : displayValue}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* Spacing row */}
                                    <tr>
                                        <td className='border-none h-4' colSpan={tempexamdetails.length + 1}></td>
                                    </tr>

                                    {/* Totals */}
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 font-bold'>Total (Eng + 4)</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? (Number(t.emE_Id) === Number(colm.EME_Id) && colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2')
                                                    : (t.GROUPNAME === colm.Groupname && colm.Groupname !== 'Internal Assessment')
                                            );

                                            let val = '';
                                            if (totl) {
                                                if (colm.columname === 'Marks') val = reporttype === 'indi' ? totl.estmP_TotalObtMarks : totl.TOTALOBTAINEDMARKS;
                                                else if (colm.columname === 'Point') val = reporttype === 'indi' ? totl.estmP_GradePoints : totl.GRANDTOTALPOINT;
                                            }

                                            return <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>{val}</td>;
                                        })}
                                    </tr>

                                    {/* Average */}
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 font-bold'>Average (Eng + 4)</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? (Number(t.emE_Id) === Number(colm.EME_Id) && colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2')
                                                    : (t.GROUPNAME === colm.Groupname && colm.Groupname !== 'Internal Assessment')
                                            );

                                            let val = '';
                                            if (totl && colm.columname === 'Marks') {
                                                val = reporttype === 'indi' ? totl.estmP_Percentage : totl.PERCENTAGEOBTAINED;
                                            }

                                            return <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>{val}</td>;
                                        })}
                                    </tr>

                                    {/* Attendance */}
                                    {displayAttendance && (
                                        <tr>
                                            <td className='border border-gray-400 p-2 pl-6 font-bold'>Attendance</td>
                                            {tempexamdetails.map((colm: any, cIdx: number) => {
                                                const att = report.attendance.find((a: any) =>
                                                    reporttype === 'indi'
                                                        ? (Number(a.emE_Id) === Number(colm.EME_Id) && colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2')
                                                        : (a.GROUPNAME === colm.Groupname && colm.Groupname !== 'Internal Assessment')
                                                );

                                                let val = '';
                                                if (att && colm.columname === 'Marks') {
                                                    val = reporttype === 'indi' ? `${att.ATTENDANCEPERCENTAGE || att.percentage || ''} %` : `${att.PERCENTAGEOBTAINED || ''} %`;
                                                }

                                                return <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>{val}</td>;
                                            })}
                                        </tr>
                                    )}

                                    {/* Position */}
                                    <tr>
                                        <td className='border border-gray-400 p-2 pl-6 font-bold'>Position</td>
                                        {tempexamdetails.map((colm: any, cIdx: number) => {
                                            const totl = report.markstotal.find((t: any) =>
                                                reporttype === 'indi'
                                                    ? (Number(t.emE_Id) === Number(colm.EME_Id) && colm.emE_ExamCode !== 'IA1' && colm.emE_ExamCode !== 'IA2')
                                                    : (t.GROUPNAME === colm.Groupname && colm.Groupname !== 'Internal Assessment')
                                            );

                                            let val = '';
                                            if (totl && colm.columname === 'Marks') {
                                                val = reporttype === 'indi' ? totl.estmP_SectionPosition : totl.POSITION;
                                            }

                                            return <td key={cIdx} className='border border-gray-400 p-2 text-center font-bold'>{val}</td>;
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-10 font-bold'>
                            <p>Class Teacher's Comment :</p>
                        </div>

                        <div className='mt-20 space-y-8'>
                            <div className='flex justify-between px-10'>
                                <div className='w-1/3 text-center'>
                                    <div className='border-t-2 border-black pt-1'>Dr.T.H.Ireland</div>
                                </div>
                                <div className='w-1/3 text-center'>
                                    <div className='border-t-2 border-black pt-1 link'>{report.Classteacher}</div>
                                </div>
                                <div className='w-1/3 text-center'></div>
                            </div>
                            <div className='flex justify-between px-10 font-bold'>
                                <div className='w-1/3 text-center'>Principal/Secretary</div>
                                <div className='w-1/3 text-center'>Class Teacher</div>
                                <div className='w-1/3 text-center'>
                                    <div className='border-t-2 border-black pt-1'>Parent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
