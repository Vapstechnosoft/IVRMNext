'use client';

import { getCalcuttaPromotionReportI_IX } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report-ix';
import { Download, Loader2, Printer } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import CalcuttaPromotionReportForm from './report-form';

export default function CalcuttaPromotionReportI_IXList() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState<any>(null);

    const handleGenerate = async (data: any) => {
        try {
            setLoading(true);
            setPayload(data);
            const result = await getCalcuttaPromotionReportI_IX(data);
            setReportData(result);
        } catch (error) {
            console.error('Failed to generate report', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Implement excel export if needed
    };

    // Helper to format Date
    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB'); // dd/MM/yyyy
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="print:hidden">
                <CalcuttaPromotionReportForm onSuccess={handleGenerate} />
            </div>

            {loading && (
                <div className="flex h-64 items-center justify-center rounded-md border bg-card print:hidden">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!loading && reportData && reportData.studentdetails?.length > 0 && (
                <div className="rounded-md border bg-card p-4 print:border-none print:bg-transparent print:p-0">
                    <div className="mb-4 flex items-center justify-end gap-2 print:hidden">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                    </div>

                    <div className="print-content text-black">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @media print {
                                body {
                                    font-family: system-ui, -apple-system, sans-serif !important;
                                }
                                .page-break {
                                    page-break-after: always !important;
                                }
                                table {
                                    width: 100% !important;
                                    border-collapse: collapse !important;
                                    font-family: system-ui, -apple-system, sans-serif !important;
                                }
                                th, td {
                                    border: 0.5px solid black !important;
                                    padding: 4px !important;
                                }
                                .text-center { text-align: center !important; }
                                .text-left { text-align: left !important; }
                                .text-right { text-align: right !important; }
                                .bg-gray { background-color: #d1d5db !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
                                .font-bold { font-weight: bold !important; }
                            }
                        `}} />

                        {reportData.studentdetails.map((report: any, index: number) => (
                            <div key={index} className="page-break mb-8 print:mb-0">
                                {/* Header / Banner (Margin top 220 equivalent if needed, but keeping standard for modern web) */}
                                <div className="pt-[100px] print:pt-[150px]"></div>

                                <table className="mb-2 w-full table-fixed border-collapse border border-black" style={{ fontFamily: 'system-ui' }}>
                                    <caption className="relative top-4 text-center caption-top">
                                        <span className="border border-black bg-white px-8 py-1 text-[23px] font-semibold tracking-wide">
                                            ACADEMIC SESSION {payload?.ASMAY_Id ? reportData.getinstitution?.[0]?.asmaY_Year || '2023-2024' : ''}
                                        </span>
                                    </caption>
                                    <tbody>
                                        <tr>
                                            <td className="w-full border border-black p-4">
                                                <div className="flex w-full">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                                            <div className="font-bold">Student's Name</div>
                                                            <div>: {report.amsT_FirstName} {report.amsT_MiddleName} {report.amsT_LastName}</div>
                                                        </div>
                                                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                                            <div className="font-bold">Scholar No.</div>
                                                            <div>: {report.amsT_AdmNo}</div>
                                                        </div>
                                                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                                            <div className="font-bold">Total Students</div>
                                                            <div>: {reportData.studentdetails.length}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-1">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                                                                <div className="font-bold">Class & Sec</div>
                                                                <div>: {report.asmcL_ClassName} - {report.asmC_SectionName}</div>
                                                            </div>
                                                            <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                                                                <div className="font-bold">Roll No</div>
                                                                <div>: {report.amaY_RollNo}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex w-[100px] items-center justify-center text-right">
                                                            {report.amsT_Photoname && (
                                                                <div className="relative h-[100px] w-[100px] border border-gray-300">
                                                                    <Image src={report.amsT_Photoname} alt="Student Photo" fill className="object-contain" />
                                                                </div>
                                                            )}
                                                            {!report.amsT_Photoname && (
                                                                <div className="flex h-[100px] w-[100px] items-center justify-center border border-gray-300 bg-gray-100 text-xs text-gray-400">
                                                                    Photo
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Scholastic Marks Table */}
                                <div className="pt-2">
                                    <table className="w-full border-collapse border border-black text-sm" style={{ fontFamily: 'system-ui' }}>
                                        <thead>
                                            <tr>
                                                <td rowSpan={2} className="w-[300px] border border-black p-1 text-center font-bold break-words">
                                                    SUBJECTS
                                                </td>
                                                {reportData.getgroupdetails.map((grp: any, gIdx: number) => (
                                                    <td key={gIdx} colSpan={grp.groupewiseexam.length} className="border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]">
                                                        {grp.empG_DistplayName}
                                                    </td>
                                                ))}
                                                <td colSpan={2} className="border border-black bg-[#d1d5db] p-1 print:bg-[#d1d5db]">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className="w-[150px] border border-black p-1 text-center break-words font-bold">
                                                        {grpexam.examnamedisplay} <br />
                                                        {grpexam.examnamedisplay !== 'Highest in Class' && (
                                                            <span>[{grpexam.EMPSGE_ForMaxMarkrs}]</span>
                                                        )}
                                                    </th>
                                                ))}
                                                <th className="w-[100px] border border-black p-1 text-center font-bold">Grand Total<br />[200]</th>
                                                <th className="w-[150px] border border-black p-1 text-center font-bold">Yearly Avg</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Applicable Subjects */}
                                            {report.studentsubjects.map((subj: any, sIdx: number) => {
                                                if (!subj.EMPS_AppToResultFlg && !subj.empS_AppToResultFlg) return null;
                                                return (
                                                    <tr key={sIdx}>
                                                        <td className="border border-black p-1 text-left break-words">{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>

                                                        {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                            const isGrouped = subj.GropuFlag || subj.gropuFlag;
                                                            // Legacy condition: ng-if="(subj.GropuFlag !=1 || grpexam.EME_Id!=9800000 || subj.colspan!=-1)"
                                                            if (isGrouped && grpexam.EME_Id === 9800000 && subj.colspan === -1) return null;

                                                            // Legacy rowspan logic
                                                            const rs = (subj.colspan > 1 && isGrouped && grpexam.EME_Id !== 98000012 && grpexam.EME_Id === 9800000) ? subj.colspan : 1;

                                                            return (
                                                                <td key={eIdx} rowSpan={rs} className="border border-black p-1 text-center">
                                                                    {report.studentmarks.map((mrks: any, mIdx: number) => {
                                                                        if (
                                                                            (mrks.ISMS_Id === subj.ISMS_Id || mrks.ismS_Id === subj.ismS_Id) &&
                                                                            (mrks.EME_Id === grpexam.EME_Id || mrks.emE_Id === grpexam.EME_Id) &&
                                                                            (mrks.EMPSG_DisplayName === grpexam.EMPG_DistplayName || mrks.empsG_DisplayName === grpexam.EMPG_DistplayName)
                                                                        ) {
                                                                            const passFail = mrks.PassFailFlag || mrks.passFailFlag;
                                                                            const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                                                            const isGroup = mrks.GropuFlag || mrks.gropuFlag;
                                                                            const isGradeExam = grpexam.EME_ExamName === 'Grade';
                                                                            const isHighestExam = grpexam.EME_ExamName === 'Highest in Class';
                                                                            const displayMarks = mrks.EYCES_MarksDisplayFlg || mrks.eyceS_MarksDisplayFlg;
                                                                            const displayGrade = mrks.EYCES_GradeDisplayFlg || mrks.eyceS_GradeDisplayFlg;
                                                                            const subjCode = mrks.ISMS_SubjectCode || mrks.ismS_SubjectCode;
                                                                            const obtained = mrks.ObtainedMarks || mrks.obtainedMarks || 0;
                                                                            const maxMarks = mrks.maxmarks || mrks.EMPS_MaxMarks || 0;

                                                                            if (isAbsent) {
                                                                                if (!isGroup && !isGradeExam && displayMarks && obtained > 0) {
                                                                                    return <span key={mIdx}>{passFail} ({obtained})</span>;
                                                                                }
                                                                                if (grpexam.EME_Id !== 98000012 && grpexam.EME_Id !== 9800000) {
                                                                                    if (displayGrade && subjCode === 'ME') return <span key={mIdx}>-</span>;
                                                                                    if (subjCode !== 'ME') return <span key={mIdx}>{passFail}</span>;
                                                                                }
                                                                            }

                                                                            if (!isAbsent && !isGroup && !isGradeExam && !isHighestExam && displayMarks && grpexam.EME_Id !== 9800000) {
                                                                                return <span key={mIdx}>{obtained} {subjCode === 'SE' && `/ ${maxMarks}`}</span>;
                                                                            }

                                                                            if (!isAbsent && !isGroup && !isGradeExam && !isHighestExam && displayMarks && grpexam.EME_Id === 9800000) {
                                                                                if (obtained !== 0) {
                                                                                    return <span key={mIdx}>{obtained} {subjCode === 'SE' && `/ ${maxMarks}`}</span>;
                                                                                } else if (subjCode === 'SE' && obtained === 0) {
                                                                                    return <span key={mIdx}>AB</span>;
                                                                                }
                                                                            }

                                                                            if (!isAbsent && isHighestExam && displayMarks) {
                                                                                return <span key={mIdx}>{mrks.ESTMPPS_ClassHighest || mrks.estmppS_ClassHighest}</span>;
                                                                            }

                                                                            if (!isAbsent && isGroup && !isGradeExam && !isHighestExam && mrks.GroupMarks > 0) {
                                                                                return <span key={mIdx}>{mrks.GroupMarks}</span>;
                                                                            }

                                                                            if (!isAbsent && !isGroup && !isGradeExam && !isHighestExam && displayGrade && grpexam.EME_Id !== 9800000) {
                                                                                return <span key={mIdx}>-</span>;
                                                                            }

                                                                            if (!isAbsent && !isGroup && !isGradeExam && !isHighestExam && displayGrade && grpexam.EME_Id === 9800000) {
                                                                                return <span key={mIdx}>{mrks.ObtainedGrade || mrks.obtainedGrade}</span>;
                                                                            }

                                                                            if (!isAbsent && !isGroup && isGradeExam && displayGrade && grpexam.EME_Id === 98000012) {
                                                                                return <span key={mIdx}>{mrks.ESTMPPS_ObtainedGrade || mrks.estmppS_ObtainedGrade}</span>;
                                                                            }
                                                                        }
                                                                        return null;
                                                                    })}
                                                                </td>
                                                            );
                                                        })}

                                                        {/* Grand Total Column */}
                                                        {(!subj.GropuFlag && !subj.gropuFlag || subj.colspan !== -1) && (
                                                            <td rowSpan={(subj.colspan > 1 && (subj.GropuFlag || subj.gropuFlag)) ? subj.colspan : 1} className="border border-black p-1 text-center">
                                                                {(subj.GropuFlag || subj.gropuFlag) && !(subj.EYCES_GradeDisplayFlg || subj.eyceS_GradeDisplayFlg) && <span>{subj.GroupMarks}</span>}
                                                                {!(subj.GropuFlag || subj.gropuFlag) && !(subj.EYCES_GradeDisplayFlg || subj.eyceS_GradeDisplayFlg) && (subj.EYCES_MarksDisplayFlg || subj.eyceS_MarksDisplayFlg) && (
                                                                    <span>
                                                                        {subj.ESTMPPSG_GroupObtMarks || subj.estmppsG_GroupObtMarks} {(subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'SE' && `/ ${subj.EMPS_MaxMarks || subj.empS_MaxMarks}`}
                                                                    </span>
                                                                )}
                                                                {!(subj.GropuFlag || subj.gropuFlag) && (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'ME' && (subj.EYCES_GradeDisplayFlg || subj.eyceS_GradeDisplayFlg) && <span>-</span>}
                                                            </td>
                                                        )}

                                                        {/* Yearly Avg Column */}
                                                        {(!subj.GropuFlag && !subj.gropuFlag || subj.colspan !== -1) && (
                                                            <td rowSpan={(subj.colspan > 1 && (subj.GropuFlag || subj.gropuFlag)) ? subj.colspan : 1} className="border border-black p-1 text-center">
                                                                {(subj.GropuFlag || subj.gropuFlag) && !(subj.EYCES_GradeDisplayFlg || subj.eyceS_GradeDisplayFlg) && <span>{subj.GroupMarksnew}</span>}
                                                                {!(subj.GropuFlag || subj.gropuFlag) && !(subj.EYCES_GradeDisplayFlg || subj.eyceS_GradeDisplayFlg) && <span>{subj.YeralyGroupObtMarks || subj.yeralyGroupObtMarks}</span>}
                                                                {!(subj.GropuFlag || subj.gropuFlag) && (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'ME' && (subj.EYCES_GradeDisplayFlg || subj.eyceS_GradeDisplayFlg) && <span>-</span>}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}

                                            {/* Totals Row */}
                                            <tr>
                                                <td className="border border-black p-1 text-left font-bold">TOTAL</td>
                                                {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <td key={eIdx} className="border border-black p-1 text-center font-bold">
                                                        {report.student_marks.map((mrks: any, mIdx: number) => {
                                                            if ((mrks.EME_Id === grpexam.EME_Id || mrks.emE_Id === grpexam.EME_Id) && (mrks.EMPSG_DisplayName === grpexam.EMPG_DistplayName || mrks.empsG_DisplayName === grpexam.EMPG_DistplayName)) {
                                                                if (grpexam.EME_Id === 9800000) {
                                                                    return <span key={mIdx}>{mrks.ObtainedMarks || mrks.obtainedMarks} / {mrks.maxmarks || mrks.EMPS_MaxMarks}</span>;
                                                                }
                                                                if (grpexam.EME_Id === 9800001) {
                                                                    return <span key={mIdx}>{mrks.EMGD_Name || mrks.emgD_Name}</span>;
                                                                }
                                                            }
                                                            return null;
                                                        })}
                                                    </td>
                                                ))}
                                                <td className="border border-black p-1 text-center font-bold">
                                                    {reportData.getgradelist.filter((d: any) => d.AMST_Id === report.amsT_Id).map((dd: any) => `${Math.round(dd.GroupMarks_Total)}/${dd.maxmarks}`).join(', ')}
                                                </td>
                                                <td className="border border-black p-1 text-center font-bold">
                                                    {reportData.getgradelist.filter((d: any) => d.AMST_Id === report.amsT_Id).map((dd: any) => `${Math.round(dd.YearlyMarks_Total)}/${dd.maxmarks / 2}`).join(', ')}
                                                </td>
                                            </tr>

                                            {/* Percentage Row */}
                                            <tr>
                                                <td className="border border-black p-1 text-left font-bold">PERCENTAGE</td>
                                                {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <td key={eIdx} className="border border-black p-1 text-center font-bold">
                                                        {report.student_marks.map((mrks: any, mIdx: number) => {
                                                            if ((mrks.EME_Id === grpexam.EME_Id || mrks.emE_Id === grpexam.EME_Id) && (mrks.EMPSG_DisplayName === grpexam.EMPG_DistplayName || mrks.empsG_DisplayName === grpexam.EMPG_DistplayName) && grpexam.EME_Id === 9800000) {
                                                                return <span key={mIdx}>{mrks.TotalPercentage || mrks.totalPercentage}%</span>;
                                                            }
                                                            return null;
                                                        })}
                                                    </td>
                                                ))}
                                                <td className="border border-black p-1 text-center font-bold">
                                                    {reportData.getgradelist.filter((d: any) => d.AMST_Id === report.amsT_Id).map((dd: any) => `${dd.GroupMarks_PER}%`).join(', ')}
                                                </td>
                                                <td className="border border-black p-1 text-center font-bold">
                                                    {reportData.getgradelist.filter((d: any) => d.AMST_Id === report.amsT_Id).map((dd: any) => `${dd.YearlyMarks_PER}%`).join(', ')}
                                                </td>
                                            </tr>

                                            {/* Attendance Row */}
                                            <tr>
                                                <td className="border border-black p-1 text-left font-bold">Attendance</td>
                                                {reportData.getgroupdetails.map((grp: any, gIdx: number) => (
                                                    <td key={gIdx} colSpan={grp.groupewiseexam.length} className="border border-black p-1 text-center font-bold">
                                                        {report.attendance.filter((att: any) => att.term === grp.empG_DistplayName).map((att: any, aIdx: number) => (
                                                            <span key={aIdx}>{att.percentage}%</span>
                                                        ))}
                                                    </td>
                                                ))}
                                                <td colSpan={2} className="border border-black p-1 text-center font-bold">
                                                    {report.attendance.filter((att: any) => att.term === 'Att_Average').map((att: any, aIdx: number) => (
                                                        <span key={aIdx}>{att.percentage}%</span>
                                                    ))}
                                                </td>
                                            </tr>

                                            {/* Non-Applicable Subjects (e.g. Co-scholastic grades mapped as subjects) */}
                                            {report.studentsubjects.map((subj: any, sIdx: number) => {
                                                if (subj.EMPS_AppToResultFlg || subj.empS_AppToResultFlg) return null;
                                                return (
                                                    <tr key={`non-app-${sIdx}`}>
                                                        <td className="border border-black p-1 text-left font-bold break-words">{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>
                                                        {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                            <td key={eIdx} className="border border-black p-1 text-center">
                                                                {report.studentmarks.map((mrks: any, mIdx: number) => {
                                                                    if (
                                                                        (mrks.ISMS_Id === subj.ISMS_Id || mrks.ismS_Id === subj.ismS_Id) &&
                                                                        (mrks.EME_Id === grpexam.EME_Id || mrks.emE_Id === grpexam.EME_Id) &&
                                                                        (mrks.EMPSG_DisplayName === grpexam.EMPG_DistplayName || mrks.empsG_DisplayName === grpexam.EMPG_DistplayName)
                                                                    ) {
                                                                        const passFail = mrks.PassFailFlag || mrks.passFailFlag;
                                                                        const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                                                        const isGradeExam = grpexam.EME_ExamName === 'Grade';
                                                                        const obtained = mrks.ObtainedMarks || mrks.obtainedMarks || 0;

                                                                        if (isAbsent) {
                                                                            return <span key={mIdx}>{passFail} {!isGradeExam && obtained > 0 ? `(${obtained})` : ''}</span>;
                                                                        }
                                                                        if (!isAbsent && !isGradeExam) {
                                                                            return <span key={mIdx}>{obtained}</span>;
                                                                        }
                                                                        if (!isAbsent && isGradeExam) {
                                                                            return <span key={mIdx}>{mrks.ObtainedGrade || mrks.obtainedGrade}</span>;
                                                                        }
                                                                    }
                                                                    return null;
                                                                })}
                                                            </td>
                                                        ))}
                                                        {/* Pad missing columns */}
                                                        <td className="border border-black p-1 text-center"></td>
                                                        <td className="border border-black p-1 text-center"></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Skills Section (Co-Scholastic) */}
                                {reportData.skilllist_temp && reportData.skilllist_temp.length > 0 && (
                                    <div className="flex flex-wrap pt-2">
                                        {reportData.skilllist_temp.map((skill: any, skIdx: number) => (
                                            <div key={skIdx} className="w-full sm:w-1/2 p-1">
                                                <table className="w-full border-collapse border border-black text-sm" style={{ fontFamily: 'system-ui' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td className="border border-black p-1 font-bold">{skill.ECS_SkillName}</td>
                                                            {reportData.gettermdetails.map((cos: any, cIdx: number) => (
                                                                <td key={cIdx} className="border border-black bg-[#d1d5db] p-1 text-center print:bg-[#d1d5db]">{cos.ecT_TermName}</td>
                                                            ))}
                                                        </tr>
                                                        {reportData.activitylist_temp.filter((ax: any) => ax.ECS_Id === skill.ECS_Id).map((skillx: any, axIdx: number) => (
                                                            <tr key={axIdx}>
                                                                <td className="border border-black p-1">{skillx.ECSA_SkillArea}</td>
                                                                {reportData.gettermdetails.map((cosx: any, cIdx: number) => (
                                                                    <td key={cIdx} className="border border-black p-1 text-center">
                                                                        {report.studentSkills.filter((gradex: any) => gradex.ECT_Id === cosx.ecT_Id && gradex.ECSA_Id === skillx.ECSA_Id).map((gradex: any, gxIdx: number) => (
                                                                            <span key={gxIdx}>{gradex.EMGD_Name}</span>
                                                                        ))}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Promotion Status */}
                                <div className="pt-2">
                                    <table className="w-full border-collapse border border-black text-sm" style={{ fontFamily: 'system-ui' }}>
                                        <tbody>
                                            <tr>
                                                <th className="border border-black bg-gray-500 p-2 text-center font-bold text-white print:bg-gray-500">PROMOTION STATUS</th>
                                            </tr>
                                            <tr>
                                                <td className="border border-black p-2 text-left font-bold">
                                                    {report.remarks}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures */}
                                <div className="mt-20 print:mt-[100px]">
                                    <table className="w-full border-collapse text-sm" style={{ fontFamily: 'system-ui' }}>
                                        <tbody>
                                            <tr>
                                                <th className="text-left font-bold w-1/3">Principal's Signature</th>
                                                <th className="text-center font-bold w-1/3">Class Teacher's Signature</th>
                                                <th className="text-right font-bold w-1/3">Parent's Signature</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Dates */}
                                <div className="pt-8">
                                    <table className="w-full text-sm" style={{ fontFamily: 'system-ui' }}>
                                        <tbody>
                                            <tr>
                                                <td className="text-left">
                                                    <b>Date of Issue: </b> &nbsp;{formatDate(payload?.issueDate)}<br />
                                                    <b>New Academic Session Commences on: </b> &nbsp;{formatDate(payload?.academicDate)}
                                                </td>
                                                <td className="text-right align-top">
                                                    <b>Report Card Printed On : {formatDate(payload?.reportPrintedDate)}</b> <br />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
