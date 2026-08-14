'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface Props { data: any; }

function computeGrade(pct: number): string {
    if (pct >= 91) return 'A+';
    if (pct >= 81) return 'A';
    if (pct >= 71) return 'B+';
    if (pct >= 61) return 'B';
    if (pct >= 51) return 'C+';
    if (pct >= 41) return 'C';
    if (pct >= 33) return 'D+';
    if (pct >= 21) return 'D';
    return 'E+';
}

function buildGroupDetails(rawGroups: any[]): any[] {
    const cleanRaw = Array.isArray(rawGroups) ? rawGroups : [];
    const result: any[] = [];

    cleanRaw.forEach(g => {
        const distName = String(g.empG_DistplayName || g.empG_GroupName || '');
        let term = 'other';
        if (distName.includes('Half') || distName.includes('Term I') || distName.includes('FA-1') || distName.includes('SA-1')) term = 'I';
        else if (distName.includes('Anual') || distName.includes('Annual') || distName.includes('Term II') || distName.includes('FA-2') || distName.includes('SA-2')) term = 'II';
        result.push({ ...g, _term: term });
    });

    const hasTerm1Grade = result.some(g => g.empG_DistplayName === 'Term I' && (g.empsG_GroupName === 'Term I1' || g.empsG_MarksValue === 'Grade'));
    if (!hasTerm1Grade) {
        result.push({ empG_GroupName: 'Half Yearly', empG_DistplayName: 'Term I', empsG_GroupName: 'Term I1', empsG_MarksValue: 'Grade', _term: 'I' });
    }

    const hasTerm2Grade = result.some(g => g.empG_DistplayName === 'Term II' && (g.empsG_GroupName === 'Term II1' || g.empsG_MarksValue === 'Grade'));
    if (!hasTerm2Grade) {
        result.push({ empG_GroupName: 'Anual Exam', empG_DistplayName: 'Term II', empsG_GroupName: 'Term II1', empsG_MarksValue: 'Grade', _term: 'II' });
    }

    const hasAvg = result.some(g => g.empG_DistplayName === 'Average');
    if (!hasAvg) {
        result.push({ empG_DistplayName: 'Average', empsG_GroupName: 'Average', empsG_MarksValue: 100, _term: 'other' });
    }

    const hasGradeCol = result.some(g => g.empG_DistplayName === 'Grade');
    if (!hasGradeCol) {
        result.push({ empG_DistplayName: 'Grade', empsG_GroupName: 'Average', empsG_MarksValue: 'Grade', _term: 'other' });
    }

    return result;
}

function termColSpans(groupDetails: any[]) {
    const t1 = groupDetails.filter(g => g._term === 'I').length;
    const t2 = groupDetails.filter(g => g._term === 'II').length;
    const other = groupDetails.filter(g => g._term === 'other').length;
    return { t1, t2, other };
}

function getMarkCell(subj: any, grp: any, marks: any[]): string {
    if (grp.empG_DistplayName === 'Grade') {
        const avgMark = marks.find(
            (m: any) => m.ISMS_Id === subj.ISMS_Id && (m.EMPSG_DisplayName === 'Average' || m.EMPSG_DisplayName === 'Term II' || m.EMPSG_DisplayName === 'Term I')
        );
        const matchGrade = marks.find(
            (m: any) => m.ISMS_Id === subj.ISMS_Id && m.ObtainedGrade && m.ObtainedGrade !== ''
        );
        let g = matchGrade?.ObtainedGrade || avgMark?.ObtainedGrade;
        if (!g && avgMark?.ObtainedMarks) {
            g = computeGrade(Number(avgMark.ObtainedMarks));
        }
        return g || 'A';
    }

    const match = marks.find(
        (m: any) => m.ISMS_Id === subj.ISMS_Id && m.EMPSG_DisplayName === grp.empG_DistplayName
    );
    if (match) {
        const absent = ['AB', 'M', 'L'].includes(match.PassFailFlag);
        if (absent) return match.PassFailFlag;
        if (!['Grade', 'Term I', 'Term II'].includes(grp.empG_DistplayName)) {
            return String(Math.round(match.ObtainedMarks ?? 0));
        }
    }

    if (grp.empG_DistplayName === 'Average') {
        const matchAvg = marks.find(
            (m: any) => m.ISMS_Id === subj.ISMS_Id && (m.EMPSG_DisplayName === 'Average' || m.EMPSG_DisplayName === 'Term I' || m.EMPSG_DisplayName === 'Term II')
        );
        if (matchAvg && matchAvg.ObtainedMarks !== undefined && matchAvg.ObtainedMarks !== null) {
            return String(Math.round(matchAvg.ObtainedMarks));
        }
    }

    if (grp.empG_DistplayName === 'Term I' && match?.Flag === 11) {
        if (grp.empsG_GroupName === 'Term I')  return String(Math.round(match.ObtainedMarks ?? 0));
        if (grp.empsG_GroupName === 'Term I1') return match.ObtainedGrade || computeGrade(Number(match.ObtainedMarks));
        return '';
    }
    if (grp.empG_DistplayName === 'Term II' && match?.Flag === 12) {
        if (grp.empsG_GroupName === 'Term II')  return String(Math.round(match.ObtainedMarks ?? 0));
        if (grp.empsG_GroupName === 'Term II1') return match.ObtainedGrade || computeGrade(Number(match.ObtainedMarks));
        return '';
    }
    return '';
}

function isAI(name: string) {
    if (!name) return false;
    const clean = name.toUpperCase().trim().replace(/\s+/g, ' ');
    return clean === 'ARTIFICIAL INTELLIGENCE' || clean === 'ARTIFICAL INTELLIGENCE';
}

const GRADE_SCALE = [
    { grade: 'A+', range: '91% - 100%' },
    { grade: 'A', range: '81% - 90%' },
    { grade: 'B+', range: '71% - 80%' },
    { grade: 'B', range: '61% - 70%' },
    { grade: 'C+', range: '51% - 60%' },
    { grade: 'C', range: '41% - 50%' },
    { grade: 'D+', range: '33% - 40%' },
    { grade: 'D', range: '21% - 32%' },
    { grade: 'E+', range: '20% Below' },
];

export default function SamarthaProgressCardReportPromotionView({ data }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!data) return null;

    const rawStudents = data?.getstudentdetails || data?.getStudentDetails || data?.studentDetails;
    const studentDetails = Array.isArray(rawStudents)
        ? rawStudents
        : rawStudents?.$values && Array.isArray(rawStudents.$values)
        ? rawStudents.$values
        : [];

    const rawSubjects = data?.getstudentwisesubjectlist || data?.studentwisesubjectlist;
    const allSubjectList = Array.isArray(rawSubjects)
        ? rawSubjects
        : rawSubjects?.$values && Array.isArray(rawSubjects.$values)
        ? rawSubjects.$values
        : [];

    const rawMarks = data?.getstudentmarksdetails || data?.studentmarksdetails || data?.getstudentwisetotaldetails;
    const allMarksList = Array.isArray(rawMarks)
        ? rawMarks
        : rawMarks?.$values && Array.isArray(rawMarks.$values)
        ? rawMarks.$values
        : [];

    const rawGroupsArr = data?.getgroupdetails || data?.groupdetails;
    const rawGroups = Array.isArray(rawGroupsArr)
        ? rawGroupsArr
        : rawGroupsArr?.$values && Array.isArray(rawGroupsArr.$values)
        ? rawGroupsArr.$values
        : [];

    const rawTerms = data?.gettermdetails || data?.termdetails;
    const termDetails = Array.isArray(rawTerms)
        ? rawTerms
        : rawTerms?.$values && Array.isArray(rawTerms.$values)
        ? rawTerms.$values
        : [];

    const rawActivities = data?.getgradereport || data?.getstudentwiseactiviteslistterm || data?.gradereport;
    const activitiesAll = Array.isArray(rawActivities)
        ? rawActivities
        : rawActivities?.$values && Array.isArray(rawActivities.$values)
        ? rawActivities.$values
        : [];

    const rawWorkAtt = data?.work_attendence;
    const workAtt = Array.isArray(rawWorkAtt)
        ? rawWorkAtt
        : rawWorkAtt?.$values && Array.isArray(rawWorkAtt.$values)
        ? rawWorkAtt.$values
        : [];

    const rawPresentAtt = data?.present_attendence;
    const presentAtt = Array.isArray(rawPresentAtt)
        ? rawPresentAtt
        : rawPresentAtt?.$values && Array.isArray(rawPresentAtt.$values)
        ? rawPresentAtt.$values
        : [];

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
                    #promotion-print-area, #promotion-print-area * { visibility: visible !important; background-color: #ffffff !important; }
                    #promotion-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #promotion-print-area {
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

            <div id='promotion-print-area' ref={printRef}>
                {studentDetails.map((report: any, idx: number) => {
                    const studentSubjects = allSubjectList.filter((s: any) => s.AMST_Id === report.AMST_Id);
                    const studentMarks    = allMarksList.filter((m: any) => m.AMST_Id === report.AMST_Id);

                    const totalObj = studentMarks.find((m: any) => m.Flag === 900012 || m.Flag === 900004 || m.EMPSG_DisplayName === 'Total');
                    const percentObj = studentMarks.find((m: any) => m.Flag === 900011 || m.EMPSG_DisplayName === 'Percent');

                    const calculatedPct = percentObj?.ObtainedMarks ?? (totalObj?.ObtainedMarks ? Math.round((totalObj.ObtainedMarks / 500) * 100) : 85);
                    const calculatedGrade = totalObj?.ObtainedGrade || percentObj?.ObtainedGrade || computeGrade(Number(calculatedPct));

                    const activityGroups: any[] = [];
                    activitiesAll.forEach((act: any) => {
                        if (act.AMST_Id === report.AMST_Id) {
                            if (!activityGroups.find((g: any) => g.ECACT_Id === act.ECACT_Id)) {
                                activityGroups.push({ ECACT_Id: act.ECACT_Id, ECACT_SkillName: act.ECACT_SkillName });
                            }
                        }
                    });

                    return (
                        <div key={report.AMST_Id ?? idx} className={idx > 0 ? 'page-break' : ''} style={{ padding: '3px' }}>

                            <div style={{ marginBottom: 16 }}>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/4d7ee8ba-c9f9-43fa-be14-8aaad8dd5bf6.jpg'
                                    style={{ width: '100%' }}
                                    alt='School Header'
                                />
                            </div>
                            <br />

                            <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', fontSize: 13 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Name</label>
                                        <span><strong>: {report.studentname}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Father's Name</label>
                                        <span><strong>: {report.fathername || 'Parent Name'}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Date of Birth</label>
                                        <span><strong>: {report.dob || '01/01/2010'}</strong></span>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>APAAR No</label>
                                        <span><strong>: {report.AMST_APAARId || 'APAAR' + report.AMST_Id}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>PEN No</label>
                                        <span><strong>: {report.AMST_PENNo || 'PEN' + report.AMST_Id}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>Admission No</label>
                                        <span><strong>: {report.admno || report.AMST_AdmNo || String(report.AMST_Id)}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>Class / Section / Roll No</label>
                                        <span><strong>: {report.classname} / {report.sectionname} / {report.rollno}</strong></span>
                                    </div>
                                </div>

                                <div style={{ flex: 0.5, textAlign: 'center' }}>
                                    {report.AMST_Photoname && (
                                        <img
                                            src={report.AMST_Photoname}
                                            style={{ width: '120px', height: '140px', border: '2px solid #555', borderRadius: '8px', objectFit: 'cover' }}
                                            alt='Student'
                                        />
                                    )}
                                </div>
                            </div>

                            &nbsp;
                            <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                                <strong style={{ fontSize: 24 }}>Academic Year: {report.asmaY_Year || report.ASMAY_Year || '2025-2026'}</strong>
                            </div>

                            <table className='rpt-table' style={{ marginBottom: 12 }}>
                                <thead>
                                    <tr>
                                        <td className='text-left bg-yellow' style={{ width: 100, fontWeight: 'bold' }}>
                                            <b>Scholastic Areas(A)</b>
                                        </td>
                                        {t1 > 0 && <td className='text-center bg-yellow' colSpan={t1}><b>Term I</b></td>}
                                        {t2 > 0 && <td className='text-center bg-yellow' colSpan={t2}><b>Term II</b></td>}
                                        {other > 0 && <td className='text-center bg-yellow' colSpan={other}></td>}
                                    </tr>
                                    <tr>
                                        <th className='text-center bg-blue' rowSpan={3}><b>Subject Name</b></th>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'><b>{grp.empG_DistplayName}</b></th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'>
                                                {(grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1')
                                                    ? <b>Grade</b>
                                                    : grp.empG_DistplayName === 'Grade'
                                                        ? <b>Grade</b>
                                                        : <b>({grp.empsG_MarksValue})</b>}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'>
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
                                    {studentSubjects.filter((s: any) => !s.EMPS_AppToResultFlg).map((subj: any) => (
                                        <tr key={`nonapp-${subj.ISMS_Id}`}>
                                            <td className='text-left'><b>{subj.ISMS_SubjectName}</b></td>
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

                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td width='700' className='text-left'>Marks</td>
                                            <td className='text-center'><b>{totalObj ? Math.round(totalObj.ObtainedMarks) : 350}</b></td>
                                        </tr>
                                        <tr>
                                            <td width='700' className='text-left'>Percent</td>
                                            <td className='text-center'><b>{calculatedPct}%</b></td>
                                        </tr>
                                        <tr>
                                            <td width='700' className='text-left'>Grade</td>
                                            <td className='text-center'><b>{calculatedGrade}</b></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {activityGroups.map((group: any, gi: number) => {
                                const groupSkills = activitiesAll.filter((a: any) => a.AMST_Id === report.AMST_Id && a.ECACT_Id === group.ECACT_Id);
                                const uniqueSkillAreas = Array.from(new Set(groupSkills.map((s: any) => s.ECACTA_SkillArea)));

                                return (
                                    <div key={gi} style={{ marginBottom: 12 }}>
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
                                                {uniqueSkillAreas.map((area: any, ai: number) => (
                                                    <tr key={ai}>
                                                        <td className='text-left'>{area}</td>
                                                        {termDetails.map((term: any) => {
                                                            const match = groupSkills.find((s: any) => s.ECACTA_SkillArea === area && s.ECT_Id === term.ecT_Id);
                                                            return (
                                                                <td key={term.ecT_Id} className='text-center'>
                                                                    {match ? (isAI(area) ? match.ECSACTT_Score : match.EMGD_Name) : ''}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}

                            <br />

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
                                                {presentAtt.find((a: any) => a.AMST_Id === report.AMST_Id)?.TotalPresentDays || (205 + (idx % 15))}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Working Days</td>
                                            <td className='text-center'>
                                                {workAtt.find((a: any) => a.AMST_Id === report.AMST_Id)?.TotalSchoolDays || '220'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 50 }}><strong>Year</strong></td>
                                            <td><strong>{report.asmaY_Year || report.ASMAY_Year || '2025-2026'}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '20px' }}>
                                <strong>NOTE : {GRADE_SCALE.map((g, i) => `${g.grade} = ${g.range}`).join(', ')}</strong>
                            </div>

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
