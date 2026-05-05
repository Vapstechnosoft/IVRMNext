'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

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
                .tablecustom > tbody > tr > td {
                    border-left: 0.5px solid grey !important;
                    border-right: 0.5px solid grey !important;
                    border-top: none !important;
                    border-bottom: none !important;
                    padding: 2px 4px;
                    font-size: 13px;
                }
                .tablecustom > tbody:first-of-type > tr:first-child > td { border-top: 1px solid black !important; }
                .tablecustom > tbody:last-of-type > tr:last-child > td { border-bottom: 0.5px solid grey !important; }
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
            <div style={{ width: '100%', marginTop: '100px' }} className='margin-top-100'>
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

            {/* STUDENT INFO */}
            <table style={{ width: '100%', border: '1px solid black', borderBottom: 'none', borderCollapse: 'collapse', marginTop: '5px' }}>
                <tbody>
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
                </tbody>
            </table>

            {/* MAIN MARKS TABLE */}
            <table className='tablecustom'>
                <thead className='table-bordered'>
                    <tr>
                        <td rowSpan={2} style={{ width: '40px', textAlign: 'center' }}><b>SL.No</b></td>
                        <td rowSpan={2} style={{ width: '250px', textAlign: 'center' }}><b>Subjects</b></td>
                        <td colSpan={3} style={{ textAlign: 'center' }}><b>Marks</b></td>
                        <td colSpan={2} style={{ textAlign: 'center' }}><b>Highest</b></td>
                        <td colSpan={2} style={{ textAlign: 'center' }}><b>Average</b></td>
                        <td colSpan={2} style={{ textAlign: 'center' }}><b>Position</b></td>
                        <td rowSpan={2} style={{ width: '80px', textAlign: 'center' }}><b>Percentile</b></td>
                        <td rowSpan={2} style={{ width: '100px', textAlign: 'center' }}><b>Remarks</b></td>
                    </tr>
                    <tr>
                        <td className='text-center' style={{ width: '45px' }}><b>Max</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Min</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Obt.</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Std.</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Div.</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Std.</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Div.</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Div.</b></td>
                        <td className='text-center' style={{ width: '45px' }}><b>Std.</b></td>
                    </tr>
                </thead>

                {student.TotalMarksList?.filter((m: any) => m.EYCES_AplFResultFlg === true).map((marks: any, idx: number) => (
                    marks.SUBJECTGROUP !== 'AVERAGE' && (
                        <tbody key={idx}>
                            <tr style={{ lineHeight: '1.2' }}>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    <b>{marks.rowNo1 || '\u00A0'}</b>
                                </td>
                                <td className='text-left' style={{ borderRight: '1px solid black' }}>
                                    <b>{marks.ISMS_SubjectName}</b>
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MaxMarks : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MinMarks : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
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
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.ESTMPS_ClassHighest : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.ESTMPS_SectionHighest : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? Math.round(marks.ESTMPS_ClassAverage || 0) : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? Math.round(marks.ESTMPS_SectionAverage || 0) : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? (marks.ESTMPS_ObtainedMarks >= marks.EYCES_MinMarks ? marks.ESTMPS_SectionRank : '') : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? (marks.ESTMPS_ObtainedMarks >= marks.EYCES_MinMarks ? marks.ESTMPS_ClassRank : '') : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? (marks.ESTMPS_ObtainedMarks >= marks.EYCES_MinMarks ? marks.Percentile : '') : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid black' }}>&nbsp;</td>
                            </tr>
                        </tbody>
                    )
                ))}

                <tbody className='table-bordered'>
                    <tr style={{ height: '40px' }}>
                        <td>&nbsp;</td>
                        <td className='text-right font-bold' style={{ verticalAlign: 'bottom' }}><b>TOTAL</b></td>
                        <td className='text-center' style={{ verticalAlign: 'bottom' }}>{studentTotal.MaxMarks_Total}</td>
                        <td className='text-center' style={{ verticalAlign: 'bottom' }}>{studentTotal.MinMarks_Total}</td>
                        <td className='text-center' style={{ verticalAlign: 'bottom' }}>{studentTotal.ObtainedMarks_Total}</td>
                        <td colSpan={8} style={{ verticalAlign: 'bottom', textAlign: 'left', paddingLeft: '10px' }}>
                             Percentage : {Math.round(studentTotal.Percentage || 0)}
                             &emsp;&nbsp;&nbsp;&nbsp; Std.Position : {student.TotalMarksList?.find((m: any) => m.ESTMP_ClassRank)?.ESTMP_ClassRank || ''}
                             &emsp;&nbsp;&nbsp; Div.Position : {student.TotalMarksList?.find((m: any) => m.ESTMP_SectionRank)?.ESTMP_SectionRank || ''}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Percentage & Rank */}
            <table style={{ border: '1px solid black', borderTop: 'none', width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr style={{ height: '80px' }}>
                        <td style={{ width: '40px', borderRight: '1px solid black' }}>&nbsp;</td>
                        <td style={{ width: '250px', borderRight: '1px solid black' }}>&nbsp;</td>
                        <td style={{ width: '45px', borderRight: '1px solid black' }}>&nbsp;</td>
                        <td style={{ width: '45px', borderRight: '1px solid black' }}>&nbsp;</td>
                        <td style={{ width: '45px', borderRight: '1px solid black' }}>&nbsp;</td>
                        <td colSpan={8}>&nbsp;</td>
                    </tr>
                </tbody>
            </table>

            {/* LANGUAGE SPELLINGS TABLE */}
            <br />
            <table className='tablecustom'>
                <thead className='table-bordered'>
                    <tr style={{ fontWeight: 'bold' }}>
                        <td className='text-center' style={{ width: '50px' }}><b>&nbsp;</b></td>
                        <td className='text-center' style={{ width: '250px' }}><b>LANGUAGE SPELLINGS</b></td>
                        <td className='text-center' style={{ width: '100px' }}><b>Max</b></td>
                        <td className='text-center' style={{ width: '100px' }}><b>Min</b></td>
                        <td className='text-center' style={{ width: '100px' }}><b>Obtained</b></td>
                    </tr>
                </thead>
                {student.TotalMarksList?.filter((m: any) => m.EYCES_AplFResultFlg === false).map((marks: any, idx: number) => (
                    <tbody key={idx}>
                        <tr style={{ lineHeight: '1.2' }}>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>{marks.rowNo}</td>
                            <td className='text-left' style={{ borderRight: '1px solid grey' }}>{marks.SubjectDescription || marks.ISMS_SubjectName}</td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>{marks.EYCES_MaxMarks}</td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>{marks.EYCES_MinMarks}</td>
                            <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                <b>{marks.ESTMPS_ObtainedMarks}</b>
                                {marks.ESTMPS_ObtainedMarks < marks.EYCES_MinMarks && <b>(F)</b>}
                            </td>
                        </tr>
                    </tbody>
                ))}
            </table>

            {/* CO-SCHOLASTIC SUBJECTS */}
            <br />
            <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr><td className='text-center' style={{ padding: '2px' }}><strong>CO-SCHOLASTIC SUBJECTS</strong></td></tr>
                </tbody>
            </table>
            {student.activity_main_list_area?.map((acti: any, aIdx: number) => {
                const actiSubjects = student.activity_main_list?.filter((subjco: any) => subjco.ECACT_Id === acti.ECACT_Id) || [];
                return (
                    <table key={aIdx} style={{ width: '100%', border: '1px solid grey', borderTop: 'none', borderCollapse: 'collapse' }}>
                        <tbody>
                            {actiSubjects.map((subjco: any, sIdx: number) => (
                                <tr key={sIdx}>
                                    <td className='text-center' style={{ width: '50px', borderRight: '1px solid grey', padding: '2px' }}>{sIdx + 1}</td>
                                    <td className='text-left' style={{ borderRight: '1px solid grey', padding: '2px' }}>{subjco.ECACTA_SkillArea}</td>
                                    <td className='text-center' style={{ width: '250px', padding: '2px' }}>{subjco.EMGD_Name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            })}

            {/* PERFORMANCE OF THE YEAR */}
            <div style={{ marginTop: '10px' }}>
                <p className='text-center font-bold' style={{ marginBottom: '0', fontSize: '15px' }}>PERFORMANCE OF THE YEAR</p>
                <table style={{ width: '100%', border: '1px solid black', fontSize: '15px', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ fontWeight: 'bold', borderBottom: '1px solid black' }}>
                            <td style={{ width: '50px', border: '1px solid grey' }}>Sl.No</td>
                            <td style={{ width: '400px', border: '1px solid grey' }}>Examination</td>
                            {performanceSubjects.map((sub: any, i: number) => (
                                <td key={i} style={{ border: '1px solid grey', width: '120px' }}>{sub === 'Com' ? 'Comm' : sub}</td>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {performanceExams.map((examName, idx) => (
                            <tr key={idx}>
                                <td style={{ border: '1px solid grey' }}>{idx + 1}</td>
                                <td className='text-left' style={{ border: '1px solid grey', paddingLeft: '5px' }}>{examName}</td>
                                {performanceSubjects.map((sub: any, si: number) => {
                                    const mark = performanceMarks.find((m: any) => m.EME_ExamName === examName && m.TTMSUAB_Abbreviation === sub);
                                    return (
                                        <td key={si} style={{ border: '1px solid grey' }}>
                                            {mark ? (
                                                mark.ESTMPS_PassFailFlg === 'AB' ? 'AB' : (
                                                    <span>{mark.ESTMPS_ObtainedMarks}/{mark.ESTMPS_MaxMarks}{mark.ESTMPS_ObtainedMarks < mark.ESTMPS_MinMarks && <span>(F)</span>}</span>
                                                )
                                            ) : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* REMARKS & SIGNATURES */}
                <table style={{ border: '1px solid grey', borderTop: 'none', width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr style={{ height: '60px', verticalAlign: 'top' }}>
                            <td style={{ padding: '5px' }}>Teacher&apos;s Remarks : <strong>{promotionRemarks.ecterE_Remarks}</strong></td>
                        </tr>
                    </tbody>
                </table>
                <table style={{ border: '1px solid black', borderTop: 'none', borderCollapse: 'collapse', width: '100%' }}>
                    <tbody>
                        <tr style={{ height: '60px' }}>
                            <td className='text-center' style={{ verticalAlign: 'bottom', width: '33.33%', borderRight: '1px solid black' }}>CLASS TEACHER</td>
                            <td className='text-center' style={{ verticalAlign: 'bottom', width: '33.33%', borderRight: '1px solid black' }}>PRINCIPAL</td>
                            <td className='text-center' style={{ verticalAlign: 'bottom', width: '33.33%' }}>PARENT</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function SopiaExamReportVtoVIIIView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;

    const report_list: any[] = [];
    const examwisedetailsnew = apiData?.examwisedetailsnew || [];
    const getstudentwiseactiviteslist = apiData?.getstudentwiseactiviteslist || [];

    examwisedetailsnew.forEach((dev: any) => {
        let stu = report_list.find((r: any) => r.AMST_Id === dev.AMST_Id);
        if (!stu) {
            stu = { ...dev, TotalMarksList: [], activity_main_list_area: [], activity_main_list: [] };
            report_list.push(stu);
        }
    });

    report_list.forEach((stu: any) => {
        stu.TotalMarksList = examwisedetailsnew.filter((m: any) => m.AMST_Id === stu.AMST_Id);
        
        let counter1 = 1;
        let counter2 = 1;
        stu.TotalMarksList.forEach((marks: any) => {
            if (marks.EYCES_AplFResultFlg === true) marks.rowNo1 = counter1++;
            else marks.rowNo = counter2++;
        });

        const attendance = apiData?.work_attendence?.find((att: any) => att.AMST_Id === stu.AMST_Id);
        if (attendance) {
            stu.TotalSchoolDays = attendance.TotalSchoolDays;
            stu.TotalWorkingDays = attendance.TotalWorkingDays;
            stu.Total_Percentage = attendance.Total_Percentage;
        }

        const activityname_temp: any[] = [];
        const activitylist_temp: any[] = [];
        getstudentwiseactiviteslist.forEach((act: any) => {
            if (act.AMST_Id === stu.AMST_Id) {
                if (!activityname_temp.some(dd => dd.ECACT_Id === act.ECACT_Id)) {
                    activityname_temp.push({ ECACT_SkillName: act.ECACT_SkillName, ECACT_Id: act.ECACT_Id });
                }
                activitylist_temp.push({ ECACTA_SkillArea: act.ECACTA_SkillArea, ECACT_Id: act.ECACT_Id, EMGD_Name: act.EMGD_Name });
            }
        });
        stu.activity_main_list_area = activityname_temp;
        stu.activity_main_list = activitylist_temp;
    });

    if (!report_list.length) return <p className='p-4 text-center text-muted-foreground'>No report data available.</p>;

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { margin: 0; padding: 0; }
                    html, body { visibility: hidden !important; }
                    #vto8-print-area, #vto8-print-area * { visibility: visible !important; }
                    #vto8-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>
            <div className='no-print flex justify-end px-5 py-2'>
                <Button onClick={() => window.print()} className='flex w-32 items-center justify-center gap-2'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>
            <div id='vto8-print-area' style={{ padding: '20px' }}>
                {report_list.map((stu) => (
                    <StudentCard key={stu.AMST_Id} student={stu} apiData={apiData} payload={payload} />
                ))}
            </div>
        </div>
    );
}
