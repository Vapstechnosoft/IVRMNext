'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import React from 'react';

export default function PromotionReportCardSophiaView({ data }: { data: any }) {
    const handlePrint = () => {
        window.print();
    };

    // ── Hardcoded sample data matching the uploaded image ──
    const report = {
        AMST_Id: 1,
        AMST_FirstName: 'AADIA',
        AMST_MiddleName: '',
        AMST_LastName: 'SEBASTIAN',
        ASMCL_ClassName: '8th',
        ASMC_SectionName: 'Division A',
        AMST_DOB: '20-Mar-2012',
        SPCCMH_HouseName: 'Julie',
        classstrength: 200,
        Sectionstrength: 52,
        TotalWorkingDays: '',
        TotalSchoolDays: '',
        Total_Percentage: '',
        ESTMP_Result: 'Pass',
    };

    const scholasticSubjects = [
        { sl: 1,  sub: 'English Literature', max: 100, min: 40, obt: 84,  hs: 97,  hd: 93, as_: 71, ad: 66, ps: 14, pd: 8,  per: 82 },
        { sl: 2,  sub: 'English Language',   max: 100, min: 40, obt: 80,  hs: 90,  hd: 87, as_: 69, ad: 67, ps: 9,  pd: 5,  per: 88 },
        { sl: 3,  sub: 'Kannada',            max: 100, min: 40, obt: 68,  hs: 99,  hd: 98, as_: 68, ad: 70, ps: 32, pd: 21, per: 39 },
        { sl: 4,  sub: 'Mathematics',        max: 100, min: 40, obt: 63,  hs: 98,  hd: 98, as_: 58, ad: 53, ps: 34, pd: 13, per: 72 },
        { sl: 5,  sub: 'Physics',            max: 100, min: 40, obt: 82,  hs: 99,  hd: 96, as_: 67, ad: 62, ps: 15, pd: 7,  per: 86 },
        { sl: 6,  sub: 'Chemistry',          max: 100, min: 40, obt: 72,  hs: 99,  hd: 95, as_: 71, ad: 69, ps: 24, pd: 15, per: 58 },
        { sl: 7,  sub: 'Biology',            max: 100, min: 40, obt: 82,  hs: 100, hd: 97, as_: 73, ad: 69, ps: 18, pd: 9,  per: 78 },
        { sl: 8,  sub: 'History & Civics',   max: 100, min: 40, obt: 89,  hs: 99,  hd: 99, as_: 69, ad: 64, ps: 10, pd: 5,  per: 88 },
        { sl: 9,  sub: 'Geography',          max: 100, min: 40, obt: 89,  hs: 99,  hd: 99, as_: 78, ad: 78, ps: 11, pd: 9,  per: 70 },
        { sl: 10, sub: 'Computer Science',   max: 100, min: 40, obt: 93,  hs: 100, hd: 100, as_: 81, ad: 78, ps: 8,  pd: 7,  per: 74 },
        { sl: 11, sub: 'French',             max: 100, min: 40, obt: 78,  hs: 100, hd: 97, as_: 68, ad: 69, ps: 14, pd: 6,  per: 71 },
    ];

    const nonScholasticSubjects = [
        { sl: 1, sub: 'Doctrine',               grade: 'B' },
        { sl: 2, sub: 'Artificial Intelligence', grade: 'A' },
        { sl: 3, sub: 'Games',                   grade: 'A' },
    ];

    const totalRow = { max: 1100, min: 440, obt: 880, percentage: 80, stdPos: 55, divPos: 10 };

    const performanceExams = [
        { sl: 1, name: 'First Unit Test',        weight: 15, marks: [20, 21, 13, 19, 10, 14, 25, 18, 25, 18, 20] },
        { sl: 2, name: 'First Term Examination',  weight: 30, marks: [88, 87, 73, 83, 78, 84, 88, 90, 87, 91, 99] },
        { sl: 3, name: 'Second Unit Test',        weight: 15, marks: [23, 18, 23, 18, 16, 22, 13, 21, 24, 24, 23] },
        { sl: 4, name: 'Final Examination',       weight: 40, marks: [80, 76, 61, 76, 61, 87, 57, 80, 83, 92, 93] },
    ];

    const perfSubjectHeaders = ['ELIT', 'ENGL', 'KAN', 'FRE', 'MAT', 'PHY', 'CHEM', 'BIO', 'H & C', 'GEO', 'C.SC'];

    const teacherRemark = 'You are performing well—keep striving for a better outcome. Promoted to class 9th. All the best!!';

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 8mm; }
                    html, body { visibility: hidden !important; background: #ffffff !important; background-color: #ffffff !important; }
                    #sophia-print-area, #sophia-print-area * { visibility: visible !important; background-color: #ffffff !important; }
                    #sophia-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #sophia-print-area {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 13px;
                    line-height: 1.4;
                    color: #000;
                    width: 100%;
                    box-sizing: border-box;
                }
                #sophia-print-area table {
                    border-collapse: collapse !important;
                    width: 100%;
                }
                .soph-tablecustom > tbody.table-bordered > tr > td,
                .soph-tablecustom > tbody.table-bordered > tr > th {
                    border: 1px solid black !important;
                }
                .soph-tablecustom > tbody > tr > td {
                    border-left: 0.5px solid grey !important;
                    border-right: 0.3px solid grey !important;
                    border-top: none !important;
                    border-bottom: none !important;
                    padding: 2px 4px;
                }
                .soph-tablecustom > tbody:first-of-type > tr:first-child > td {
                    border-top: 1px solid black !important;
                }
                .soph-tablecustom > tbody:last-of-type > tr:last-child > td {
                    border-bottom: 0.3px solid grey !important;
                }
            `}</style>

            {/* Print Button */}
            <div className="no-print flex justify-end pr-4 pt-2 pb-1">
                <Button onClick={handlePrint} size="sm" className="w-auto flex items-center gap-1 text-xs px-3 py-1">
                    <Printer className="h-3 w-3" /> Print
                </Button>
            </div>

            <div id="sophia-print-area" style={{ padding: '10px 20px', marginTop: '80px' }}>

                {/* ── HEADER ── */}
                <div style={{ position: 'relative', textAlign: 'center', marginBottom: '4px' }}>
                    <br /><br /><br />
                    <div style={{ fontWeight: 'bold', textAlign: 'center' }}>PROMOTION REPORT</div>
                    <div style={{ position: 'absolute', top: 0, right: 0, marginTop: '40px' }}>2025-2026</div>
                </div>

                {/* ── STUDENT INFO BOX ── */}
                <table style={{ border: '0.5px solid grey', borderCollapse: 'collapse', width: '100%' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '0.5px solid grey', padding: '4px 6px', verticalAlign: 'top' }}>
                                <div style={{ display: 'flex', width: '100%' }}>
                                    {/* Left column */}
                                    <div style={{ width: '58%' }}>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '35%' }}>Name</div>
                                            <div style={{ marginLeft: '-5%' }}>: {report.AMST_FirstName} {report.AMST_MiddleName} {report.AMST_LastName}</div>
                                        </div>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '35%' }}>Class &amp; Division</div>
                                            <div style={{ marginLeft: '-5%' }}>: {report.ASMCL_ClassName} {report.ASMC_SectionName}</div>
                                        </div>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '35%' }}>Date of Birth</div>
                                            <div style={{ marginLeft: '-5%' }}>: {report.AMST_DOB}</div>
                                        </div>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '35%' }}>Student House</div>
                                            <div style={{ marginLeft: '-5%' }}>: {report.SPCCMH_HouseName}</div>
                                        </div>
                                    </div>
                                    {/* Right column */}
                                    <div style={{ width: '42%' }}>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '60%' }}>Standard Strength</div>
                                            <div>: {report.classstrength}</div>
                                        </div>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '60%' }}>Division Strength</div>
                                            <div>: {report.Sectionstrength}</div>
                                        </div>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '60%' }}>Attendance</div>
                                            <div>: /</div>
                                        </div>
                                        <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                            <div style={{ width: '60%' }}>Attendance %</div>
                                            <div>: :</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ── MAIN MARKS TABLE ── */}
                <table className="soph-tablecustom" style={{ width: '100%', marginTop: '0' }}>
                    {/* Header */}
                    <tbody className="table-bordered">
                        <tr>
                            <td rowSpan={2} width="20" style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>Sl.No</td>
                            <td width="400" rowSpan={2} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>Subjects</td>
                            <td colSpan={3} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold', verticalAlign: 'bottom', paddingBottom: '0' }}>Marks</td>
                            <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', verticalAlign: 'bottom', paddingBottom: '0' }}>Highest</td>
                            <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', verticalAlign: 'bottom', paddingBottom: '0' }}>Average</td>
                            <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', verticalAlign: 'bottom', paddingBottom: '0' }}>Position</td>
                            <td width="180" rowSpan={2} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>Percentile</td>
                            <td width="180" rowSpan={2} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>Remarks</td>
                        </tr>
                        <tr>
                            {['Max', 'Min', 'Obtained', 'Std.', 'Div.', 'Std.', 'Div.', 'Std.', 'Div.'].map((h, i) => (
                                <td key={i} width="70" style={{ textAlign: 'center', height: '40px', fontWeight: 'bold', verticalAlign: 'bottom', paddingBottom: '0' }}>{h}</td>
                            ))}
                        </tr>
                    </tbody>

                    {/* Scholastic subjects */}
                    {scholasticSubjects.map((r) => (
                        <tbody key={r.sl}>
                            <tr style={{ lineHeight: '0.5em', height: '1em' }}>
                                <td style={{ textAlign: 'center' }}><b>{r.sl}</b></td>
                                <td style={{ textAlign: 'left' }}><b>{r.sub}</b></td>
                                <td style={{ textAlign: 'center' }}>{r.max}</td>
                                <td style={{ textAlign: 'center' }}>{r.min}</td>
                                <td style={{ textAlign: 'center' }}><b>{r.obt}</b></td>
                                <td style={{ textAlign: 'center' }}>{r.hs}</td>
                                <td style={{ textAlign: 'center' }}>{r.hd}</td>
                                <td style={{ textAlign: 'center' }}>{r.as_}</td>
                                <td style={{ textAlign: 'center' }}>{r.ad}</td>
                                <td style={{ textAlign: 'center' }}>{r.ps}</td>
                                <td style={{ textAlign: 'center' }}>{r.pd}</td>
                                <td style={{ textAlign: 'center' }}>{r.per}</td>
                                <td style={{ textAlign: 'center' }}>&nbsp;</td>
                            </tr>
                        </tbody>
                    ))}

                    {/* Spacer row */}
                    <tbody>
                        <tr style={{ height: '50px' }}>
                            <td>&nbsp;</td>
                            <td style={{ textAlign: 'right' }}><b>&nbsp;</b></td>
                            {Array(11).fill(0).map((_, i) => <td key={i} style={{ textAlign: 'center' }}>&nbsp;</td>)}
                        </tr>
                    </tbody>

                    {/* TOTAL row */}
                    <tbody className="table-bordered" style={{ borderBottom: '1px solid black' }}>
                        <tr style={{ height: '40px' }}>
                            <td style={{ verticalAlign: 'bottom' }}>&nbsp;</td>
                            <td style={{ textAlign: 'right', verticalAlign: 'bottom' }}><b>TOTAL</b></td>
                            <td style={{ textAlign: 'center', verticalAlign: 'bottom' }}>{totalRow.max}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'bottom' }}>{totalRow.min}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'bottom' }}>{totalRow.obt}</td>
                            <td colSpan={8} style={{ verticalAlign: 'bottom' }}>
                                &nbsp;&nbsp; Percentage : {totalRow.percentage}
                                &emsp;&nbsp;&nbsp;&nbsp;&emsp;&nbsp;&nbsp;&nbsp; Std.Position :{totalRow.stdPos}
                                &emsp;&nbsp;&nbsp;&emsp;&nbsp; Div.Position : {totalRow.divPos}
                            </td>
                        </tr>
                    </tbody>

                    {/* Non-scholastic (grade-only) subjects */}
                    <tbody style={{ borderLeft: '1px solid grey' }}>
                        {nonScholasticSubjects.map((r) => (
                            <tr key={r.sl} style={{ borderLeft: '1px solid grey' }}>
                                <td style={{ textAlign: 'center' }}>{r.sl}</td>
                                <td style={{ borderRight: '1px solid grey', textAlign: 'left' }}>{r.sub}</td>
                                <td style={{ borderRight: '1px solid grey', textAlign: 'center' }}>&nbsp;</td>
                                <td style={{ borderRight: '1px solid grey', textAlign: 'center' }}>&nbsp;</td>
                                <td style={{ borderRight: '1px solid grey', textAlign: 'center' }}>{r.grade}</td>
                                <td style={{ borderRight: '1px solid grey' }} colSpan={8}>&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ── PERFORMANCE OF THE YEAR ── */}
                <div style={{ marginTop: '6px' }}>
                    <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '0', fontSize: '13px' }}>PERFORMANCE OF THE YEAR</p>
                    <table style={{ width: '100%', border: '1px solid grey', borderTop: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black', fontSize: '15px', borderCollapse: 'collapse', textAlign: 'center' }}>
                        {/* Header */}
                        <thead>
                            <tr style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                                <td style={{ width: '50px', border: '1px solid grey' }}>Sl.No</td>
                                <td style={{ width: '400px', border: '1px solid grey' }}>Examination</td>
                                {perfSubjectHeaders.map((h) => (
                                    <td key={h} style={{ border: '1px solid grey', width: '120px' }}>{h}</td>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {performanceExams.map((exam) => (
                                <tr key={exam.sl}>
                                    <td style={{ border: '1px solid grey', borderBottom: 'none', borderTop: 'none' }}>{exam.sl}</td>
                                    <td style={{ textAlign: 'left', border: '1px solid grey', borderBottom: 'none', borderTop: 'none', padding: '0 10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <span>{exam.name}</span>
                                            <span>{exam.weight}</span>
                                        </div>
                                    </td>
                                    {exam.marks.map((m, i) => (
                                        <td key={i} style={{ border: '1px solid grey', borderBottom: 'none', borderTop: 'none' }}>{m}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ── TEACHER REMARKS ── */}
                    <table style={{ border: '0.5px solid grey', borderTop: 'none', width: '100%' }}>
                        <tbody>
                            <tr style={{ height: '60px', borderTop: 'none', verticalAlign: 'top' }}>
                                <td style={{ padding: '4px 6px' }}>
                                    Teacher&apos;s Remarks : <strong>{teacherRemark}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* ── SIGNATURES ── */}
                    <table style={{ border: '0.5px solid grey', borderTop: 'none', borderCollapse: 'collapse', width: '100%' }}>
                        <tbody>
                            <tr style={{ height: '60px' }}>
                                <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%' }}>CLASS TEACHER</td>
                                <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%' }}>PRINCIPAL</td>
                                <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%' }}>PARENT</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
