'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface Props {
    data: any;
}

// ── Group-column builder (mirrors legacy AngularJS logic exactly) ──
function buildGroupDetails(rawGroups: any[]): any[] {
    const result: any[] = [...rawGroups];

    for (let i = result.length - 1; i >= 0; i--) {
        if (result[i].empG_GroupName === 'Anual Exam') {
            result.splice(
                i + 1,
                0,
                { empG_DistplayName: 'Term II', empsG_GroupName: 'Term II1', empsG_MarksValue: 100, _term: 'II' },
                { empG_DistplayName: 'Term II', empsG_GroupName: 'Term II', empsG_MarksValue: 100, _term: 'II' }
            );
        }
        if (result[i].empG_GroupName === 'Half Yearly') {
            result.splice(
                i + 1,
                0,
                { empG_DistplayName: 'Term I', empsG_GroupName: 'Term I1', empsG_MarksValue: 100, _term: 'I' },
                { empG_DistplayName: 'Term I', empsG_GroupName: 'Term I', empsG_MarksValue: 100, _term: 'I' }
            );
        }
    }
    // Tag original groups with their term
    result.forEach((g) => {
        if (!g._term) {
            if (g.empG_GroupName === 'Half Yearly') g._term = 'I';
            else if (g.empG_GroupName === 'Anual Exam') g._term = 'II';
            else g._term = 'other';
        }
    });
    result.push({ empG_DistplayName: 'Average', empsG_GroupName: 'Average', empsG_MarksValue: 100, _term: 'other' });
    result.push({ empG_DistplayName: 'Grade', empsG_GroupName: 'Average', empsG_MarksValue: '', _term: 'other' });
    return result;
}

// ── Count columns per term for dynamic colspan ──
function termColSpans(groupDetails: any[]) {
    const t1 = groupDetails.filter((g) => g._term === 'I').length;
    const t2 = groupDetails.filter((g) => g._term === 'II').length;
    const other = groupDetails.filter((g) => g._term === 'other').length;
    return { t1, t2, other };
}

// ── Mark cell logic (mirrors ng-if conditions in legacy HTML) ──
function getMarkCell(subj: any, grp: any, marks: any[]): string {
    const match = marks.find((m: any) => m.ISMS_Id === subj.ISMS_Id && m.EMPSG_DisplayName === grp.empG_DistplayName);
    if (!match) return '';

    const absent = ['AB', 'M', 'L'].includes(match.PassFailFlag);
    if (absent) return match.PassFailFlag;

    if (grp.empG_DistplayName === 'Grade') {
        const avgMark = marks.find((m: any) => m.ISMS_Id === subj.ISMS_Id && m.EMPSG_DisplayName === 'Average');
        return avgMark?.ObtainedGrade || '';
    }
    if (grp.empG_DistplayName === 'Term I' && match.Flag === 11) {
        if (grp.empsG_GroupName === 'Term I') return String(Math.round(match.ObtainedMarks ?? 0));
        if (grp.empsG_GroupName === 'Term I1') return match.ObtainedGrade || '';
        return '';
    }
    if (grp.empG_DistplayName === 'Term II' && match.Flag === 12) {
        if (grp.empsG_GroupName === 'Term II') return String(Math.round(match.ObtainedMarks ?? 0));
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
        getstudentdetails: studentDetails = [],
        getstudentwisesubjectlist: allSubjectList = [],
        getstudentmarksdetails: allMarksList = [],
        getgroupdetails: rawGroups = [],
        gettermdetails: termDetails = [],
        getstudentwiseactiviteslistterm: activitiesAll = [],
        getpromotionremarksdetails: remarksAll = [],
        work_attendence: workAtt = [],
        present_attendence: presentAtt = []
    } = data;

    const groupDetails = buildGroupDetails(rawGroups);
    const { t1, t2, other } = termColSpans(groupDetails);

    return (
        <div>
            {/* Toolbar */}
            <div className='no-print mb-4 flex justify-end'>
                <Button onClick={() => window.print()} className='bg-sky-700 text-white hover:bg-sky-800'>
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
                    const studentMarks = allMarksList.filter((m: any) => m.AMST_Id === report.AMST_Id);
                    const _remark = remarksAll.find((r: any) => r.amsT_Id === report.AMST_Id);

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
                            <br />
                            <br />
                            {/* ── Student Info Block ── */}
                            <div style={{ position: 'relative', fontSize: 13 }}>
                                {/* Photo – top-right, overlapping info rows */}
                                {report.AMST_Photoname && (
                                    <img
                                        src={report.AMST_Photoname}
                                        height={150}
                                        width={150}
                                        style={{ border: '1px solid black', position: 'absolute', right: 0, top: 0, objectFit: 'cover' }}
                                        alt='Student'
                                    />
                                )}

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
                                    <span className='border-bottom-label' style={{ fontWeight: 'bold' }}>
                                        {report.studentname}
                                    </span>
                                </div>
                                {/* Father's Name */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ width: '33%', fontWeight: 'bold' }}>Father's/Mother's/Guardian's Name :</span>
                                    <span className='border-bottom-label' style={{ fontWeight: 'bold' }}>
                                        {report.fathername}
                                    </span>
                                </div>
                                {/* DOB */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ width: '13%', fontWeight: 'bold' }}>Date Of Birth :</span>
                                    <span className='border-bottom-label' style={{ width: '10%', fontWeight: 'bold' }}>
                                        {report.dob}
                                    </span>
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
                                        <td
                                            className='bg-yellow text-left'
                                            style={{ width: 100, fontWeight: 'bold', wordWrap: 'break-word' }}>
                                            <b>Scholastic Areas(A)</b>
                                        </td>
                                        {t1 > 0 && (
                                            <td className='bg-yellow text-center' colSpan={t1}>
                                                <b>Term I</b>
                                            </td>
                                        )}
                                        {t2 > 0 && (
                                            <td className='bg-yellow text-center' colSpan={t2}>
                                                <b>Term II</b>
                                            </td>
                                        )}
                                        {other > 0 && <td className='bg-yellow text-center' colSpan={other} />}
                                    </tr>
                                    {/* Row 2: Subject Name (rowspan=3) + group display names */}
                                    <tr>
                                        <th className='bg-blue text-center' rowSpan={3}>
                                            <b>Subject Name</b>
                                        </th>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'>
                                                <b>{grp.empG_DistplayName}</b>
                                            </th>
                                        ))}
                                    </tr>
                                    {/* Row 3: Grade / (MarksValue) */}
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center' style={{ wordWrap: 'break-word' }}>
                                                {grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1' ? (
                                                    <b>Grade</b>
                                                ) : grp.empG_DistplayName === 'Grade' ? (
                                                    <b>Grade</b>
                                                ) : (
                                                    <b>({grp.empsG_MarksValue})</b>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                    {/* Row 4: G / M */}
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center' style={{ wordWrap: 'break-word' }}>
                                                {grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1' ? (
                                                    <b>G</b>
                                                ) : grp.empG_DistplayName === 'Grade' ? (
                                                    <b>G</b>
                                                ) : (
                                                    <b>M</b>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Subjects with EMPS_AppToResultFlg = true */}
                                    {studentSubjects
                                        .filter((s: any) => s.EMPS_AppToResultFlg)
                                        .map((subj: any) => (
                                            <tr key={`app-${subj.ISMS_Id}`}>
                                                <td className='bg-blue text-left'>
                                                    <b>{subj.ISMS_SubjectName}</b>
                                                </td>
                                                {groupDetails.map((grp: any, gi: number) => (
                                                    <td key={gi} className='text-center'>
                                                        <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    {/* Subjects with EMPS_AppToResultFlg = false */}
                                    {studentSubjects
                                        .filter((s: any) => !s.EMPS_AppToResultFlg)
                                        .map((subj: any) => (
                                            <tr key={`nonapp-${subj.ISMS_Id}`}>
                                                <td className='text-left' style={{ wordWrap: 'break-word' }}>
                                                    <b>{subj.ISMS_SubjectName}</b>
                                                </td>
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
                                            <td style={{ width: 700 }} className='text-left'>
                                                Marks
                                            </td>
                                            {studentMarks
                                                .filter((m: any) => m.Flag === 900004)
                                                .map((m: any, i: number) => (
                                                    <td key={i} className='text-left'>
                                                        <span>
                                                            <b>{Math.round(m.ObtainedMarks)}</b>
                                                        </span>
                                                    </td>
                                                ))}
                                        </tr>
                                        <tr>
                                            <td style={{ width: 700 }} className='text-left'>
                                                Percent
                                            </td>
                                            {studentMarks
                                                .filter((m: any) => m.Flag === 900005)
                                                .map((m: any, i: number) => (
                                                    <td key={i} className='text-left'>
                                                        <span>
                                                            <b>{Math.round(m.ObtainedMarks)}%</b>
                                                        </span>
                                                    </td>
                                                ))}
                                        </tr>
                                        <tr>
                                            <td style={{ width: 700 }} className='text-left'>
                                                Grade
                                            </td>
                                            <td className='text-left'>
                                                <b>A</b>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {/* ── Co-curricular Activities ── (one table per skill area) */}
                            {activityAreas.map((area: string, ai: number) => (
                                <div key={ai} style={{ marginBottom: 12 }}>
                                    <table className='rpt-table'>
                                        <tbody>
                                            <tr style={{ color: 'black' }}>
                                                <td className='bg-yellow text-left'>
                                                    <strong>Co-curricular Activities</strong>
                                                </td>
                                                {termDetails.map((term: any) => (
                                                    <th key={term.ecT_Id} className='bg-yellow text-center'>
                                                        <b>{term.ecT_TermName}</b>
                                                    </th>
                                                ))}
                                            </tr>
                                        </tbody>
                                        <tbody>
                                            <tr>
                                                <td className='text-left' style={{ wordWrap: 'break-word' }}>
                                                    {area}
                                                </td>
                                                {termDetails.map((term: any) => {
                                                    const sc = activitiesAll.find(
                                                        (a: any) =>
                                                            a.AMST_Id === report.AMST_Id &&
                                                            a.ECACTA_SkillArea === area &&
                                                            a.ECT_Id === term.ecT_Id
                                                    );
                                                    return (
                                                        <td key={term.ecT_Id} className='text-center'>
                                                            {sc?.EMGD_Name || ''}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                            <br />
                            {/* ── Attendance Table ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 400 }} className='bg-yellow text-left'>
                                                <strong>Attendance</strong>
                                            </td>
                                            <td style={{ width: 400 }} className='bg-yellow text-center'>
                                                <strong>Term</strong>
                                            </td>
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
                                            <td style={{ width: 50 }}>
                                                <strong>Year</strong>
                                            </td>
                                            <td />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            &nbsp;&nbsp;&nbsp;
                            {/* ── Signature Block ── */}
                            <div className='sig-block'>
                                <div>
                                    <b>Class Teacher</b>
                                </div>
                                <div>
                                    <b>Principal</b>
                                </div>
                                <div>
                                    <b>Parent</b>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
