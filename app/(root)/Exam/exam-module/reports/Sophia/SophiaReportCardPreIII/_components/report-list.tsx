'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

function StudentCard({ student, apiData, payload }: { student: any; apiData: any; payload: any }) {
    const promotionRemarks = apiData?.examwiseremarks?.find((r: any) => r.AMST_Id === student.AMST_Id) || {};
    
    // Legacy mapping for Term IDs
    const terms = [
        { id: 1241, name: 'Term I' },
        { id: 1243, name: 'Term II' },
        { id: 1246, name: 'Term III' }
    ];

    const getExamData = (subject: any, termId: number) => {
        if (termId === 1241) return subject.exam1;
        if (termId === 1243) return subject.exam2;
        if (termId === 1246) return subject.exam3;
        return null;
    };

    return (
        <div style={{ pageBreakBefore: 'always', padding: '0', marginBottom: '30px', fontFamily: 'Arial, sans-serif', color: 'black' }}>
            <style>{`
                .report-body { padding: 0 10px; }
                .margin-top-100 { margin-top: 100px; height: 100px; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                
                table { border-collapse: collapse !important; width: 100%; }
                
                .student-info-table td { 
                    border-left: 0.5px solid black !important; 
                    border-right: 0.5px solid black !important; 
                    border-top: 0.5px solid black !important; 
                    border-bottom: 0.5px solid black !important; 
                    padding: 5px; 
                }
                
                .perf-table td, .perf-table th { 
                    border: 1px solid black !important; 
                }
                
                .no-tb-border td {
                    border-top: none !important;
                    border-bottom: none !important;
                    border-left: 1px solid black !important;
                    border-right: 1px solid black !important;
                }

                .section-header { 
                    padding-left: 12% !important; 
                    height: 25px; 
                    vertical-align: bottom !important; 
                    font-weight: bold; 
                    border: 1px solid black !important; 
                }

                .habit-table { 
                    font-size: 14px; 
                    border: 1px solid black !important; 
                }
                
                .habit-table td { 
                    border-top: none !important; 
                    border-bottom: none !important; 
                    border-left: 1px solid black !important; 
                    border-right: 1px solid black !important; 
                    height: 16px !important; 
                    line-height: 16px !important; 
                    padding: 3px; 
                }

                #newone { line-height: 1; }
            `}</style>

            <div className="report-body">
                {/* MARGIN TOP 100 */}
                <div className="margin-top-100"></div>

                {/* STUDENT INFO TABLE */}
                <table className="student-info-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td>
                                <div id="newone" style={{ display: 'flex', width: '100%', fontSize: '13px' }}>
                                    <div style={{ width: '58.333%', paddingLeft: '1%' }}>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '140px' }}>Name</div>
                                            <div style={{ flex: 1 }}> &nbsp;&nbsp;&nbsp;&nbsp;: {student.AMST_FirstName} {student.AMST_MiddleName} {student.AMST_LastName}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '140px' }}>Class & Division</div>
                                            <div style={{ flex: 1 }}> &nbsp;&nbsp;&nbsp;&nbsp;: {student.ASMCL_ClassName} {student.ASMC_SectionName}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '140px' }}>Date of Birth</div>
                                            <div style={{ flex: 1 }}> &nbsp;&nbsp;&nbsp;&nbsp;: {student.AMST_DOB ? new Date(student.AMST_DOB).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : ''}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '140px' }}>Student House</div>
                                            <div style={{ flex: 1 }}> &nbsp;&nbsp;&nbsp;&nbsp;: {student.SPCCMH_HouseName}</div>
                                        </div>
                                    </div>
                                    <div style={{ width: '41.666%' }}>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '160px' }}>Standard Strength</div>
                                            <div style={{ flex: 1 }}> : {apiData?.examWise_PaperType?.[0]?.classstrength || 0}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '160px' }}>Division Strength</div>
                                            <div style={{ flex: 1 }}> : {apiData?.examWise_PaperType?.[0]?.Sectionstrength || 0}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '160px' }}>Attendance</div>
                                            <div style={{ flex: 1 }}> : {student.TotalWorkingDays}/{student.TotalSchoolDays}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '160px' }}>Attendance %</div>
                                            <div style={{ flex: 1 }}> : {student.Total_Percentage ? Math.round(student.Total_Percentage) : 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className='text-center' style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '30px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>
                        PERFORMANCE OF THE YEAR {payload?.yearName || '2025 - 2026'}
                    </p>
                </div>

                {/* SCHOLASTIC AREAS TABLE */}
                <table className="perf-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <tbody>
                        <tr style={{ height: '35px' }}>
                            <th style={{ width: '40px', verticalAlign: 'bottom' }}>Sl. No</th>
                            <th style={{ width: '200px', verticalAlign: 'bottom' }}>Subjects</th>
                            <th style={{ width: '100px', verticalAlign: 'bottom' }}>Term I</th>
                            <th style={{ width: '100px', verticalAlign: 'bottom' }}>Term II</th>
                            <th style={{ width: '100px', verticalAlign: 'bottom' }}>Term III</th>
                        </tr>
                        <tr className='text-left'>
                            <td colSpan={5} className="section-header">
                                <div style={{ margin: '-3px', lineHeight: '1', position: 'relative', top: '1px' }}>SCHOLASTIC AREAS</div>
                            </td>
                        </tr>
                    </tbody>
                    {student.subjecttList?.map((subject: any, sIdx: number) => (
                        <tbody key={sIdx} className="no-tb-border">
                            <tr style={{ height: '17px' }}>
                                <td className='text-center font-bold' style={{ height: '16px', lineHeight: '16px', padding: '3px' }}>{sIdx + 1}</td>
                                <td className='text-left font-bold' style={{ height: '16px', lineHeight: '16px', padding: '3px' }}>{subject.ISMS_SubjectName}</td>
                                {/* Term I column for Main Subject */}
                                <td className='text-center font-bold' style={{ height: '16px', lineHeight: '16px', padding: '3px' }}>
                                    {subject.ISMS_SubjectName !== 'English' && subject.ISMS_SubjectName !== 'Kannada' && subject.ISMS_SubjectName !== 'Hindi' ? (
                                        <>
                                            {subject.exam1 && (
                                                <>
                                                    {subject.exam1.EYCES_GradeDisplayFlg && (
                                                        subject.exam1.ESTMPS_ObtainedMarks === 0 ? 'AB' : subject.exam1.ESTMPS_ObtainedGrade
                                                    )}
                                                    {subject.exam1.EYCES_MarksDisplayFlg && (
                                                        subject.exam1.ESTMPS_ObtainedMarks === 0 ? 'AB' : subject.exam1.ESTMPS_ObtainedMarks
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : null}
                                </td>
                                <td className='text-center' style={{ height: '12px' }}></td>
                                <td className='text-center' style={{ height: '12px' }}></td>
                            </tr>
                            {student.sub_subjecttList?.filter((sub: any) => sub.ISMS_Id === subject.ISMS_Id).map((sub: any, ssIdx: number) => (
                                <tr key={`${sIdx}-${ssIdx}`} style={{ height: '17px' }}>
                                    <td></td>
                                    <td className='text-left' style={{ padding: '2px', lineHeight: '17px' }}>&nbsp;&nbsp;&nbsp;{sub.EMSS_SubSubjectName}</td>
                                    {terms.map(t => {
                                        const markEntry = student.studentmarks?.find((m: any) => m.EME_Id === t.id && m.ISMS_Id === subject.ISMS_Id && m.EMSS_Id === sub.EMSS_Id);
                                        const examData = getExamData(subject, t.id);
                                        return (
                                            <td key={t.id} className='text-center' style={{ lineHeight: '17px', padding: '2px' }}>
                                                {markEntry ? (
                                                    markEntry.ESTMPSSS_PassFailFlg === 'AB' ? 'AB' : (
                                                        <>
                                                            {examData?.EYCES_GradeDisplayFlg && markEntry.ESTMPSSS_ObtainedGrade}
                                                            {examData?.EYCES_MarksDisplayFlg && markEntry.ESTMPSSS_ObtainedMarks}
                                                        </>
                                                    )
                                                ) : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    ))}
                    {/* Add one final bottom border to the last tbody */}
                    <tbody style={{ borderTop: 'none' }}>
                        <tr style={{ height: '0px' }}>
                            <td colSpan={5} style={{ border: 'none', borderTop: '1px solid black' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* CO-SCHOLASTIC AREAS SECTION */}
                <table style={{ borderLeft: '1px solid black', borderRight: '1px solid black', borderTop: 'none', width: '100%', borderBottom: 'none' }}>
                    <tbody>
                        <tr style={{ height: '25px' }}>
                            <td className="section-header" style={{ borderBottom: 'none !important' }}>CO-SCHOLASTIC AREAS</td>
                        </tr>
                    </tbody>
                </table>

                {/* ACTIVITY LOOP */}
                {student.activity_main_list_area?.map((acti: any, aIdx: number) => (
                    <div key={aIdx}>
                        {/* Section Sub-headings (STUDY HABITS etc.) */}
                        <table style={{ borderLeft: '1px solid black', borderRight: '1px solid black', borderTop: 'none', width: '100%', borderBottom: 'none' }}>
                            <tbody>
                                <tr style={{ height: '25px' }}>
                                    <td className="section-header" style={{ borderBottom: 'none !important' }}>
                                        {acti.ECACT_SkillName.toUpperCase()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="habit-table" style={{ borderCollapse: 'collapse', textAlign: 'center', width: '100%' }}>
                            <tbody>
                                {student.activity_main_list?.filter((act: any) => act.ECACT_Id === acti.ECACT_Id).map((subjco: any, iIdx: number, arr: any[]) => (
                                    <tr key={iIdx} style={{ height: '17px', borderBottom: iIdx === arr.length - 1 ? '1px solid black' : 'none' }}>
                                        <td style={{ width: '40px' }} className='text-center font-bold'>{iIdx + 1}</td>
                                        <td style={{ width: '200px' }} className='text-left font-bold'>{subjco.ECACTA_SkillArea}</td>
                                        {/* Term I */}
                                        <td style={{ width: '100px' }} className='text-center font-bold'>
                                            {subjco.marksByTerm[1241] || ''}
                                        </td>
                                        {/* Term II */}
                                        <td style={{ width: '100px' }} className='text-center font-bold'>
                                            {subjco.marksByTerm[1243] || ''}
                                        </td>
                                        {/* Term III */}
                                        <td style={{ width: '100px' }} className='text-center font-bold'>
                                            {subjco.marksByTerm[1246] || ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* REMARKS & SIGNATURES */}
                <div style={{ marginTop: '10px' }}>
                    <table style={{ border: '1px solid black', width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr style={{ height: '60px', verticalAlign: 'top' }}>
                                <td style={{ padding: '5px' }}>
                                    Teacher&apos;s Remarks : <strong>{promotionRemarks.ecterE_Remarks}</strong>
                                </td>
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
        </div>
    );
}

export default function SophiaReportCardPreIIIView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;

    const report_list: any[] = [];
    const st_ThomosTotal = apiData?.st_ThomosTotal || [];
    const getstudentwisesubjectlistnew = apiData?.getstudentwisesubjectlistnew || [];
    const getstudentwisesubjectsubsubjectlist = apiData?.getstudentwisesubjectsubsubjectlist || [];
    const getstudentmarksindidetails = apiData?.getstudentmarksindidetails || [];
    const getstudentwiseactiviteslist = apiData?.getstudentwiseactiviteslist || [];
    const work_attendence = apiData?.work_attendence || [];

    st_ThomosTotal.forEach((dev: any) => {
        if (!report_list.some(r => r.AMST_Id === dev.AMST_Id)) {
            const stu = { ...dev };
            
            // Scholastic Areas processing
            const subjectsForStudent = getstudentwisesubjectlistnew.filter((x: any) => x.AMST_Id === stu.AMST_Id);
            const groupedSubjects: any = {};
            subjectsForStudent.forEach((subj: any) => {
                if (!groupedSubjects[subj.ISMS_Id]) {
                    groupedSubjects[subj.ISMS_Id] = {
                        ISMS_Id: subj.ISMS_Id,
                        ISMS_SubjectName: subj.ISMS_SubjectName,
                        EYCES_SubjectOrder: subj.EYCES_SubjectOrder,
                        exam1: null, exam2: null, exam3: null
                    };
                }
                if (subj.EME_Id === 1241) groupedSubjects[subj.ISMS_Id].exam1 = subj;
                else if (subj.EME_Id === 1243) groupedSubjects[subj.ISMS_Id].exam2 = subj;
                else if (subj.EME_Id === 1246) groupedSubjects[subj.ISMS_Id].exam3 = subj;
            });
            stu.subjecttList = Object.values(groupedSubjects).sort((a: any, b: any) => a.EYCES_SubjectOrder - b.EYCES_SubjectOrder);

            stu.sub_subjecttList = getstudentwisesubjectsubsubjectlist.filter((s: any) => s.AMST_Id === stu.AMST_Id);
            stu.studentmarks = getstudentmarksindidetails.filter((m: any) => m.AMST_Id === stu.AMST_Id);

            // Attendance processing
            const att = work_attendence.find((a: any) => a.AMST_Id === stu.AMST_Id);
            if (att) {
                stu.TotalSchoolDays = att.TotalSchoolDays;
                stu.TotalWorkingDays = att.TotalWorkingDays;
                stu.Total_Percentage = att.Total_Percentage;
            }

            // Co-Scholastic Areas processing
            const activityAreas: any[] = [];
            const groupedActivities: any = {};
            getstudentwiseactiviteslist.forEach((act: any) => {
                if (act.AMST_Id === stu.AMST_Id) {
                    if (!activityAreas.some(a => a.ECACT_Id === act.ECACT_Id)) {
                        activityAreas.push({ ECACT_SkillName: act.ECACT_SkillName, ECACT_Id: act.ECACT_Id });
                    }
                    if (!groupedActivities[act.ECACTA_SkillArea]) {
                        groupedActivities[act.ECACTA_SkillArea] = {
                            ECACTA_SkillArea: act.ECACTA_SkillArea,
                            ECACT_Id: act.ECACT_Id,
                            marksByTerm: {}
                        };
                    }
                    groupedActivities[act.ECACTA_SkillArea].marksByTerm[act.EME_Id] = act.EMGD_Name;
                }
            });
            stu.activity_main_list_area = activityAreas;
            stu.activity_main_list = Object.values(groupedActivities);

            report_list.push(stu);
        }
    });

    if (!report_list.length) {
        return <p className='p-4 text-center text-muted-foreground'>No report data available.</p>;
    }

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { 
                        size: A4; 
                        margin: 0mm; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background-color: #fff;
                    }
                    html, body { 
                        visibility: hidden !important; 
                    }
                    #pre-print-area, #pre-print-area * { 
                        visibility: visible !important; 
                    }
                    #pre-print-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 210mm;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print { 
                        display: none !important; 
                    }
                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                }
                #pre-print-area {
                    width: 210mm;
                    margin: 0 auto;
                    background-color: white;
                }
            `}</style>

            <div className='no-print flex justify-end px-5 py-2 bg-gray-100 border-b sticky top-0 z-50'>
                <Button onClick={() => window.print()} className='flex items-center gap-2 w-32'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='pre-print-area'>
                {report_list.map((stu) => (
                    <StudentCard key={stu.AMST_Id} student={stu} apiData={apiData} payload={payload} />
                ))}
            </div>
        </div>
    );
}
