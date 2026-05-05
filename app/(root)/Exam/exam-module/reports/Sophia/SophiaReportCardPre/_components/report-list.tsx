'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

function StudentCard({ student, apiData, payload }: { student: any; apiData: any; payload: any }) {
    const promotionRemarks = apiData?.examwiseremarks?.find((r: any) => r.AMST_Id === student.AMST_Id) || {};
    
    // Legacy mapping: Term 1: 1241, Term 2: 1243, Term 3: 1246
    const terms = [
        { id: 1241, name: 'Term I' },
        { id: 1243, name: 'Term II' },
        { id: 1246, name: 'Term III' }
    ];

    return (
        <div style={{ pageBreakBefore: 'always', padding: '0', marginBottom: '30px', fontFamily: 'Arial, sans-serif', color: 'black' }}>
            <style>{`
                .report-body { padding: 0 10px; }
                .margin-top-100 { margin-top: 100px; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                
                table { border-collapse: collapse; width: 100%; }
                .table-bordered { border: 1px solid black; }
                .table-bordered td, .table-bordered th { border: 1px solid black; padding: 2px 4px; }
                
                .student-info-table td { border: 0.5px solid grey !important; padding: 5px; }
                .perf-table { font-size: 11px; border: 1px solid black; }
                .perf-table th, .perf-table td { border: 1px solid black !important; }
                
                .section-header { padding-left: 12% !important; height: 25px; vertical-align: bottom !important; font-weight: bold; }
                .habit-table { font-size: 14px; border: 1px solid black; }
                .habit-table td { border: 1px solid black !important; height: 17px; padding: 3px; }
            `}</style>

            <div className="report-body">
                {/* MARGIN TOP 100 */}
                <div className="margin-top-100">
                    <div style={{ display: 'flex', width: '100%', fontWeight: 'bold', fontSize: '14px' }}>
                        <div style={{ width: '58.333%', textAlign: 'right', paddingRight: '20px' }}>{payload?.examName}</div>
                        <div style={{ width: '41.666%', textAlign: 'right', paddingRight: '20px' }}>{payload?.yearName || '2025-2026'}</div>
                    </div>
                </div>

                {/* STUDENT INFO TABLE */}
                <table className="student-info-table" style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td>
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
                                            <div style={{ width: '160px' }}>Standard Strength</div>
                                            <div style={{ flex: 1 }}> : {apiData?.examwisemarksprocess?.[0]?.classstrength || 0}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ width: '160px' }}>Division Strength</div>
                                            <div style={{ flex: 1 }}> : {apiData?.examwisemarksprocess?.[0]?.Sectionstrength || 0}</div>
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
                        PERFORMANCE OF THE YEAR {payload?.yearName || '2025-2026'}
                    </p>
                </div>

                {/* SCHOLASTIC AREAS TABLE */}
                <table className="perf-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ height: '30px' }}>
                            <th className="text-center" style={{ width: '40px' }}>Sl. No</th>
                            <th className="text-center" style={{ width: '200px' }}>Subjects</th>
                            {terms.map(t => <th key={t.id} className="text-center" style={{ width: '100px' }}>{t.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='text-left'>
                            <td colSpan={5} className="section-header">
                                <div style={{ margin: '-3px', position: 'relative', top: '1px' }}>SCHOLASTIC AREAS</div>
                            </td>
                        </tr>
                    </tbody>
                    {student.subjecttList?.map((subject: any, sIdx: number) => (
                        <tbody key={sIdx}>
                            <tr style={{ height: '17px' }}>
                                <td className='text-center font-bold'>{sIdx + 1}</td>
                                <td className='text-left font-bold'>{subject.ISMS_SubjectName}</td>
                                {terms.map(t => {
                                    const examData = subject[`exam${terms.indexOf(t) + 1}`];
                                    return (
                                        <td key={t.id} className='text-center font-bold'>
                                            {examData ? (
                                                examData.ESTMPS_ObtainedMarks === 0 && !examData.ESTMPS_ObtainedGrade ? 'AB' : examData.ESTMPS_ObtainedGrade
                                            ) : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                            {student.sub_subjecttList?.filter((sub: any) => sub.ISMS_Id === subject.ISMS_Id).map((sub: any, ssIdx: number) => (
                                <tr key={`${sIdx}-${ssIdx}`} style={{ height: '17px' }}>
                                    <td></td>
                                    <td className='text-left' style={{ paddingLeft: '10px' }}>&nbsp;&nbsp;&nbsp;{sub.EMSS_SubSubjectName}</td>
                                    {terms.map(t => {
                                        const markEntry = student.studentmarks?.find((m: any) => m.EME_Id === t.id && m.ISMS_Id === subject.ISMS_Id && m.EMSS_Id === sub.EMSS_Id);
                                        return (
                                            <td key={t.id} className='text-center'>
                                                {markEntry ? (markEntry.ESTMPSSS_PassFailFlg === 'AB' ? 'AB' : (markEntry.ESTMPSSS_ObtainedGrade || '')) : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    ))}
                </table>

                {/* STUDY HABITS HEADER */}
                <table style={{ borderLeft: '0.5px solid black', borderRight: '0.5px solid black', marginTop: '0' }}>
                    <tbody>
                        <tr style={{ height: '25px' }}>
                            <td className="section-header">STUDY HABITS</td>
                        </tr>
                    </tbody>
                </table>

                {/* HABITS CONTENT */}
                {student.activity_main_list_area?.map((acti: any, aIdx: number) => (
                    <div key={aIdx}>
                        {aIdx > 0 && (
                            <table style={{ borderLeft: '0.5px solid black', borderRight: '0.5px solid black' }}>
                                <tbody>
                                    <tr style={{ height: '25px' }}>
                                        <td className="section-header">PERSONAL AND SOCIAL HABITS</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                        <table className="habit-table">
                            <tbody>
                                {student.activity_main_list?.filter((act: any) => act.ECACT_Id === acti.ECACT_Id).map((subjco: any, iIdx: number) => (
                                    <tr key={iIdx}>
                                        <td style={{ width: '40px' }} className='text-center font-bold'>{iIdx + 1}</td>
                                        <td style={{ width: '200px' }} className='text-left font-bold'>{subjco.ECACTA_SkillArea}</td>
                                        {terms.map(t => (
                                            <td key={t.id} style={{ width: '100px' }} className='text-center font-bold'>
                                                {subjco.marksByTerm[t.id] || ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* REMARKS & SIGNATURES */}
                <div style={{ marginTop: '0' }}>
                    <br />
                    <table style={{ border: '0.5px solid black', width: '100%' }}>
                        <tbody>
                            <tr style={{ height: '60px', verticalAlign: 'top' }}>
                                <td style={{ padding: '5px' }}>
                                    Teacher&apos;s Remarks : <strong>{promotionRemarks.ecterE_Remarks}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table style={{ border: '0.5px solid black', borderTop: 'none', borderCollapse: 'collapse', width: '100%' }}>
                        <tbody>
                            <tr style={{ height: '60px' }}>
                                <td className='text-center' style={{ verticalAlign: 'bottom', width: '33.33%', borderRight: '0.5px solid black' }}>CLASS TEACHER</td>
                                <td className='text-center' style={{ verticalAlign: 'bottom', width: '33.33%', borderRight: '0.5px solid black' }}>PRINCIPAL</td>
                                <td className='text-center' style={{ verticalAlign: 'bottom', width: '33.33%' }}>PARENT</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function SophiaReportCardPreView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;

    const report_list: any[] = [];
    const examwisedetailsnew = apiData?.examwisedetailsnew || [];
    const getstudentwisesubjectlistnew = apiData?.getstudentwisesubjectlistnew || [];
    const getstudentwisesubjectsubsubjectlist = apiData?.getstudentwisesubjectsubsubjectlist || [];
    const getstudentmarksindidetails = apiData?.getstudentmarksindidetails || [];
    const getstudentwiseactiviteslist = apiData?.getstudentwiseactiviteslist || [];
    const work_attendence = apiData?.work_attendence || [];

    examwisedetailsnew.forEach((dev: any) => {
        if (!report_list.some(r => r.AMST_Id === dev.AMST_Id)) {
            const stu = { ...dev };
            
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

            const att = work_attendence.find((a: any) => a.AMST_Id === stu.AMST_Id);
            if (att) {
                stu.TotalSchoolDays = att.TotalSchoolDays;
                stu.TotalWorkingDays = att.TotalWorkingDays;
                stu.Total_Percentage = att.Total_Percentage;
            }

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
                    @page { size: A4; margin: 0; }
                    body { margin: 0; padding: 0; }
                    html, body { visibility: hidden !important; }
                    #pre-print-area, #pre-print-area * { visibility: visible !important; }
                    #pre-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>

            <div className='no-print flex justify-end px-5 py-2'>
                <Button onClick={() => window.print()} className='flex items-center gap-2 w-32'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='pre-print-area' style={{ padding: '20px' }}>
                {report_list.map((stu) => (
                    <StudentCard key={stu.AMST_Id} student={stu} apiData={apiData} payload={payload} />
                ))}
            </div>
        </div>
    );
}
