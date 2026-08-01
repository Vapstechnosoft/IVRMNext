'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface Props { data: any; }

// ── Group-column builder (mirrors legacy AngularJS logic exactly) ──
function buildGroupDetails(rawGroups: any[]): any[] {
    const result: any[] = [];
    let hasTermI = false;
    let hasTermII = false;

    rawGroups.forEach(g => {
        const term = (g.empG_GroupName === 'Half Yearly' || g.empG_DistplayName?.includes('Term I') || g.empsG_GroupName?.includes('Term I'))
            ? 'I'
            : (g.empG_GroupName === 'Anual Exam' || g.empG_DistplayName?.includes('Term II') || g.empsG_GroupName?.includes('Term II'))
                ? 'II'
                : 'other';

        const item = { ...g, _term: term };

        if (g.empG_DistplayName === 'Term I' || g.empsG_GroupName === 'Term I') {
            if (!hasTermI) {
                hasTermI = true;
                result.push({ empG_DistplayName: 'Term I', empsG_GroupName: 'Term I1', empsG_MarksValue: 100, _term: 'I' });
                result.push({ empG_DistplayName: 'Term I', empsG_GroupName: 'Term I',  empsG_MarksValue: 100, _term: 'I' });
            }
        } else if (g.empG_DistplayName === 'Term II' || g.empsG_GroupName === 'Term II') {
            if (!hasTermII) {
                hasTermII = true;
                result.push({ empG_DistplayName: 'Term II', empsG_GroupName: 'Term II1', empsG_MarksValue: 100, _term: 'II' });
                result.push({ empG_DistplayName: 'Term II', empsG_GroupName: 'Term II',  empsG_MarksValue: 100, _term: 'II' });
            }
        } else {
            result.push(item);
        }
    });

    result.push({ empG_DistplayName: 'Average', empsG_GroupName: 'Average', empsG_MarksValue: 100, _term: 'other' });
    result.push({ empG_DistplayName: 'Grade',   empsG_GroupName: 'Average', empsG_MarksValue: '',  _term: 'other' });

    return result;
}

// ── Count columns per term for dynamic colspan ──
function termColSpans(groupDetails: any[]) {
    const t1 = groupDetails.filter(g => g._term === 'I').length;
    const t2 = groupDetails.filter(g => g._term === 'II').length;
    const other = groupDetails.filter(g => g._term === 'other').length;
    return { t1, t2, other };
}

// ── Mark cell logic (mirrors ng-if conditions in legacy HTML) ──
function getMarkCell(subj: any, grp: any, marks: any[]): string {
    if (grp.empG_DistplayName === 'Grade') {
        const avgMark = marks.find(
            (m: any) => m.ISMS_Id === subj.ISMS_Id && (m.EMPSG_DisplayName === 'Average' || m.EMPSG_DisplayName === 'Grade')
        );
        if (avgMark) {
            const absent = ['AB', 'M', 'L'].includes(avgMark.PassFailFlag);
            if (absent) return avgMark.PassFailFlag;
            return avgMark.ObtainedGrade || avgMark.estmP_TotalGrade || avgMark.EMGD_Name || 'A';
        }
        const anyMark = marks.find((m: any) => m.ISMS_Id === subj.ISMS_Id && m.ObtainedGrade);
        return anyMark?.ObtainedGrade || 'A';
    }

    const match = marks.find(
        (m: any) => m.ISMS_Id === subj.ISMS_Id && m.EMPSG_DisplayName === grp.empG_DistplayName
    );
    if (!match) return '';

    const absent = ['AB', 'M', 'L'].includes(match.PassFailFlag);
    if (absent) return match.PassFailFlag;

    if (grp.empG_DistplayName === 'Term I' && match.Flag === 11) {
        if (grp.empsG_GroupName === 'Term I')  return String(Math.round(match.ObtainedMarks ?? 0));
        if (grp.empsG_GroupName === 'Term I1') return match.ObtainedGrade || '';
        return '';
    }
    if (grp.empG_DistplayName === 'Term II' && match.Flag === 12) {
        if (grp.empsG_GroupName === 'Term II')  return String(Math.round(match.ObtainedMarks ?? 0));
        if (grp.empsG_GroupName === 'Term II1') return match.ObtainedGrade || '';
        return '';
    }
    if (!['Grade', 'Term I', 'Term II'].includes(grp.empG_DistplayName)) {
        return String(Math.round(match.ObtainedMarks ?? 0));
    }
    return '';
}

export default function SamarthaProgressCardReportView({ data }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!data) return null;

    const {
        getstudentdetails:              studentDetails = [],
        getstudentwisesubjectlist:      allSubjectList = [],
        getstudentmarksdetails:         allMarksList   = [],
        getgroupdetails:                rawGroups      = [],
        gettermdetails:                 termDetails    = [],
        getstudentwiseactiviteslistterm: activitiesAll = [],
        getpromotionremarksdetails:     remarksAll     = [],
        work_attendence:                workAtt        = [],
        present_attendence:             presentAtt     = [],
    } = data;

    const groupDetails = buildGroupDetails(rawGroups);
    const { t1, t2, other } = termColSpans(groupDetails);

    return (
        <div>
            {/* Toolbar */}
            <div className='mb-4 flex justify-end no-print'>
                <Button onClick={() => window.print()} className='bg-sky-700 hover:bg-sky-800 text-white'>
                    <Printer className='mr-2 h-4 w-4' /> Print
                </Button>
            </div>

            {/* ── Inline print styles ── */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    html, body { visibility: hidden !important; background: #ffffff !important; }
                    #samartha-print-area, #samartha-print-area * { visibility: visible !important; background-color: #ffffff !important; }
                    #samartha-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #samartha-print-area {
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                    color: #000;
                    width: 100%;
                    box-sizing: border-box;
                }
                .rpt-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .rpt-table th, .rpt-table td {
                    border: 1px solid #000;
                    padding: 4px 6px;
                    word-wrap: break-word;
                }
                .bg-yellow { background-color: #f7db99 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .bg-blue   { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .text-center { text-align: center; }
                .text-left   { text-align: left;   }
                .border-bottom-label { border-bottom: 1px solid #000; display: inline-block; min-width: 120px; }
                .page-break { page-break-before: always; }
                .sig-block { display: flex; justify-content: space-between; padding-top: 48px; }
                .sig-block div { text-align: center; font-size: 18px; font-weight: bold; width: 33%; }
            `}</style>

            <div id='samartha-print-area' ref={printRef}>
                {studentDetails.map((report: any, idx: number) => {
                    const studentSubjects = allSubjectList.filter((s: any) => s.AMST_Id === report.AMST_Id);
                    const studentMarks    = allMarksList.filter((m: any) => m.AMST_Id === report.AMST_Id);
                    const remark          = remarksAll.find((r: any) => r.amsT_Id === report.AMST_Id);

                    // Unique activity skill areas for this student
                    const activityAreas: string[] = [];
                    activitiesAll.forEach((act: any) => {
                        if (act.AMST_Id === report.AMST_Id && !activityAreas.includes(act.ECACTA_SkillArea)) {
                            activityAreas.push(act.ECACTA_SkillArea);
                        }
                    });

                    return (
                        <div key={report.AMST_Id ?? idx} className={idx > 0 ? 'page-break' : ''} style={{ padding: '3px' }}>

                            {/* ── School Banner Image ── */}
                            <div style={{ marginBottom: 16 }}>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/4d7ee8ba-c9f9-43fa-be14-8aaad8dd5bf6.jpg'
                                    style={{ width: '100%' }}
                                    alt='School Header'
                                />
                            </div>
                            <br /><br />

                            {/* ── Student Info Block ── */}
                            <div style={{ position: 'relative', fontSize: 13 }}>
                                {/* Photo – top-right */}
                                <img
                                    src={
                                        report.AMST_Photoname ||
                                        report.amsT_Photoname ||
                                        report.photo ||
                                        report.AMST_Photo ||
                                        report.studentPhoto ||
                                        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTQwIiB2aWV3Qm94PSIwIDAgMTIwIDE0MCI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxNDAiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjUwIiByPSIyOCIgZmlsbD0iIzljYTNhZiIvPjxwYXRoIGQ9Ik0gMjAgMTI1IEMgMjAgODUsIDEwMCA4NSwgMTAwIDEyNSBaIiBmaWxsPSIjOWNhM2FmIi8+PHRleHQgeD0iNjAiIHk9IjEzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNGI1NTYzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+U1RVREVOVCBQSE9UTzwvdGV4dD48L3N2Zz4='
                                    }
                                    onError={(e: any) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTQwIiB2aWV3Qm94PSIwIDAgMTIwIDE0MCI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxNDAiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjUwIiByPSIyOCIgZmlsbD0iIzljYTNhZiIvPjxwYXRoIGQ9Ik0gMjAgMTI1IEMgMjAgODUsIDEwMCA4NSwgMTAwIDEyNSBaIiBmaWxsPSIjOWNhM2FmIi8+PHRleHQgeD0iNjAiIHk9IjEzMyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNGI1NTYzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+U1RVREVOVCBQSE9UTzwvdGV4dD48L3N2Zz4=';
                                    }}
                                    style={{ border: '1px solid black', position: 'absolute', right: 0, top: 0, width: '130px', height: '140px', objectFit: 'cover' }}
                                    alt='Student Photo'
                                />

                                {/* Class / Section / Roll */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ width: '20%', fontWeight: 'bold' }}>Class/Section/Roll No. :</span>
                                    <span className='border-bottom-label' style={{ fontWeight: 'bold' }}>
                                        {report.classname}/{report.sectionname}/{report.rollno}
                                    </span>
                                </div>
                                {/* Student Name */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ width: '15%', fontWeight: 'bold' }}>Student's Name :</span>
                                    <span className='border-bottom-label' style={{ fontWeight: 'bold' }}>{report.studentname}</span>
                                </div>
                                {/* Father's Name */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ width: '33%', fontWeight: 'bold' }}>Father's/Mother's/Guardian's Name :</span>
                                    <span className='border-bottom-label' style={{ fontWeight: 'bold' }}>{report.fathername}</span>
                                </div>
                                {/* DOB */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ width: '13%', fontWeight: 'bold' }}>Date Of Birth :</span>
                                    <span className='border-bottom-label' style={{ width: '10%', fontWeight: 'bold' }}>{report.dob}</span>
                                </div>
                            </div>

                            &nbsp;
                            {/* ── Academic Year Heading ── */}
                            <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                                <strong style={{ fontSize: 24 }}>Academic Year: 2025-2026</strong>
                            </div>

                            {/* ── Scholastic Areas Table ── */}
                            <table className='rpt-table' style={{ marginBottom: 12 }}>
                                <thead>
                                    {/* Row 1: Scholastic Areas | Term I | Term II | other */}
                                    <tr>
                                        <td className='text-left bg-yellow' style={{ width: 100, fontWeight: 'bold', wordWrap: 'break-word' }}>
                                            <b>Scholastic Areas(A)</b>
                                        </td>
                                        {t1 > 0 && <td className='text-center bg-yellow' colSpan={t1}><b>Term I</b></td>}
                                        {t2 > 0 && <td className='text-center bg-yellow' colSpan={t2}><b>Term II</b></td>}
                                        {other > 0 && <td className='text-center bg-yellow' colSpan={other}></td>}
                                    </tr>
                                    {/* Row 2: Subject Name (rowspan=3) + group display names */}
                                    <tr>
                                        <th className='text-center bg-blue' rowSpan={3}><b>Subject Name</b></th>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'><b>{grp.empG_DistplayName}</b></th>
                                        ))}
                                    </tr>
                                    {/* Row 3: Grade / (MarksValue) */}
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center' style={{ wordWrap: 'break-word' }}>
                                                {(grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1')
                                                    ? <b>Grade</b>
                                                    : grp.empG_DistplayName === 'Grade'
                                                        ? <b>Grade</b>
                                                        : <b>({grp.empsG_MarksValue})</b>}
                                            </th>
                                        ))}
                                    </tr>
                                    {/* Row 4: G / M */}
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center' style={{ wordWrap: 'break-word' }}>
                                                {(grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1')
                                                    ? <b>G</b>
                                                    : grp.empG_DistplayName === 'Grade'
                                                        ? <b>G</b>
                                                        : <b>M</b>}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Subjects with EMPS_AppToResultFlg = true */}
                                    {studentSubjects.filter((s: any) => s.EMPS_AppToResultFlg).map((subj: any) => (
                                        <tr key={`app-${subj.ISMS_Id}`}>
                                            <td className='text-left bg-blue'><b>{subj.ISMS_SubjectName}</b></td>
                                            {groupDetails.map((grp: any, gi: number) => (
                                                <td key={gi} className='text-center'>
                                                    <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {/* Subjects with EMPS_AppToResultFlg = false */}
                                    {studentSubjects.filter((s: any) => !s.EMPS_AppToResultFlg).map((subj: any) => (
                                        <tr key={`nonapp-${subj.ISMS_Id}`}>
                                            <td className='text-left' style={{ wordWrap: 'break-word' }}><b>{subj.ISMS_SubjectName}</b></td>
                                            {groupDetails.map((grp: any, gi: number) => (
                                                <td key={gi} className='text-center'>
                                                    <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            &nbsp;

                            {/* ── Marks / Percent / Grade Summary Table ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 700 }} className='text-left'>Marks</td>
                                            {studentMarks.filter((m: any) => m.Flag === 900004 || m.Flag === 900010).map((m: any, i: number) => (
                                                <td key={i} className='text-center'><b>{Math.round(m.ObtainedMarks)}</b></td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{ width: 700 }} className='text-left'>Percent</td>
                                            {studentMarks.filter((m: any) => m.Flag === 900005 || m.Flag === 900011).map((m: any, i: number) => (
                                                <td key={i} className='text-center'><b>{Math.round(m.ObtainedMarks)}%</b></td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{ width: 700 }} className='text-left'>Grade</td>
                                            {studentMarks.filter((m: any) => m.Flag === 900006 || m.Flag === 900012).length > 0 ? (
                                                studentMarks.filter((m: any) => m.Flag === 900006 || m.Flag === 900012).map((m: any, i: number) => (
                                                    <td key={i} className='text-center'><b>{m.ObtainedGrade}</b></td>
                                                ))
                                            ) : (
                                                <td className='text-center'><b>{
                                                    studentMarks.find((m: any) => m.EMPSG_DisplayName === 'Average' && m.ObtainedGrade)?.ObtainedGrade ||
                                                    report.ESTMP_TotalGrade || report.estmP_TotalGrade || 'A'
                                                }</b></td>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                                {/* ── Co-curricular Activities ── */}
                                {activityAreas.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <table className='rpt-table'>
                                            <thead>
                                                <tr style={{ color: 'black' }}>
                                                    <td className='text-left bg-yellow'><strong>Co-curricular Activities</strong></td>
                                                    {termDetails.map((term: any) => (
                                                        <th key={term.ecT_Id} className='text-center bg-yellow'><b>{term.ecT_TermName}</b></th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activityAreas.map((area: string, ai: number) => (
                                                    <tr key={ai}>
                                                        <td className='text-left' style={{ wordWrap: 'break-word' }}>{area}</td>
                                                        {termDetails.map((term: any) => {
                                                            const sc = activitiesAll.find(
                                                                (a: any) => a.AMST_Id === report.AMST_Id && a.ECACTA_SkillArea === area && a.ECT_Id === term.ecT_Id
                                                            );
                                                            return <td key={term.ecT_Id} className='text-center'>{sc?.EMGD_Name || ''}</td>;
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <br />

                            {/* ── Attendance Table ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 400 }} className='text-left bg-yellow'><strong>Attendance</strong></td>
                                            <td style={{ width: 400 }} className='text-center bg-yellow'><strong>Term</strong></td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Days Present</td>
                                            <td className='text-center'>
                                                {(() => {
                                                    const pa = presentAtt.find((a: any) => a.AMST_Id === report.AMST_Id);
                                                    return pa?.TotalPresentDays ? <strong>{pa.TotalPresentDays}</strong> : '';
                                                })()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Working Days</td>
                                            <td className='text-center'>
                                                {(() => {
                                                    const wa = workAtt.find((a: any) => a.AMST_Id === report.AMST_Id);
                                                    return wa?.TotalSchoolDays ? <strong>{wa.TotalSchoolDays}</strong> : '';
                                                })()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Year Table ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 50 }}><strong>Year</strong></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            &nbsp;&nbsp;&nbsp;

                            {/* ── Signature Block ── */}
                            <div className='sig-block'>
                                <div><b>Class Teacher</b></div>
                                <div><b>Principal</b></div>
                                <div><b>Parent</b></div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
