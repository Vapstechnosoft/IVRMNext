'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type React from 'react';

const border = '1px solid black';
const td = (extra?: React.CSSProperties): React.CSSProperties => ({
    border,
    padding: '3px 6px',
    ...extra
});

/* ─────────────────────────────────────────────────────────────────────────────
   StudentCard
   ──────────────────────────────────────────────────────────────────────────── */
function StudentCard({ studentId, apiData }: { studentId: number; apiData: any }) {
    /* ── raw lists ── */
    const students: any[] = apiData?.getstudentdetails ?? [];
    const subjectSummary: any[] = apiData?.getstudentwisesubjectlist ?? []; // totals: subjectObtainedMarks, subjectGrade
    const rawMarks: any[] = apiData?.getstudentmarksdetails ?? [];
    const skills: any[] = apiData?.getstudentwiseskillslist ?? [];
    const activities: any[] = apiData?.getstudentwiseactiviteslist ?? [];
    const promotionRemarks: any[] = apiData?.getpromotionremarksdetails ?? [];
    const terms: any[] = apiData?.gettermdetails ?? [];
    const institution: any = apiData?.getinstitution?.[0] ?? {};

    /* ── groups from API, then append synthetic columns ── */
    const apiGroups: any[] = apiData?.getgroupdetails ?? [];
    // Deduplicate groups by empG_DistplayName (API typo — "Distplay")
    const seenGrp = new Set<string>();
    const uniqueApiGroups = apiGroups
        .filter((g: any) => {
            const name = g.empG_DistplayName ?? g.empG_GroupName ?? '';
            if (!name || seenGrp.has(name)) return false;
            seenGrp.add(name);
            return true;
        })
        .sort((a: any, b: any) => (a.empsG_Order ?? 0) - (b.empsG_Order ?? 0));

    // Full column list matching legacy JS:
    // [...apiGroups, { Marks Obtained, 100 }, { Grade }]
    const columns = [
        ...uniqueApiGroups,
        { empG_DistplayName: 'Marks Obtained', empsG_MarksValue: 100 },
        { empG_DistplayName: 'Grade', empsG_MarksValue: '' }
    ];

    /* ── filter by student ── */
    const stu = students.find((s: any) => s.amsT_Id === studentId) ?? {};
    const mks = rawMarks.filter((m: any) => m.amsT_Id === studentId);
    const promo = promotionRemarks.find((p: any) => p.amsT_Id === studentId) ?? {};
    const stuSubjSummary = subjectSummary.filter((s: any) => s.amsT_Id === studentId);

    /* ── unique ordered subjects from summary ── */
    const subjectNames: string[] = [];
    stuSubjSummary.forEach((s: any) => {
        if (s.subjectName && !subjectNames.includes(s.subjectName)) subjectNames.push(s.subjectName);
    });

    /* ── deduplicated marks: key = ismS_Id_emE_Id → first occurrence ── */
    const seenMark = new Set<string>();
    const dedupedMarks: any[] = [];
    mks.forEach((m: any) => {
        const key = `${m.ismS_Id}_${m.emE_Id}`;
        if (!seenMark.has(key)) {
            seenMark.add(key);
            dedupedMarks.push(m);
        }
    });

    /* ── helper: get cell value for a subject×column ── */
    const getCellValue = (subjName: string, col: any): React.ReactNode => {
        const colName = col.empG_DistplayName ?? '';

        // Synthetic "Marks Obtained" column → from subject summary
        if (colName === 'Marks Obtained') {
            const s = stuSubjSummary.find((x: any) => x.subjectName === subjName);
            return <b>{s?.subjectObtainedMarks ?? ''}</b>;
        }

        // Synthetic "Grade" column → from subject summary
        if (colName === 'Grade') {
            const s = stuSubjSummary.find((x: any) => x.subjectName === subjName);
            return <b>{s?.subjectGrade ?? ''}</b>;
        }

        // API group column → sum all deduped marks for this subject × group
        const groupMarks = dedupedMarks.filter((m: any) => m.ismS_SubjectName === subjName && m.empsG_DisplayName === colName);
        if (!groupMarks.length) return '';
        const total = groupMarks.reduce((acc: number, m: any) => acc + (m.obtainedMarks ?? 0), 0);
        return <b>{total}</b>;
    };

    /* ── skills (group by skill name, join with term scores) ── */
    const stuSkills = skills.filter((s: any) => s.amsT_Id === studentId);
    const skillMainList: { name: string; area: string; scores: { ecT_Id: number; grade: string }[] }[] = [];
    stuSkills.forEach((dd: any) => {
        const name = dd.ECS_SkillName ?? dd.eCS_SkillName ?? '';
        let entry = skillMainList.find((e) => e.name === name);
        if (!entry) {
            entry = { name, area: dd.ECSA_SkillArea ?? '', scores: [] };
            skillMainList.push(entry);
        }
        entry.scores.push({ ecT_Id: dd.ECT_Id ?? dd.ecT_Id ?? 0, grade: dd.EMGD_Name ?? '' });
    });

    /* ── activities ── */
    const stuActivities = activities.filter((a: any) => a.amsT_Id === studentId);
    const actMainList: { area: string; scores: { ecT_Id: number; grade: string }[] }[] = [];
    stuActivities.forEach((dd: any) => {
        const area = dd.ECACTA_SkillArea ?? '';
        let entry = actMainList.find((e) => e.area === area);
        if (!entry) {
            entry = { area, scores: [] };
            actMainList.push(entry);
        }
        entry.scores.push({ ecT_Id: dd.ECT_Id ?? dd.ecT_Id ?? 0, grade: dd.EMGD_Name ?? '' });
    });

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const imgname = institution.mI_Logo ?? institution.MI_Logo ?? '';

    return (
        <div style={{ pageBreakBefore: 'always', border, padding: '3px', marginBottom: '20px' }}>
            {/* LOGO */}
            {imgname && (
                <div style={{ width: '100%', marginBottom: '8px' }}>
                    <img src={imgname} style={{ width: '100%' }} alt='School Header' />
                </div>
            )}
            <br />
            <br />

            {/* STUDENT INFO */}
            <div style={{ fontSize: '13px' }}>
                <div style={{ display: 'flex', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', width: '22%' }}>
                        <b>Class/Section/Roll No. :</b>
                    </span>
                    <span style={{ borderBottom: border, fontWeight: 'bold' }}>
                        <b>
                            {stu.className ?? ''}/{stu.sectionName ?? ''}/{stu.admissionNo ?? ''}
                        </b>
                    </span>
                </div>
                <div style={{ display: 'flex', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', width: '16%' }}>
                        <b>Student&apos;s Name :</b>
                    </span>
                    <span style={{ borderBottom: border, fontWeight: 'bold' }}>
                        <b>{stu.studentName ?? ''}</b>
                    </span>
                </div>
                <div style={{ display: 'flex', marginBottom: '4px' }}>
                    <b>Father&apos;s/Mother&apos;s/Guardian&apos;s Name :</b>&nbsp;
                    <span style={{ borderBottom: border, fontWeight: 'bold', minWidth: '200px', display: 'inline-block' }}>
                        <b>{stu.fatherName ?? ''}</b>
                    </span>
                </div>
                <div style={{ display: 'flex', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', width: '14%' }}>
                        <b>Date Of Birth :</b>
                    </span>
                    <span style={{ borderBottom: border, fontWeight: 'bold', width: '12%' }}>
                        <b>{stu.dob ?? ''}</b>
                    </span>
                </div>
                &nbsp;
                {/* ── SCHOLASTIC MARKS TABLE ── */}
                <div style={{ marginTop: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <td style={{ ...td({ width: '140px' }), backgroundColor: '#f7db99' }}>
                                    <b>Scholastic Areas(A)</b>
                                </td>
                                <td colSpan={columns.length} style={{ ...td({ textAlign: 'center' }), backgroundColor: '#f7db99' }}>
                                    <b>Academic Year(100 Marks)</b>
                                </td>
                            </tr>
                            <tr>
                                <th style={{ ...td({ textAlign: 'center' }), backgroundColor: '#c9eaf0' }}>
                                    <b>Subject Name</b>
                                </th>
                                {columns.map((col: any, i: number) => (
                                    <th
                                        key={i}
                                        style={{ ...td({ textAlign: 'center', whiteSpace: 'pre-wrap' }), backgroundColor: '#c9eaf0' }}>
                                        <b>{col.empG_DistplayName}</b>
                                        {col.empG_DistplayName !== 'Grade' && col.empsG_MarksValue ? (
                                            <>
                                                <br />
                                                <b>({col.empsG_MarksValue})</b>
                                            </>
                                        ) : null}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {subjectNames.map((subjName, si) => (
                                <tr key={si}>
                                    <td style={{ ...td({ textAlign: 'left' }), backgroundColor: '#c9eaf0' }}>
                                        <b>{subjName}</b>
                                    </td>
                                    {columns.map((col: any, ci: number) => (
                                        <td key={ci} style={td({ textAlign: 'center' })}>
                                            {getCellValue(subjName, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                &nbsp;
                {/* ── CO-SCHOLASTIC AREAS TABLE (only if data exists) ── */}
                {skillMainList.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th colSpan={terms.length + 1} style={{ ...td({ textAlign: 'center' }), backgroundColor: '#f7db99' }}>
                                        <b>Co-Scholastic Areas : &#123;on 5- Point(A-C) grading scale&#125;</b>
                                    </th>
                                </tr>
                                <tr>
                                    <td style={{ ...td({ textAlign: 'center' }), backgroundColor: '#c9eaf0' }}></td>
                                    {terms.map((term: any, i: number) => (
                                        <td key={i} style={{ ...td({ textAlign: 'center' }), backgroundColor: '#c9eaf0' }}>
                                            {term.ecT_TermName}
                                        </td>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {skillMainList.map((skill, si) => (
                                    <tr key={si}>
                                        <td style={{ ...td({ textAlign: 'left', wordBreak: 'break-word' }), backgroundColor: '#c9eaf0' }}>
                                            <b>
                                                {skill.name}-{skill.area}
                                            </b>
                                        </td>
                                        {terms.map((term: any, ti: number) => {
                                            const sc = skill.scores.find((s) => s.ecT_Id === (term.ecT_Id ?? 0));
                                            return (
                                                <td key={ti} style={td({ textAlign: 'center' })}>
                                                    <b>{sc?.grade ?? ''}</b>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                &nbsp;
                {/* ── DISCIPLINE TABLE (only if data exists) ── */}
                {actMainList.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th colSpan={terms.length + 1} style={{ ...td({ textAlign: 'center' }), backgroundColor: '#f7db99' }}>
                                        <b>Discipline : &#123;on 5- Point(A-C) grading scale&#125;</b>
                                    </th>
                                </tr>
                                <tr>
                                    <td style={{ ...td({ textAlign: 'center', width: '100px' }), backgroundColor: '#c9eaf0' }}></td>
                                    {terms.map((term: any, i: number) => (
                                        <td key={i} style={{ ...td({ textAlign: 'center' }), backgroundColor: '#c9eaf0' }}>
                                            {term.ecT_TermName}
                                        </td>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {actMainList.map((act, ai) => (
                                    <tr key={ai}>
                                        <td style={{ ...td({ textAlign: 'left', wordBreak: 'break-word' }), backgroundColor: '#c9eaf0' }}>
                                            <b>{act.area}</b>
                                        </td>
                                        {terms.map((term: any, ti: number) => {
                                            const sc = act.scores.find((s) => s.ecT_Id === (term.ecT_Id ?? 0));
                                            return (
                                                <td key={ti} style={td({ textAlign: 'center' })}>
                                                    <b>{sc?.grade ?? ''}</b>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* PROMOTED TO CLASS + REMARKS */}
                {(promo.eprD_ClassPromoted || promo.eprD_Remarks) && (
                    <div style={{ marginTop: '10px' }}>
                        <div>
                            <b>Promoted To Class : </b>
                            <span style={{ borderBottom: border, minWidth: '200px', display: 'inline-block' }}>
                                <b>{promo.eprD_ClassPromoted ?? ''}</b>
                            </span>
                        </div>
                        <div style={{ marginTop: '6px' }}>
                            <b>Class Teacher&apos;s Remarks : </b>
                            <span style={{ borderBottom: border, minWidth: '200px', display: 'inline-block' }}>
                                <b>{promo.eprD_Remarks ?? ''}</b>
                            </span>
                        </div>
                    </div>
                )}
                <br />
                {/* SIGNATURES */}
                <div
                    style={{
                        marginTop: '40px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        paddingTop: '40px'
                    }}>
                    <div style={{ width: '25%' }}>
                        <div>
                            <b>Place : Vasai</b>
                        </div>
                        <div>
                            <b>Date : {dateStr}</b>
                        </div>
                    </div>
                    <div style={{ width: '25%', textAlign: 'center' }}>
                        <b>Signature of Class Teacher</b>
                    </div>
                    <div style={{ width: '25%', textAlign: 'center' }}>
                        <b>Signature of Principal</b>
                    </div>
                    <div style={{ width: '25%', textAlign: 'center' }}>
                        <b>Signature of Parents</b>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── main export ─── */
export default function NDS9ProgressCardView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;
    const students: any[] = apiData?.getstudentdetails ?? [];

    const ids: number[] =
        Array.isArray(payload?.temp_AmstIds) && payload.temp_AmstIds.length > 0
            ? payload.temp_AmstIds.map((s: any) => s.amsT_Id)
            : students.map((s: any) => s.amsT_Id);

    if (!students.length) {
        return <p className='p-4 text-center text-muted-foreground'>No report data available.</p>;
    }

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 8mm; }
                    html, body { visibility: hidden !important; }
                    #nds9-print-area, #nds9-print-area * { visibility: visible !important; }
                    #nds9-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>

            <div className='no-print' style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px' }}>
                <Button
                    onClick={() => window.print()}
                    size='sm'
                    style={{ padding: '4px 12px', fontSize: '12px', width: 'auto' }}
                    className='flex items-center gap-1'>
                    <Printer className='h-3 w-3' /> Print
                </Button>
            </div>

            <div id='nds9-print-area' style={{ padding: '16px 24px' }}>
                {ids.map((id) => (
                    <StudentCard key={id} studentId={id} apiData={apiData} />
                ))}
            </div>
        </div>
    );
}
