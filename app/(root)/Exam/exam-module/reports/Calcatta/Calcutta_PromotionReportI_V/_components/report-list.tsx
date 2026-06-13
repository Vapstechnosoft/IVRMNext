'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportViewProps {
    data: any;
    dateInfo: any;
    institution: any;
}

const CalcuttaPromotionReportView = ({ data, dateInfo, institution }: CalcuttaPromotionReportViewProps) => {
    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Excel export stub
    };

    if (!data || !data.studentdetails || data.studentdetails.length === 0) {
        return (
            <div className='flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm'>
                <p className='font-medium text-gray-500 text-lg'>No data available. Please generate the report.</p>
            </div>
        );
    }

    const { getgroupdetails = [], groupwiseexamlist = [], studentdetails = [] } = data;

    // Helper to format Date
    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB'); // dd/MM/yyyy
    };

    return (
        <div className="flex flex-col gap-4">
            <div className='print:hidden mb-4 flex justify-end gap-2'>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="inline-flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Export Excel
                </Button>
                <Button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 bg-primary text-white"
                >
                    <Printer className="h-4 w-4" />
                    Print
                </Button>
            </div>

            <div id='printable-area' className="printable-content text-black">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body {
                            font-family: system-ui, -apple-system, sans-serif !important;
                            visibility: hidden;
                        }
                        #printable-area, #printable-area * {
                            visibility: visible;
                        }
                        #printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
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

                {studentdetails.map((student: any, index: number) => {
                    const remarksObj = data.getpromotionremarksdetails?.find(
                        (d: any) => (d.AMST_Id || d.amsT_Id) === (student.AMST_Id || student.amsT_Id)
                    );
                    const remarks = remarksObj?.eprD_Remarks ?? student.remarks ?? '';
                    const conduct = remarksObj?.eprD_PromotionName ?? '';

                    // 1. Filter applicable subjects (all subjects returned)
                    const applicableSubjects = (student.studentsubjects || []).filter((subj: any) => {
                        const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                        return appToResult === true || appToResult === 'true';
                    });

                    // 2. Group subjects by esG_SubjectGroupName
                    const groupMap: { [key: string]: any[] } = {};
                    applicableSubjects.forEach((subj: any) => {
                        const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                        const isGrouped = subj.GropuFlag === 1 || subj.GropuFlag === '1' || subj.GropuFlag === true || subj.GropuFlag === 'true' ||
                            subj.gropuFlag === 1 || subj.gropuFlag === '1' || subj.gropuFlag === true || subj.gropuFlag === 'true';
                        if (isGrouped && groupName) {
                            const trimmed = groupName.trim();
                            if (!groupMap[trimmed]) {
                                groupMap[trimmed] = [];
                            }
                            groupMap[trimmed].push(subj);
                        }
                    });

                    // 3. Map subject IDs to their rowSpan and group size
                    const subjRowSpanMap = new Map<number, number>();
                    const subjGroupSizeMap = new Map<number, number>();

                    applicableSubjects.forEach((subj: any) => {
                        const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                        const isGrouped = subj.GropuFlag === 1 || subj.GropuFlag === '1' || subj.GropuFlag === true || subj.GropuFlag === 'true' ||
                            subj.gropuFlag === 1 || subj.gropuFlag === '1' || subj.gropuFlag === true || subj.gropuFlag === 'true';
                        const currentSubjId = subj.ISMS_Id ?? subj.ismS_Id;

                        if (isGrouped && groupName) {
                            const trimmed = groupName.trim();
                            const groupSubjs = groupMap[trimmed];
                            // Sort by grporder to ensure consistent ordering
                            groupSubjs.sort((a, b) => (a.grporder ?? 0) - (b.grporder ?? 0));
                            const firstSubj = groupSubjs[0];
                            const firstSubjId = firstSubj.ISMS_Id ?? firstSubj.ismS_Id;

                            if (Number(currentSubjId) === Number(firstSubjId)) {
                                subjRowSpanMap.set(currentSubjId, groupSubjs.length);
                            } else {
                                subjRowSpanMap.set(currentSubjId, -1);
                            }
                            subjGroupSizeMap.set(currentSubjId, groupSubjs.length);
                        } else {
                            subjRowSpanMap.set(currentSubjId, 1);
                            subjGroupSizeMap.set(currentSubjId, 1);
                        }
                    });

                    // Helper to check mark record
                    const getMarkRecord = (subjId: number, emeId: number, termName: string) => {
                        return student.studentmarks?.find((mrks: any) => {
                            const mSubjId = mrks.ISMS_Id ?? mrks.ismS_Id;
                            const mEmeId = mrks.EME_Id ?? mrks.emE_Id;
                            const mGrpName = (mrks.EMPSG_DisplayName ?? mrks.empsG_DisplayName ?? mrks.EMPSG_GroupName ?? mrks.empG_GroupName ?? '')?.trim().toUpperCase();
                            const targetGrpName = termName.trim().toUpperCase();

                            return Number(mSubjId) === Number(subjId) && Number(mEmeId) === Number(emeId) && mGrpName === targetGrpName;
                        });
                    };

                    // Helper to get semester total for a single subject
                    const getSubjectSemesterTotal = (subj: any, grp: any) => {
                        const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                        const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;
                        const exams = grp.groupewiseexam?.filter((e: any) => Number(e.EME_Id) !== 9800000 && Number(e.EME_Id) !== 98000012) || [];

                        let totalObt = 0;
                        let totalMax = 0;
                        let allAbsent = true;
                        let hasMarks = false;

                        exams.forEach((exam: any) => {
                            const rec = getMarkRecord(subjId, exam.EME_Id, grpName);
                            if (rec) {
                                hasMarks = true;
                                const passFail = rec.PassFailFlag ?? rec.passFailFlag;
                                const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                if (!isAbsent) {
                                    allAbsent = false;
                                    totalObt += Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? 0);
                                }
                                totalMax += Number(rec.maxMarks ?? rec.maxmarks ?? rec.maxMarks ?? exam.EMPSGE_ForMaxMarkrs ?? 0);
                            } else {
                                totalMax += Number(exam.EMPSGE_ForMaxMarkrs ?? 0);
                            }
                        });

                        return {
                            obtained: hasMarks ? (allAbsent ? 'AB' : totalObt) : null,
                            max: totalMax
                        };
                    };

                    // Helper to get semester total for a group
                    const getGroupSemesterTotal = (groupName: string, grp: any) => {
                        const subjsInGroup = groupMap[groupName.trim()] || [];
                        let sumObt = 0;
                        let sumMax = 0;
                        let count = 0;

                        subjsInGroup.forEach((s: any) => {
                            const tot = getSubjectSemesterTotal(s, grp);
                            if (tot.obtained !== null) {
                                if (typeof tot.obtained === 'number') {
                                    sumObt += tot.obtained;
                                }
                                sumMax += tot.max;
                                count++;
                            }
                        });

                        if (count === 0) return { obtained: null, max: 0 };
                        return {
                            obtained: Math.round(sumObt / count),
                            max: Math.round(sumMax / count)
                        };
                    };

                    // Helper to get Grand Total for a subject (sum of Sem 1 & Sem 2)
                    const getGrandTotal = (subj: any) => {
                        const isSubjGrouped = subj.GropuFlag === 1 || subj.GropuFlag === '1' || subj.GropuFlag === true || subj.GropuFlag === 'true' ||
                            subj.gropuFlag === 1 || subj.gropuFlag === '1' || subj.gropuFlag === true || subj.gropuFlag === 'true';
                        const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;

                        let sem1Obt: number | string | null = null;
                        let sem1Max = 0;
                        let sem2Obt: number | string | null = null;
                        let sem2Max = 0;

                        const sem1Group = getgroupdetails.find((g: any) => g.empsG_Order === 1 || g.empG_Order === 1);
                        const sem2Group = getgroupdetails.find((g: any) => g.empsG_Order === 2 || g.empG_Order === 2);

                        if (isSubjGrouped && groupName) {
                            if (sem1Group) {
                                const tot1 = getGroupSemesterTotal(groupName, sem1Group);
                                sem1Obt = tot1.obtained;
                                sem1Max = tot1.max;
                            }
                            if (sem2Group) {
                                const tot2 = getGroupSemesterTotal(groupName, sem2Group);
                                sem2Obt = tot2.obtained;
                                sem2Max = tot2.max;
                            }
                        } else {
                            if (sem1Group) {
                                const tot1 = getSubjectSemesterTotal(subj, sem1Group);
                                sem1Obt = tot1.obtained;
                                sem1Max = tot1.max;
                            }
                            if (sem2Group) {
                                const tot2 = getSubjectSemesterTotal(subj, sem2Group);
                                sem2Obt = tot2.obtained;
                                sem2Max = tot2.max;
                            }
                        }

                        let grandObt: number | string | null = null;
                        if (typeof sem1Obt === 'number' || typeof sem2Obt === 'number') {
                            grandObt = (Number(sem1Obt) || 0) + (Number(sem2Obt) || 0);
                        } else if (sem1Obt === 'AB' && sem2Obt === 'AB') {
                            grandObt = 'AB';
                        }

                        return {
                            obtained: grandObt,
                            max: sem1Max + sem2Max
                        };
                    };

                    // Helper for Yearly Average
                    const getYearlyAvg = (subj: any) => {
                        const gt = getGrandTotal(subj);
                        if (typeof gt.obtained === 'number') {
                            const val = gt.obtained / 2;
                            return {
                                obtained: val % 1 === 0 ? val : Number(val.toFixed(1)),
                                max: Math.round(gt.max / 2)
                            };
                        }
                        return {
                            obtained: gt.obtained,
                            max: Math.round(gt.max / 2)
                        };
                    };

                    // Helper to get sum of all subjects for a semester (TOTAL row)
                    const getSemesterTotalSum = (grp: any) => {
                        let sumObt = 0;
                        let sumMax = 0;
                        let hasMarks = false;

                        applicableSubjects.forEach((subj: any) => {
                            const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                            const rowSpan = subjRowSpanMap.get(subjId);
                            if (rowSpan !== undefined && rowSpan === -1) {
                                // Skip grouped subjects that are not the first
                                return;
                            }

                            const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                            const isGrouped = subj.GropuFlag === 1 || subj.GropuFlag === '1' || subj.GropuFlag === true || subj.GropuFlag === 'true' ||
                                subj.gropuFlag === 1 || subj.gropuFlag === '1' || subj.gropuFlag === true || subj.gropuFlag === 'true';

                            // Skip grade-only subjects
                            const isGradeOnly = (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                                !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);
                            if (isGradeOnly) return;

                            if (isGrouped && groupName) {
                                const tot = getGroupSemesterTotal(groupName, grp);
                                if (tot.obtained !== null && typeof tot.obtained === 'number') {
                                    sumObt += tot.obtained;
                                    sumMax += tot.max;
                                    hasMarks = true;
                                }
                            } else {
                                const tot = getSubjectSemesterTotal(subj, grp);
                                if (tot.obtained !== null && typeof tot.obtained === 'number') {
                                    sumObt += tot.obtained;
                                    sumMax += tot.max;
                                    hasMarks = true;
                                }
                            }
                        });

                        return hasMarks ? { obtained: sumObt, max: sumMax } : null;
                    };

                    const sem1Group = getgroupdetails.find((g: any) => g.empsG_Order === 1 || g.empG_Order === 1);
                    const sem2Group = getgroupdetails.find((g: any) => g.empsG_Order === 2 || g.empG_Order === 2);

                    const sem1Sum = sem1Group ? getSemesterTotalSum(sem1Group) : null;
                    const sem2Sum = sem2Group ? getSemesterTotalSum(sem2Group) : null;

                    const grandTotalSumObt = (sem1Sum?.obtained ?? 0) + (sem2Sum?.obtained ?? 0);
                    const grandTotalSumMax = (sem1Sum?.max ?? 0) + (sem2Sum?.max ?? 0);

                    return (
                        <div key={index} className="page-break mb-8 print:mb-0 max-w-[1000px] mx-auto bg-white p-4">
                            {/* Header spacing for pre-printed card headers */}
                            <div className="pt-[100px] print:pt-[150px]"></div>

                            <table className="mb-2 w-full table-fixed border-collapse border border-black" style={{ fontFamily: 'system-ui' }}>
                                <caption className="relative top-4 text-center caption-top">
                                    <span className="border border-black bg-white px-8 py-1 text-[23px] font-semibold tracking-wide uppercase">
                                        ACADEMIC SESSION {student.asmaY_Year || data.getinstitution?.[0]?.asmaY_Year || ''}
                                    </span>
                                </caption>
                                <tbody>
                                    <tr>
                                        <td className="w-full border border-black p-4">
                                            <div className="flex w-full">
                                                <div className="flex-1 space-y-2">
                                                    <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]">
                                                        <div className="font-bold">Student's Name</div>
                                                        <div className="uppercase">: {student.amsT_FirstName ?? student.studentname ?? ''} {student.amsT_MiddleName ?? ''} {student.amsT_LastName ?? ''}</div>
                                                    </div>
                                                    <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]">
                                                        <div className="font-bold">Scholar No.</div>
                                                        <div>: {student.amsT_AdmNo ?? student.admno ?? ''}</div>
                                                    </div>
                                                    <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]">
                                                        <div className="font-bold">Total Students</div>
                                                        <div>: {studentdetails.length}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-1">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]">
                                                            <div className="font-bold">Class & Sec</div>
                                                            <div className="uppercase">: {student.asmcL_ClassName ?? student.classname ?? ''} - {student.asmC_SectionName ?? student.sectionname ?? ''}</div>
                                                        </div>
                                                        <div className="grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]">
                                                            <div className="font-bold">Roll No</div>
                                                            <div>: {student.amaY_RollNo ?? student.rollno ?? ''}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex w-[100px] items-center justify-center text-right">
                                                        {(student.amsT_Photoname ?? student.AMST_Photoname) ? (
                                                            <div className="relative h-[100px] w-[100px] border border-gray-300">
                                                                <img src={student.amsT_Photoname ?? student.AMST_Photoname} alt="Student Photo" className="h-full w-full object-contain" />
                                                            </div>
                                                        ) : (
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
                                            <td rowSpan={2} className="w-[300px] border border-black p-1 text-center font-bold break-words bg-[#d1d5db] print:bg-[#d1d5db]">
                                                SUBJECTS
                                            </td>
                                            {getgroupdetails.map((grp: any, gIdx: number) => (
                                                <td key={gIdx} colSpan={grp.groupewiseexam?.length || 1} className="border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db] uppercase">
                                                    {grp.empG_DistplayName}
                                                </td>
                                            ))}
                                            <td rowSpan={2} className="border border-black bg-[#d1d5db] p-1 print:bg-[#d1d5db] text-center font-bold w-[100px]">Grand Total<br />[200]</td>
                                            <td rowSpan={2} className="border border-black bg-[#d1d5db] p-1 print:bg-[#d1d5db] text-center font-bold w-[150px]">Yearly Avg</td>
                                        </tr>
                                        <tr>
                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                <th key={eIdx} className="w-[150px] border border-black p-1 text-center break-words font-bold">
                                                    {grpexam.examnamedisplay} <br />
                                                    {grpexam.examnamedisplay !== 'Highest in Class' && grpexam.EME_Id !== 98000012 && (
                                                        <span>[{grpexam.EMPSGE_ForMaxMarkrs}]</span>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Applicable Subjects */}
                                        {applicableSubjects.map((subj: any, sIdx: number) => {
                                            const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                            const isSubjGrouped = subj.GropuFlag === 1 || subj.GropuFlag === '1' || subj.GropuFlag === true || subj.GropuFlag === 'true' ||
                                                subj.gropuFlag === 1 || subj.gropuFlag === '1' || subj.gropuFlag === true || subj.gropuFlag === 'true';

                                            const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                                            const rowSpanVal = subjRowSpanMap.get(subjId) ?? 1;

                                            const isGradeOnly = (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                                                !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);
                                            const isSE = (subj.ISMS_SubjectCode ?? subj.ismS_SubjectCode) === 'SE';

                                            return (
                                                <tr key={sIdx}>
                                                    <td className="border border-black p-1 text-left font-bold break-words">{subj.ISMS_SubjectName || subj.ismS_SubjectName}</td>

                                                    {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                        const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                        const isHighestCol = Number(grpexam.EME_Id) === 98000012;

                                                        if (isSubjGrouped && isTotalCol && rowSpanVal === -1) return null;

                                                        const rs = (isSubjGrouped && isTotalCol) ? rowSpanVal : 1;

                                                        return (
                                                            <td key={eIdx} rowSpan={rs} className="border border-black p-1 text-center">
                                                                {(() => {
                                                                    const grpName = grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;

                                                                    if (isTotalCol) {
                                                                        if (isSubjGrouped && groupName) {
                                                                            const tot = getGroupSemesterTotal(groupName, { empG_DistplayName: grpName });
                                                                            if (tot.obtained === null) return '-';
                                                                            return isSE ? `${tot.obtained} / ${tot.max}` : tot.obtained;
                                                                        } else {
                                                                            if (isGradeOnly) {
                                                                                const rec = getMarkRecord(subjId, 9800000, grpName);
                                                                                return rec?.obtainedGrade ?? rec?.ObtainedGrade ?? '-';
                                                                            }
                                                                            const tot = getSubjectSemesterTotal(subj, { empG_DistplayName: grpName });
                                                                            if (tot.obtained === null) return '-';
                                                                            return isSE ? `${tot.obtained} / ${tot.max}` : tot.obtained;
                                                                        }
                                                                    }

                                                                    if (isHighestCol) {
                                                                        const rec = getMarkRecord(subjId, 98000012, grpName);
                                                                        if (isGradeOnly) {
                                                                            return rec?.estmppS_ObtainedGrade ?? rec?.ESTMPPS_ObtainedGrade ?? '-';
                                                                        }
                                                                        return rec?.ESTMPPS_ClassHighest ?? rec?.estmppS_ClassHighest ?? '';
                                                                    }

                                                                    // Individual Exam marks
                                                                    if (isGradeOnly) return '-';

                                                                    const rec = getMarkRecord(subjId, grpexam.EME_Id, grpName);
                                                                    if (!rec) return '';

                                                                    const passFail = rec.PassFailFlag ?? rec.passFailFlag;
                                                                    const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                                                    if (isAbsent) return passFail;

                                                                    const obt = rec.ObtainedMarks ?? rec.obtainedMarks ?? '';
                                                                    const mx = rec.maxMarks ?? rec.maxmarks ?? rec.maxMarks ?? grpexam.EMPSGE_ForMaxMarkrs ?? '';

                                                                    return isSE ? `${obt} / ${mx}` : obt;
                                                                })()}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* Grand Total Column */}
                                                    {(!isSubjGrouped || rowSpanVal !== -1) && (
                                                        <td rowSpan={isSubjGrouped ? rowSpanVal : 1} className="border border-black p-1 text-center font-bold">
                                                            {(() => {
                                                                if (isGradeOnly) return '-';
                                                                const gt = getGrandTotal(subj);
                                                                if (gt.obtained === null) return '-';
                                                                return isSE ? `${gt.obtained} / ${gt.max}` : gt.obtained;
                                                            })()}
                                                        </td>
                                                    )}

                                                    {/* Yearly Avg Column */}
                                                    {(!isSubjGrouped || rowSpanVal !== -1) && (
                                                        <td rowSpan={isSubjGrouped ? rowSpanVal : 1} className="border border-black p-1 text-center font-bold">
                                                            {(() => {
                                                                if (isGradeOnly) return '-';
                                                                const ya = getYearlyAvg(subj);
                                                                if (ya.obtained === null) return '-';
                                                                return ya.obtained;
                                                            })()}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}

                                        {/* Totals Row */}
                                        <tr>
                                            <td className="border border-black p-1 text-left font-bold font-sans">TOTAL</td>
                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                if (isTotalCol) {
                                                    const grpName = grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;
                                                    const semSum = getSemesterTotalSum({ empG_DistplayName: grpName });
                                                    if (!semSum) return <td key={eIdx} className="border border-black p-1 text-center font-bold">-</td>;
                                                    return (
                                                        <td key={eIdx} className="border border-black p-1 text-center font-bold">
                                                            {semSum.obtained} / {semSum.max}
                                                        </td>
                                                    );
                                                }
                                                return <td key={eIdx} className="border border-black p-1 text-center font-bold"></td>;
                                            })}
                                            <td className="border border-black p-1 text-center font-bold">
                                                {grandTotalSumObt} / {grandTotalSumMax}
                                            </td>
                                            <td className="border border-black p-1 text-center font-bold">
                                                {Math.round(grandTotalSumObt / 2)} / {Math.round(grandTotalSumMax / 2)}
                                            </td>
                                        </tr>

                                        {/* Percentage Row */}
                                        <tr>
                                            <td className="border border-black p-1 text-left font-bold font-sans">PERCENTAGE</td>
                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                if (isTotalCol) {
                                                    const grpName = grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;
                                                    const semSum = getSemesterTotalSum({ empG_DistplayName: grpName });
                                                    if (!semSum || semSum.max === 0) return <td key={eIdx} className="border border-black p-1 text-center font-bold">-</td>;
                                                    return (
                                                        <td key={eIdx} className="border border-black p-1 text-center font-bold">
                                                            {((semSum.obtained / semSum.max) * 100).toFixed(1)}%
                                                        </td>
                                                    );
                                                }
                                                return <td key={eIdx} className="border border-black p-1 text-center font-bold"></td>;
                                            })}
                                            <td className="border border-black p-1 text-center font-bold">
                                                {grandTotalSumMax > 0 ? `${((grandTotalSumObt / grandTotalSumMax) * 100).toFixed(1)}%` : '-'}
                                            </td>
                                            <td className="border border-black p-1 text-center font-bold">
                                                {grandTotalSumMax > 0 ? `${((Math.round(grandTotalSumObt / 2) / Math.round(grandTotalSumMax / 2)) * 100).toFixed(1)}%` : '-'}
                                            </td>
                                        </tr>

                                        {/* Attendance Row */}
                                        <tr>
                                            <td className="border border-black p-1 text-left font-bold font-sans">Attendance</td>
                                            {getgroupdetails.map((grp: any, gIdx: number) => {
                                                const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;
                                                const att = student.attendance?.find((a: any) => a.term === grpName);
                                                return (
                                                    <td key={gIdx} colSpan={grp.groupewiseexam?.length || 1} className="border border-black p-1 text-center font-bold">
                                                        {att ? <span>{att.TOTALAttendancePercentage ?? att.percentage}%</span> : '-'}
                                                    </td>
                                                );
                                            })}
                                            <td colSpan={2} className="border border-black p-1 text-center font-bold">
                                                {(() => {
                                                    const att = student.attendance?.find((a: any) => a.term === 'Att_Average');
                                                    return att ? <span>{att.TOTALAttendancePercentage ?? att.percentage}%</span> : '-';
                                                })()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Semester Remarks Box */}
                            <div className="pt-2">
                                <table className="w-full border-collapse border border-black text-sm" style={{ fontFamily: 'system-ui' }}>
                                    <tbody>
                                        <tr>
                                            <th className="border border-black bg-[#d1d5db] p-2 text-center font-bold print:bg-[#d1d5db] uppercase">
                                                SEMESTER-II
                                            </th>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-2 text-left font-semibold font-sans min-h-[40px]">
                                                {remarks}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="pt-2">
                                    <h5 className="font-bold text-[14px]">Conduct : <span className="font-normal">{conduct}</span></h5>
                                </div>
                            </div>

                            {/* Graphical Analysis */}
                            {student.chartData && student.chartData.length > 0 && (
                                <div className="pt-2">
                                    <table className="w-full border-collapse border border-black text-sm" style={{ fontFamily: 'system-ui' }}>
                                        <tbody>
                                            <tr>
                                                <th colSpan={3} className="border border-black bg-[#d1d5db] p-2 text-center font-bold print:bg-[#d1d5db] uppercase">
                                                    GRAPHICAL ANALYSIS
                                                </th>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className="p-2 border border-black">
                                                    <div className="mx-auto h-[250px] w-[98%]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={student.chartData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                                <XAxis dataKey="subject" tick={{ fontSize: 10 }} tickLine={false} axisLine={true} interval={0} angle={-25} textAnchor="end" />
                                                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={true} />
                                                                <Bar dataKey="highest" fill="#3f51b5" barSize={20} />
                                                                <Bar dataKey="average" fill="#ff5722" barSize={20} />
                                                                <Bar dataKey="obtained" fill="#00ff00" barSize={20} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 border border-black text-center font-semibold">
                                                    <span className="mr-2 inline-block h-3 w-3 bg-[#3f51b5]"></span> Highest Marks
                                                </td>
                                                <td className="p-2 border border-black text-center font-semibold">
                                                    <span className="mr-2 inline-block h-3 w-3 bg-[#ff5722]"></span> Average Marks
                                                </td>
                                                <td className="p-2 border border-black text-center font-semibold">
                                                    <span className="mr-2 inline-block h-3 w-3 bg-[#00ff00]"></span> Obtained Marks
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

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
                                                <b>Date of Issue: </b> &nbsp;{formatDate(dateInfo?.issueDate)}<br />
                                                <b>New Academic Session Commences on: </b> &nbsp;{formatDate(dateInfo?.academicDate)}
                                            </td>
                                            <td className="text-right align-top">
                                                <b>Report Card Printed On : {formatDate(dateInfo?.reportPrintedDate)}</b>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportView;
