'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

const border = '1px solid black';
const greyBorder = '0.5px solid grey';
const td = (extra?: React.CSSProperties): React.CSSProperties => ({
    border: greyBorder,
    padding: '4px 6px',
    fontSize: '13px',
    ...extra,
});

function StudentCard({ student, apiData, payload }: { student: any; apiData: any; payload: any }) {
    const studentTotal = apiData?.studentwise_total?.find((t: any) => t.AMST_Id === student.AMST_Id) || {};
    const performanceMarks = apiData?.examwisemarksprocess1?.filter((m: any) => m.AMST_Id === student.AMST_Id) || [];
    const promotionRemarks = apiData?.getpromotionremarksdetails?.find((r: any) => r.amsT_Id === student.AMST_Id) || {};
    
    const performanceSubjects = Array.from(new Set(performanceMarks.map((m: any) => m.TTMSUAB_Abbreviation)));
    const performanceExams = ['First Unit Test', 'First Term Examination', 'Second Unit Test'];

    return (
        <div style={{ pageBreakBefore: 'always', padding: '0', marginBottom: '30px', fontFamily: 'Arial, sans-serif', color: 'black' }}>
            <style>{`
                .tablecustom { border-collapse: collapse; width: 100%; border: 1px solid black; }
                
                /* Default style: left/right borders only */
                .tablecustom > tbody > tr > td {
                    border-left: 0.5px solid grey !important;
                    border-right: 0.3px solid grey !important;
                    border-top: none !important;
                    border-bottom: none !important;
                    padding: 2px 4px;
                    font-size: 13px;
                }

                /* First row in table gets top border */
                .tablecustom > tbody:first-of-type > tr:first-child > td {
                    border-top: 1px solid black !important;
                }

                /* Last row in table gets bottom border */
                .tablecustom > tbody:last-of-type > tr:last-child > td {
                    border-bottom: 0.3px solid grey !important;
                }

                /* Special tbody with full borders on each cell */
                .tablecustom > tbody.table-bordered > tr > td,
                .tablecustom > thead.table-bordered > tr > td,
                .tablecustom > thead.table-bordered > tr > th {
                    border: 1px solid black !important;
                }

                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
            `}</style>

            {/* HEADER */}
            <div style={{ width: '100%' }}>
                <img 
                    src="https://vapsclg.blob.core.windows.net/files/3/InstitutionLogo/9278fa12-3eed-4c60-8da2-074b5e3df753.jpg"
                    style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                    alt="Institution Logo"
                />
                <div style={{ display: 'flex', width: '100%', marginTop: '5px' }}>
                    <div className='text-right' style={{ width: '58.333%', fontWeight: 'bold' }}>{payload?.examName}</div>
                    <div className='text-right' style={{ width: '41.666%', fontWeight: 'bold', paddingRight: '15px' }}>{payload?.yearName}</div>
                </div>
            </div>

            {/* STUDENT INFO TABLE */}
            <table style={{ width: '100%', border: '1px solid black', borderBottom: 'none', borderCollapse: 'collapse', marginTop: '5px' }}>
                <tr>
                    <td style={{ borderLeft: '0.5px solid grey', borderRight: '0.5px solid grey', borderTop: '0.5px solid grey', padding: '5px' }}>
                        <div style={{ display: 'flex', width: '100%', fontSize: '13px', lineHeight: '1.2' }}>
                            <div style={{ width: '58.333%', paddingLeft: '1%' }}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Name</div>
                                    <div style={{ flex: 1 }}> : {student.AMST_FirstName} {student.AMST_MiddleName} {student.AMST_LastName}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Class & Division</div>
                                    <div style={{ flex: 1 }}> : {student.ASMCL_ClassName} {student.ASMC_SectionName}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Date of Birth</div>
                                    <div style={{ flex: 1 }}> : {student.AMST_DOB ? new Date(student.AMST_DOB).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : ''}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Student House</div>
                                    <div style={{ flex: 1 }}> : {student.SPCCMH_HouseName}</div>
                                </div>
                            </div>
                            <div style={{ width: '41.666%' }}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Standard Strength</div>
                                    <div style={{ flex: 1 }}> : {apiData?.examwisemarksprocess?.[0]?.classstrength || 0}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Division Strength</div>
                                    <div style={{ flex: 1 }}> : {apiData?.examwisemarksprocess?.[0]?.Sectionstrength || 0}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Attendance</div>
                                    <div style={{ flex: 1 }}> : {student.TotalWorkingDays}/{student.TotalSchoolDays}</div>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '140px' }}>Attendance %</div>
                                    <div style={{ flex: 1 }}> : {student.Total_Percentage ? Math.round(student.Total_Percentage) : 0}</div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>

            {/* MARKS TABLE */}
            <table className='tablecustom'>
                <tbody className='table-bordered'>
                    <tr style={{ fontWeight: 'bold' }}>
                        <td rowSpan={2} style={{ width: '50px', textAlign: 'center' }}>SL.No</td>
                        <td rowSpan={2} style={{ textAlign: 'center' }}>Subjects</td>
                        <td colSpan={3} style={{ textAlign: 'center', verticalAlign: 'bottom' }}>Marks</td>
                        <td colSpan={2} style={{ textAlign: 'center', verticalAlign: 'bottom' }}>Highest</td>
                        <td colSpan={2} style={{ textAlign: 'center', verticalAlign: 'bottom' }}>Average</td>
                        <td colSpan={2} style={{ textAlign: 'center', verticalAlign: 'bottom' }}>Position</td>
                        <td rowSpan={2} style={{ width: '100px', textAlign: 'center' }}>Percentile</td>
                        <td rowSpan={2} style={{ width: '100px', textAlign: 'center' }}>Remarks</td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Max</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Min</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Obtained</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Std.</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Div.</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Std.</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Div.</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Std.</td>
                        <td className='text-center' style={{ width: '50px', verticalAlign: 'bottom' }}>Div.</td>
                    </tr>
                </tbody>

                {student.TotalMarksList?.map((marks: any, idx: number) => (
                    <tbody key={idx} style={{ border: '1px solid grey', borderBottom: 'none', borderTop: 'none' }}>
                        <tr style={{ lineHeight: '1.2' }}>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? <b>{marks.rowNo}</b> : <b>&nbsp;</b>}
                            </td>
                            <td className='text-left' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP === 'GROUPNAME' ? (
                                    <b>{marks.ISMS_SubjectName}</b>
                                ) : marks.SUBJECTGROUP === 'AVERAGE' ? (
                                    <div className='text-right font-bold'><b>{marks.ISMS_SubjectName}</b></div>
                                ) : (
                                    <span>&emsp;{marks.ISMS_SubjectName}</span>
                                )}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MaxMarks : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MinMarks : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' ? (
                                    marks.ESTMPS_PassFailFlg === 'AB' ? (
                                        <b>AB</b>
                                    ) : (
                                        <b>
                                            {marks.ESTMPS_ObtainedMarks}
                                            {marks.ESTMPS_ObtainedMarks < marks.EYCES_MinMarks && <b>(F)</b>}
                                        </b>
                                    )
                                ) : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? marks.ESTMPS_ClassHighest : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? marks.ESTMPS_SectionHighest : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? Math.round(marks.ESTMPS_ClassAverage) : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? Math.round(marks.ESTMPS_SectionAverage) : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? (
                                    marks.ESTMPS_PassFailFlg !== 'AB' && marks.ESTMPS_ObtainedMarks >= marks.EYCES_MinMarks ? marks.ESTMPS_ClassRank : ''
                                ) : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? (
                                    marks.ESTMPS_PassFailFlg !== 'AB' && marks.ESTMPS_ObtainedMarks >= marks.EYCES_MinMarks ? marks.ESTMPS_SectionRank : ''
                                ) : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE' ? (
                                    marks.ESTMPS_PassFailFlg !== 'AB' && marks.ESTMPS_ObtainedMarks >= marks.EYCES_MinMarks ? marks.Percentile : ''
                                ) : ''}
                            </td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        </tr>
                    </tbody>
                ))}

                {/* Spacer row */}
                <tbody>
                    <tr style={{ height: '60px' }}>
                        <td style={{ borderRight: '1px solid grey', borderLeft: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                    </tr>
                </tbody>

                {/* TOTAL ROW */}
                <tbody className='table-bordered' style={{ borderBottom: '1px solid black !important' }}>
                    <tr style={{ height: '40px' }}>
                        <td style={{ verticalAlign: 'bottom' }}>&nbsp;</td>
                        <td className='text-right font-bold' style={{ verticalAlign: 'bottom' }}><b>TOTAL</b></td>
                        <td className='text-center font-bold' style={{ verticalAlign: 'bottom' }}>{studentTotal.MaxMarks_Total}</td>
                        <td className='text-center font-bold' style={{ verticalAlign: 'bottom' }}>{studentTotal.MinMarks_Total}</td>
                        <td className='text-center font-bold' style={{ verticalAlign: 'bottom' }}>{studentTotal.ObtainedMarks_Total}</td>
                        <td colSpan={8} style={{ verticalAlign: 'bottom' }}>
                            &nbsp;&nbsp; Percentage : {Math.round(studentTotal.Percentage || 0)}
                            &emsp;&nbsp;&nbsp;&nbsp;  &emsp;&nbsp;&nbsp;&nbsp; Std.Position : {student.ESTMP_Result === 'Fail' ? '' : student.TotalMarksList?.[0]?.ESTMP_ClassRank}
                            &emsp;&nbsp;&nbsp;  Div.Position  : {student.ESTMP_Result === 'Fail' ? '' : student.TotalMarksList?.[0]?.ESTMP_SectionRank}
                        </td>
                    </tr>
                </tbody>

                {/* Bottom Spacer */}
                <tbody style={{ borderLeft: '1px solid grey', borderBottom: '1px solid grey !important' }}>
                    <tr style={{ height: '80px' }}>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td colSpan={8}>&nbsp;</td>
                    </tr>
                </tbody>
            </table>

            {/* PERFORMANCE OF THE YEAR */}
            <div style={{ marginTop: '0' }}>
                <p className='text-center font-bold' style={{ marginBottom: '0', fontSize: '15px' }}>PERFORMANCE OF THE YEAR</p>
                <table style={{ width: '100%', border: '1px solid grey', borderTop: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black', fontSize: '15px', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black', minHeight: '30px' }}>
                            <td style={{ width: '50px', verticalAlign: 'bottom', paddingBottom: '0', border: '1px solid grey', borderBottom: '1px solid black', borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>Sl.No</td>
                            <td style={{ width: '500px', border: '1px solid grey', verticalAlign: 'bottom', paddingBottom: '0', borderBottom: '1px solid black', borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>Examination</td>
                            {performanceSubjects.map((sub: any, i: number) => (
                                <td key={i} style={{ border: '1px solid grey', width: '120px', borderBottom: '1px solid black', borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>
                                    {sub === 'Com' ? 'Comm' : sub}
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {performanceExams.map((examName, idx) => (
                            <tr key={idx}>
                                <td style={{ border: '1px solid grey', borderTop: 'none', borderBottom: 'none' }}>{idx + 1}</td>
                                <td className='text-left' style={{ border: '1px solid grey', borderTop: 'none', borderBottom: 'none', paddingLeft: '5px' }}>{examName}</td>
                                {performanceSubjects.map((sub: any, si: number) => {
                                    const mark = performanceMarks.find((m: any) => m.EME_ExamName === examName && m.TTMSUAB_Abbreviation === sub);
                                    return (
                                        <td key={si} style={{ border: '1px solid grey', borderTop: 'none', borderBottom: 'none' }}>
                                            {mark ? (
                                                mark.ESTMPS_PassFailFlg === 'AB' ? 'AB' : (
                                                    <span>
                                                        {mark.ESTMPS_ObtainedMarks}/{mark.ESTMPS_MaxMarks}
                                                        {mark.ESTMPS_ObtainedMarks < mark.ESTMPS_MinMarks && <span>(F)</span>}
                                                    </span>
                                                )
                                            ) : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* REMARKS */}
                <table style={{ border: '0.5px solid grey', borderTop: 'none', border: '1px solid grey', width: '100%', borderCollapse: 'collapse' }}>
                    <tr style={{ height: '60px', border: '0.5px solid grey', borderTop: 'none', verticalAlign: 'top' }}>
                        <td style={{ padding: '5px' }}>
                            Teacher&apos;s Remarks : <strong>{promotionRemarks.ecterE_Remarks}</strong>
                        </td>
                    </tr>
                </table>

                {/* SIGNATURES */}
                <table style={{ border: '0.5px solid grey', border: '1px solid grey', borderTop: 'none', borderCollapse: 'collapse', width: '100%' }}>
                    <tr style={{ height: '60px' }}>
                        <td style={{ verticalAlign: 'bottom', textAlign: 'center', borderRight: '1px solid grey', width: '33.33%', paddingBottom: '5px' }}>CLASS TEACHER</td>
                        <td style={{ verticalAlign: 'bottom', textAlign: 'center', borderRight: '1px solid grey', width: '33.33%', paddingBottom: '5px' }}>PRINCIPAL</td>
                        <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%', paddingBottom: '5px' }}>PARENT</td>
                    </tr>
                </table>
            </div>
        </div>
    );
}

export default function SopiaExamReportView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;

    // Process the raw data into report_list (grouped by student)
    const report_list: any[] = [];
    const examwisedetailsnew = apiData?.examwisedetailsnew || [];
    
    examwisedetailsnew.forEach((dev: any) => {
        let stu = report_list.find((r: any) => r.AMST_Id === dev.AMST_Id);
        if (!stu) {
            stu = { 
                ...dev, 
                AMST_Id: dev.AMST_Id, 
                TotalMarksList: [],
                TotalSchoolDays: 0,
                TotalWorkingDays: 0,
                Total_Percentage: 0
            };
            report_list.push(stu);
        }
    });

    // Populate TotalMarksList and row numbers
    report_list.forEach((stu: any) => {
        stu.TotalMarksList = examwisedetailsnew.filter((m: any) => m.AMST_Id === stu.AMST_Id);
        
        let counter = 1;
        stu.TotalMarksList.forEach((marks: any) => {
            if (marks.EYCES_AplFResultFlg === false) {
                marks.rowNo = counter++;
            } else {
                marks.rowNo = null;
            }

            // Map percentile from examwisemarksprocess
            const percentileEntry = apiData?.examwisemarksprocess?.find((mar: any) => 
                mar.AMST_Id === stu.AMST_Id && mar.ISMS_Id === marks.ISMS_Id1
            );
            if (percentileEntry) {
                marks.Percentile = percentileEntry.Percentile;
            }
        });

        // Map attendance
        const attendance = apiData?.work_attendence?.find((att: any) => att.AMST_Id === stu.AMST_Id);
        if (attendance) {
            stu.TotalSchoolDays = attendance.TotalSchoolDays;
            stu.TotalWorkingDays = attendance.TotalWorkingDays;
            stu.Total_Percentage = attendance.Total_Percentage;
        }
    });

    if (!report_list.length) {
        return <p className='p-4 text-center text-muted-foreground'>No report data available.</p>;
    }

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { margin: 0; padding: 0; }
                    html, body { visibility: hidden !important; }
                    #sopia-print-area, #sopia-print-area * { visibility: visible !important; }
                    #sopia-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>

            <div className='no-print' style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px' }}>
                <Button onClick={() => window.print()} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div id='sopia-print-area' style={{ padding: '20px' }}>
                {report_list.map((stu) => (
                    <StudentCard key={stu.AMST_Id} student={stu} apiData={apiData} payload={payload} />
                ))}
            </div>
        </div>
    );
}
