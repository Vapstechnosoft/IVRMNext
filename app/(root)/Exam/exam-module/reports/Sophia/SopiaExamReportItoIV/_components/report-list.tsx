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
                
                /* Default style: left/right borders only */
                .tablecustom > tbody > tr > td {
                    border-left: 0.5px solid grey !important;
                    border-right: 0.5px solid grey !important;
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
                    border-bottom: 0.5px solid grey !important;
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

            {/* MARKS TABLE */}
            <table className='tablecustom'>
                <tbody className='table-bordered'>
                    <tr>
                        <td rowSpan={2} style={{ width: '50px', textAlign: 'center' }}><b>SL.No</b></td>
                        <td rowSpan={2} style={{ width: '250px', textAlign: 'center' }}><b>Subjects</b></td>
                        <td colSpan={3} style={{ textAlign: 'center' }}><b>Marks</b></td>
                    </tr>
                    <tr>
                        <td className='text-center' style={{ width: '100px' }}><b>Max</b></td>
                        <td className='text-center' style={{ width: '100px' }}><b>Min</b></td>
                        <td className='text-center' style={{ width: '100px' }}><b>Obtained</b></td>
                    </tr>
                </tbody>

                {student.TotalMarksList?.map((marks: any, idx: number) => (
                    marks.SUBJECTGROUP !== 'AVERAGE' && (
                        <tbody key={idx} style={{ border: '1px solid grey', borderBottom: 'none', borderTop: 'none' }}>
                            <tr style={{ lineHeight: '1.2' }}>
                                <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                    <b>{marks.rowNo ? marks.rowNo : '\u00A0'}</b>
                                </td>
                                <td className='text-left' style={{ borderRight: '1px solid grey' }}>
                                    <b>{marks.ISMS_SubjectName}</b>
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MaxMarks : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MinMarks : ''}
                                </td>
                                <td className='text-center' style={{ borderRight: '1px solid grey' }}>
                                    {marks.SUBJECTGROUP !== 'GROUPNAME' ? (
                                        marks.ESTMPS_PassFailFlg === 'AB' && marks.EYCES_MarksDisplayFlg ? (
                                            <b>AB</b>
                                        ) : marks.EYCES_MarksDisplayFlg ? (
                                            <b>
                                                {marks.ESTMPS_ObtainedMarks}
                                                {marks.ESTMPS_ObtainedMarks < marks.EYCES_MinMarks && <b>(F)</b>}
                                            </b>
                                        ) : ''
                                    ) : ''}
                                </td>
                            </tr>
                        </tbody>
                    )
                ))}

                {/* Spacer row */}
                <tbody>
                    <tr style={{ height: '40px' }}>
                        <td style={{ borderLeft: '1px solid grey', borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td className='text-right' style={{ verticalAlign: 'bottom', borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td className='text-center' style={{ verticalAlign: 'bottom', borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td className='text-center' style={{ verticalAlign: 'bottom', borderRight: '1px solid grey' }}>&nbsp;</td>
                        <td className='text-center' style={{ verticalAlign: 'bottom', borderRight: '1px solid grey' }}>&nbsp;</td>
                    </tr>
                </tbody>

                {/* TOTAL ROW */}
                <tbody className='table-bordered' style={{ borderBottom: '1px solid black !important' }}>
                    <tr style={{ height: '40px' }}>
                        <td style={{ verticalAlign: 'bottom' }}>&nbsp;</td>
                        <td className='text-right font-bold' style={{ verticalAlign: 'bottom' }}><b>TOTAL</b></td>
                        <td className='text-center' style={{ verticalAlign: 'bottom' }}>{studentTotal.MaxMarks_Total}</td>
                        <td className='text-center' style={{ verticalAlign: 'bottom' }}>{studentTotal.MinMarks_Total}</td>
                        <td className='text-center' style={{ verticalAlign: 'bottom' }}>{studentTotal.ObtainedMarks_Total}</td>
                    </tr>
                </tbody>
            </table>

            {/* Percentage and Position */}
            <table style={{ borderLeft: '1px solid grey', borderRight: '1px solid grey', borderBottom: '1px solid grey', width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td className='text-left' colSpan={5} style={{ padding: '5px' }}>
                            Percentage:&nbsp;{Math.round(studentTotal.Percentage || 0)}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table style={{ borderLeft: '1px solid grey', borderRight: '1px solid grey', borderBottom: '1px solid grey', width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {student.ESTMP_Result === 'Pass' ? (
                        <tr>
                            <td className='text-left' colSpan={5} style={{ padding: '5px' }}>
                                Position:&nbsp;{student.TotalMarksList?.find((m: any) => m.ESTMP_ClassRank)?.ESTMP_ClassRank}
                            </td>
                        </tr>
                    ) : student.ESTMP_Result === 'Fail' ? (
                        <tr>
                            <td className='text-left' colSpan={5} style={{ padding: '5px' }}>
                                Position:&nbsp;
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <td className='text-left' colSpan={5} style={{ padding: '5px' }}>
                                &nbsp;
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* CO-SCHOLASTIC SUBJECTS */}
            <br />
            <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td className='text-center' style={{ padding: '2px' }}><strong>CO-SCHOLASTIC SUBJECTS</strong></td>
                    </tr>
                </tbody>
            </table>
            {student.activity_main_list_area?.map((acti: any, aIdx: number) => {
                const actiSubjects = student.activity_main_list?.filter((subjco: any) => subjco.ECACT_Id === acti.ECACT_Id) || [];
                return (
                    <table key={aIdx} style={{ width: '100%', borderLeft: '1px solid grey', borderRight: '1px solid grey', borderBottom: '1px solid grey', borderCollapse: 'collapse' }}>
                        <tbody>
                            {actiSubjects.map((subjco: any, sIdx: number) => (
                                <tr key={sIdx}>
                                    <td className='text-center' style={{ width: '50px', borderRight: '1px solid grey', padding: '2px' }}>{sIdx + 1}</td>
                                    <td className='text-left' style={{ wordWrap: 'break-word', borderRight: '1px solid grey', padding: '2px' }}>{subjco.ECACTA_SkillArea}</td>
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
                <table style={{ width: '100%', border: '1px solid grey', borderTop: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black', fontSize: '15px', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ fontWeight: 'bold', borderBottom: '1px solid black', borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black', minHeight: '30px' }}>
                            <td style={{ width: '50px', verticalAlign: 'bottom', paddingBottom: '0', border: '1px solid grey', borderBottom: '1px solid black', borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>Sl.No</td>
                            <td style={{ width: '400px', border: '1px solid grey', verticalAlign: 'bottom', paddingBottom: '0', borderBottom: '1px solid black', borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>Examination</td>
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
                        {/* Empty Spacer Rows for exams mapping */}
                        {[1, 2].map((_, idx) => (
                            <tr key={`empty-${idx}`} style={{ minHeight: '28px', height: '30px' }}>
                                <td style={{ border: '1px solid grey', borderTop: 'none', borderBottom: 'none' }}></td>
                                <td style={{ border: '1px solid grey', borderTop: 'none', borderBottom: 'none' }}></td>
                                {performanceSubjects.map((_, si) => (
                                    <td key={si} style={{ border: '1px solid grey', borderTop: 'none', borderBottom: 'none' }}></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* REMARKS */}
                <table style={{ border: '0.5px solid grey', borderTop: 'none', width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr style={{ height: '60px', border: '0.5px solid grey', borderTop: 'none', verticalAlign: 'top' }}>
                            <td style={{ padding: '5px' }}>
                                Teacher&apos;s Remarks : <strong>{promotionRemarks.ecterE_Remarks}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* SIGNATURES */}
                <table style={{ border: '0.5px solid grey', borderTop: 'none', borderCollapse: 'collapse', width: '100%' }}>
                    <tbody>
                        <tr style={{ height: '60px' }}>
                            <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%', paddingBottom: '5px' }}>CLASS TEACHER</td>
                            <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%', paddingBottom: '5px' }}>PRINCIPAL</td>
                            <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%', paddingBottom: '5px' }}>PARENT</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function SopiaExamReportItoIVView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;

    // Process the raw data into report_list (grouped by student)
    const report_list: any[] = [];
    const examwisedetailsnew = apiData?.examwisedetailsnew || [];
    const getstudentwiseactiviteslist = apiData?.getstudentwiseactiviteslist || [];

    examwisedetailsnew.forEach((dev: any) => {
        let stu = report_list.find((r: any) => r.AMST_Id === dev.AMST_Id);
        if (!stu) {
            stu = {
                ...dev,
                AMST_Id: dev.AMST_Id,
                TotalMarksList: [],
                TotalSchoolDays: 0,
                TotalWorkingDays: 0,
                Total_Percentage: 0,
                activity_main_list_area: [],
                activity_main_list: []
            };
            report_list.push(stu);
        }
    });

    // Populate TotalMarksList, Co-Scholastic and row numbers
    report_list.forEach((stu: any) => {
        stu.TotalMarksList = examwisedetailsnew.filter((m: any) => m.AMST_Id === stu.AMST_Id);

        let counter = 1;
        stu.TotalMarksList.forEach((marks: any) => {
            if (marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE') {
                marks.rowNo = counter++;
            } else {
                marks.rowNo = null;
            }
        });

        // Map attendance
        const attendance = apiData?.work_attendence?.find((att: any) => att.AMST_Id === stu.AMST_Id);
        if (attendance) {
            stu.TotalSchoolDays = attendance.TotalSchoolDays;
            stu.TotalWorkingDays = attendance.TotalWorkingDays;
            stu.Total_Percentage = attendance.Total_Percentage;
        }

        // Group activities dynamically
        const activityname_temp: any[] = [];
        getstudentwiseactiviteslist.forEach((act: any) => {
            if (act.AMST_Id === stu.AMST_Id) {
                if (!activityname_temp.some(dd => dd.ECACT_SkillName === act.ECACT_SkillName)) {
                    activityname_temp.push({ ECACT_SkillName: act.ECACT_SkillName, ECACT_Id: act.ECACT_Id });
                }
            }
        });
        stu.activity_main_list_area = activityname_temp;

        const activitylist_temp: any[] = [];
        getstudentwiseactiviteslist.forEach((act: any) => {
            if (act.AMST_Id === stu.AMST_Id) {
                if (!activitylist_temp.some(dd => dd.ECACTA_SkillArea === act.ECACTA_SkillArea)) {
                    activitylist_temp.push({ ECACTA_SkillArea: act.ECACTA_SkillArea, ECACT_Id: act.ECACT_Id, EMGD_Name: act.EMGD_Name });
                }
            }
        });
        stu.activity_main_list = activitylist_temp;
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

            <div className='no-print flex justify-end px-5 py-2'>
                <Button onClick={() => window.print()} className='flex w-32 items-center justify-center gap-2'>
                    <Printer className='h-4 w-4' /> Print
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
