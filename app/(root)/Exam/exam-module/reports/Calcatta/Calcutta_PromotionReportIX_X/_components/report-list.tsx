'use client';

import { Button } from '@/components/ui/button';
import { getCalcuttaPromotionReportI_IX } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report-ix';
import { Download, Loader2, Printer } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';
import CalcuttaPromotionReportForm from './report-form';

export default function CalcuttaPromotionReportIX_XList() {
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

    // Helper to format Date
    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB'); // dd/MM/yyyy
    };

    // Helper to get semester marks for a single subject
    const getSubjectSemesterMarks = (student: any, subjId: number, grpName: string) => {
        const rec = student.studentmarks?.find((m: any) => {
            const mSubjId = m.ISMS_Id ?? m.ismS_Id;
            const mEmeId = m.EME_Id ?? m.emE_Id;
            const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '')?.trim().toUpperCase();
            return Number(mSubjId) === Number(subjId) && Number(mEmeId) === 9800000 && mGrp === grpName.trim().toUpperCase();
        });

        if (rec) {
            const passFail = rec.PassFailFlag ?? rec.passFailFlag;
            const isAbsent = ['AB', 'M', 'L'].includes(passFail);
            return {
                obtained: isAbsent ? passFail : Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? 0),
                max: Number(rec.maxMarks ?? rec.maxmarks ?? rec.EMPS_MaxMarks ?? 100)
            };
        }

        // Fallback: calculate by summing exams in groupwiseexamlist for this group
        const grpExams =
            reportData.groupwiseexamlist?.filter(
                (e: any) =>
                    (e.EMPG_DistplayName ?? e.empg_DistplayName ?? '').trim().toUpperCase() === grpName.trim().toUpperCase() &&
                    Number(e.EME_Id) !== 9800000 &&
                    Number(e.EME_Id) !== 98000012
            ) || [];

        let totalObt = 0;
        let totalMax = 0;
        let allAbsent = true;
        let hasMarks = false;

        grpExams.forEach((exam: any) => {
            const markRec = student.studentmarks?.find((mrks: any) => {
                const mSubjId = mrks.ISMS_Id ?? mrks.ismS_Id;
                const mEmeId = mrks.EME_Id ?? mrks.emE_Id;
                const mGrpName = (mrks.EMPSG_DisplayName ?? mrks.empsG_DisplayName ?? mrks.EMPSG_GroupName ?? mrks.empG_GroupName ?? '')
                    ?.trim()
                    .toUpperCase();
                return (
                    Number(mSubjId) === Number(subjId) &&
                    Number(mEmeId) === Number(exam.EME_Id) &&
                    mGrpName === grpName.trim().toUpperCase()
                );
            });

            if (markRec) {
                hasMarks = true;
                const passFail = markRec.PassFailFlag ?? markRec.passFailFlag;
                const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                if (!isAbsent) {
                    allAbsent = false;
                    totalObt += Number(markRec.ObtainedMarks ?? markRec.obtainedMarks ?? 0);
                }
                totalMax += Number(markRec.maxMarks ?? markRec.maxmarks ?? exam.EMPSGE_ForMaxMarkrs ?? 0);
            } else {
                totalMax += Number(exam.EMPSGE_ForMaxMarkrs ?? 0);
            }
        });

        return hasMarks
            ? {
                  obtained: allAbsent ? 'AB' : totalObt,
                  max: totalMax
              }
            : null;
    };

    // Helper to get semester total for a group (Average of subjects in group)
    const getSemesterGroupTotal = (student: any, groupMap: any, subj: any, grpName: string) => {
        const isSubjGrouped =
            subj.GropuFlag === 1 ||
            subj.GropuFlag === '1' ||
            subj.GropuFlag === true ||
            subj.GropuFlag === 'true' ||
            subj.gropuFlag === 1 ||
            subj.gropuFlag === '1' ||
            subj.gropuFlag === true ||
            subj.gropuFlag === 'true';
        const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;

        if (isSubjGrouped && groupName) {
            const subjsInGroup = groupMap[groupName.trim()] || [];
            let sumObt = 0;
            let sumMax = 0;
            let count = 0;
            let allAbsent = true;

            subjsInGroup.forEach((s: any) => {
                const sId = s.ISMS_Id ?? s.ismS_Id;
                const marks = getSubjectSemesterMarks(student, sId, grpName);
                if (marks) {
                    if (typeof marks.obtained === 'number') {
                        sumObt += marks.obtained;
                        allAbsent = false;
                    }
                    sumMax += marks.max;
                    count++;
                }
            });

            if (count === 0) return { obtained: null, max: 0 };
            return {
                obtained: allAbsent ? 'AB' : Math.round(sumObt / count),
                max: Math.round(sumMax / count)
            };
        } else {
            const sId = subj.ISMS_Id ?? subj.ismS_Id;
            const marks = getSubjectSemesterMarks(student, sId, grpName);
            return {
                obtained: marks?.obtained ?? null,
                max: marks?.max ?? 0
            };
        }
    };

    const getSubjectSemesterGrade = (student: any, subjId: number, grpName: string) => {
        const rec = student.studentmarks?.find((m: any) => {
            const mSubjId = m.ISMS_Id ?? m.ismS_Id;
            const mEmeId = m.EME_Id ?? m.emE_Id;
            const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '')?.trim().toUpperCase();
            return Number(mSubjId) === Number(subjId) && Number(mEmeId) === 9800000 && mGrp === grpName.trim().toUpperCase();
        });
        return rec?.obtainedGrade ?? rec?.ObtainedGrade ?? '-';
    };

    const handleExport = () => {
        if (!reportData || !reportData.studentdetails || reportData.studentdetails.length === 0) return;

        const rows: any[] = [];

        reportData.studentdetails.forEach((student: any) => {
            const studentId = student.AMST_Id || student.amsT_Id;
            const remarksObj = reportData.getpromotionremarksdetails?.find(
                (d: any) => Number(d.AMST_Id || d.amsT_Id) === Number(studentId)
            );
            const remarks = remarksObj?.eprD_Remarks ?? student.remarks ?? '';
            const conduct = remarksObj?.eprD_PromotionName ?? '';

            // Add Student Info Header
            rows.push({
                'Student Name': (
                    student.studentname || `${student.amsT_FirstName || ''} ${student.amsT_MiddleName || ''} ${student.amsT_LastName || ''}`
                ).toUpperCase(),
                Class: (student.classname || student.asmcL_ClassName || '').toUpperCase(),
                Section: (student.sectionname || student.asmC_SectionName || '').toUpperCase(),
                'Roll No': student.rollno || student.amaY_RollNo || '',
                'Scholar No': student.admno || student.amsT_AdmNo || '',
                Subject: '',
                'SEMESTER I [100]': '',
                'Total [100] (SEM I)': '',
                'SEMESTER II [100]': '',
                'Total [100] (SEM II)': '',
                'Grand Total [200]': '',
                'Yearly Avg': ''
            });

            const applicableSubjects = (student.studentsubjects || []).filter((subj: any) => {
                const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                return appToResult === true || appToResult === 'true';
            });

            // Group map for subjects
            const groupMap: { [key: string]: any[] } = {};
            applicableSubjects.forEach((subj: any) => {
                const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                const isGrouped =
                    subj.GropuFlag === 1 ||
                    subj.GropuFlag === '1' ||
                    subj.GropuFlag === true ||
                    subj.GropuFlag === 'true' ||
                    subj.gropuFlag === 1 ||
                    subj.gropuFlag === '1' ||
                    subj.gropuFlag === true ||
                    subj.gropuFlag === 'true';
                if (isGrouped && groupName) {
                    const trimmed = groupName.trim();
                    if (!groupMap[trimmed]) {
                        groupMap[trimmed] = [];
                    }
                    groupMap[trimmed].push(subj);
                }
            });

            const subjRowSpanMap = new Map<number, number>();
            applicableSubjects.forEach((subj: any) => {
                const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                const isGrouped =
                    subj.GropuFlag === 1 ||
                    subj.GropuFlag === '1' ||
                    subj.GropuFlag === true ||
                    subj.GropuFlag === 'true' ||
                    subj.gropuFlag === 1 ||
                    subj.gropuFlag === '1' ||
                    subj.gropuFlag === true ||
                    subj.gropuFlag === 'true';
                const currentSubjId = subj.ISMS_Id ?? subj.ismS_Id;

                if (isGrouped && groupName) {
                    const trimmed = groupName.trim();
                    const groupSubjs = groupMap[trimmed];
                    groupSubjs.sort((a, b) => (a.grporder ?? 0) - (b.grporder ?? 0));
                    const firstSubj = groupSubjs[0];
                    const firstSubjId = firstSubj.ISMS_Id ?? firstSubj.ismS_Id;

                    if (Number(currentSubjId) === Number(firstSubjId)) {
                        subjRowSpanMap.set(currentSubjId, groupSubjs.length);
                    } else {
                        subjRowSpanMap.set(currentSubjId, -1);
                    }
                } else {
                    subjRowSpanMap.set(currentSubjId, 1);
                }
            });

            applicableSubjects.forEach((subj: any) => {
                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                const isGradeOnly =
                    (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                    !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);

                const sem1MarksObj = getSubjectSemesterMarks(student, subjId, 'SEMESTER 1');
                const sem1GroupObj = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 1');
                const sem2MarksObj = getSubjectSemesterMarks(student, subjId, 'SEMESTER 2');
                const sem2GroupObj = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 2');

                let grandObt: number | string | null = null;
                let grandMax = 0;
                if (sem1GroupObj.obtained !== null || sem2GroupObj.obtained !== null) {
                    if (typeof sem1GroupObj.obtained === 'number' || typeof sem2GroupObj.obtained === 'number') {
                        grandObt = (Number(sem1GroupObj.obtained) || 0) + (Number(sem2GroupObj.obtained) || 0);
                    } else if (sem1GroupObj.obtained === 'AB' && sem2GroupObj.obtained === 'AB') {
                        grandObt = 'AB';
                    }
                    grandMax = sem1GroupObj.max + sem2GroupObj.max;
                }

                let yearlyAvgObt: number | string | null = null;
                if (grandObt !== null) {
                    if (typeof grandObt === 'number') {
                        const val = grandObt / 2;
                        yearlyAvgObt = val % 1 === 0 ? val : Number(val.toFixed(1));
                    } else {
                        yearlyAvgObt = grandObt;
                    }
                }

                rows.push({
                    'Student Name': '',
                    Class: '',
                    Section: '',
                    'Roll No': '',
                    'Scholar No': '',
                    Subject: subj.ISMS_SubjectName || subj.ismS_SubjectName,
                    'SEMESTER I [100]': isGradeOnly ? '-' : (sem1MarksObj?.obtained ?? '-'),
                    'Total [100] (SEM I)': isGradeOnly
                        ? getSubjectSemesterGrade(student, subjId, 'SEMESTER 1')
                        : (sem1GroupObj.obtained ?? '-'),
                    'SEMESTER II [100]': isGradeOnly ? '-' : (sem2MarksObj?.obtained ?? '-'),
                    'Total [100] (SEM II)': isGradeOnly
                        ? getSubjectSemesterGrade(student, subjId, 'SEMESTER 2')
                        : (sem2GroupObj.obtained ?? '-'),
                    'Grand Total [200]': isGradeOnly ? '-' : (grandObt ?? '-'),
                    'Yearly Avg': isGradeOnly ? '-' : (yearlyAvgObt ?? '-')
                });
            });

            // Scholastic calculations
            const scholasticSubjects = applicableSubjects.filter((subj: any) => {
                const isGradeOnly =
                    (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                    !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);
                return !isGradeOnly;
            });

            let sem1TotalObt = 0;
            let sem1TotalMax = 0;
            let sem2TotalObt = 0;
            let sem2TotalMax = 0;

            scholasticSubjects.forEach((subj: any) => {
                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                const rowSpan = subjRowSpanMap.get(subjId);
                if (rowSpan !== undefined && rowSpan === -1) return;

                const sem1Group = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 1');
                if (sem1Group && typeof sem1Group.obtained === 'number') {
                    sem1TotalObt += sem1Group.obtained;
                    sem1TotalMax += sem1Group.max;
                }

                const sem2Group = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 2');
                if (sem2Group && typeof sem2Group.obtained === 'number') {
                    sem2TotalObt += sem2Group.obtained;
                    sem2TotalMax += sem2Group.max;
                }
            });

            const grandTotalObt = sem1TotalObt + sem2TotalObt;
            const grandTotalMax = sem1TotalMax + sem2TotalMax;
            const yearlyAvgObtSum = Math.round(grandTotalObt / 2);
            const yearlyAvgMaxSum = Math.round(grandTotalMax / 2);

            const sem1Percentage = sem1TotalMax > 0 ? Math.round((sem1TotalObt / sem1TotalMax) * 100) : 0;
            const sem2Percentage = sem2TotalMax > 0 ? Math.round((sem2TotalObt / sem2TotalMax) * 100) : 0;
            const grandPercentage = grandTotalMax > 0 ? Math.round((grandTotalObt / grandTotalMax) * 100) : 0;
            const yearlyPercentage = yearlyAvgMaxSum > 0 ? Math.round((yearlyAvgObtSum / yearlyAvgMaxSum) * 100) : 0;

            // Total row
            rows.push({
                'Student Name': '',
                Class: '',
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: 'TOTAL',
                'SEMESTER I [100]': '',
                'Total [100] (SEM I)': `${sem1TotalObt}/${sem1TotalMax}`,
                'SEMESTER II [100]': '',
                'Total [100] (SEM II)': `${sem2TotalObt}/${sem2TotalMax}`,
                'Grand Total [200]': `${grandTotalObt}/${grandTotalMax}`,
                'Yearly Avg': `${yearlyAvgObtSum}/${yearlyAvgMaxSum}`
            });

            // Percentage row
            rows.push({
                'Student Name': '',
                Class: '',
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: 'PERCENTAGE',
                'SEMESTER I [100]': '',
                'Total [100] (SEM I)': `${sem1Percentage}%`,
                'SEMESTER II [100]': '',
                'Total [100] (SEM II)': `${sem2Percentage}%`,
                'Grand Total [200]': `${grandPercentage}%`,
                'Yearly Avg': `${yearlyPercentage}%`
            });

            // Attendance row
            const att1 = student.attendance?.find((a: any) => a.term?.trim().toUpperCase() === 'SEMESTER 1');
            const att2 = student.attendance?.find((a: any) => a.term?.trim().toUpperCase() === 'SEMESTER 2');
            const attAvg = student.attendance?.find((a: any) => a.term?.trim().toUpperCase() === 'ATT_AVERAGE');

            rows.push({
                'Student Name': '',
                Class: '',
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: 'ATTENDANCE',
                'SEMESTER I [100]': '',
                'Total [100] (SEM I)': att1?.percentage ? `${att1.percentage}%` : '',
                'SEMESTER II [100]': '',
                'Total [100] (SEM II)': att2?.percentage ? `${att2.percentage}%` : '',
                'Grand Total [200]': attAvg?.percentage ? `${attAvg.percentage}%` : '',
                'Yearly Avg': attAvg?.percentage ? `${attAvg.percentage}%` : ''
            });

            // Remarks row
            rows.push({
                'Student Name': `Remarks: ${remarks}`,
                Class: `Conduct: ${conduct}`,
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: '',
                'SEMESTER I [100]': '',
                'Total [100] (SEM I)': '',
                'SEMESTER II [100]': '',
                'Total [100] (SEM II)': '',
                'Grand Total [200]': '',
                'Yearly Avg': ''
            });

            // Empty spacer row
            rows.push({});
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Promotion Report');
        XLSX.writeFile(workbook, `Calcutta_PromotionReport_IX_X.xlsx`);
    };

    return (
        <div className='flex flex-col gap-4'>
            <style
                dangerouslySetInnerHTML={{
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
                    .no-print {
                        display: none !important;
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
            `
                }}
            />

            <div className='no-print'>
                <CalcuttaPromotionReportForm onSuccess={handleGenerate} />
            </div>

            {loading && (
                <div className='no-print flex h-64 items-center justify-center rounded-md border bg-card'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
            )}

            {!loading && reportData && reportData.studentdetails?.length > 0 && (
                <div className='rounded-md border bg-card p-4 print:border-none print:bg-transparent print:p-0'>
                    <div className='no-print mb-4 flex items-center justify-end gap-2'>
                        <Button onClick={handleExport} variant='outline' className='inline-flex items-center gap-2'>
                            <Download className='h-4 w-4' />
                            Export Excel
                        </Button>
                        <Button onClick={handlePrint} className='inline-flex items-center gap-2 bg-primary text-white'>
                            <Printer className='h-4 w-4' />
                            Print
                        </Button>
                    </div>

                    <div id='printable-area' className='printable-content text-black'>
                        {reportData.studentdetails.map((student: any, index: number) => {
                            const studentId = student.AMST_Id || student.amsT_Id;
                            const remarksObj = reportData.getpromotionremarksdetails?.find(
                                (d: any) => Number(d.AMST_Id || d.amsT_Id) === Number(studentId)
                            );
                            const remarks = remarksObj?.eprD_Remarks ?? student.remarks ?? '';
                            const conduct = remarksObj?.eprD_PromotionName ?? '';

                            const applicableSubjects = (student.studentsubjects || []).filter((subj: any) => {
                                const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                                return appToResult === true || appToResult === 'true';
                            });

                            // Group subjects by esG_SubjectGroupName
                            const groupMap: { [key: string]: any[] } = {};
                            applicableSubjects.forEach((subj: any) => {
                                const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                                const isGrouped =
                                    subj.GropuFlag === 1 ||
                                    subj.GropuFlag === '1' ||
                                    subj.GropuFlag === true ||
                                    subj.GropuFlag === 'true' ||
                                    subj.gropuFlag === 1 ||
                                    subj.gropuFlag === '1' ||
                                    subj.gropuFlag === true ||
                                    subj.gropuFlag === 'true';
                                if (isGrouped && groupName) {
                                    const trimmed = groupName.trim();
                                    if (!groupMap[trimmed]) {
                                        groupMap[trimmed] = [];
                                    }
                                    groupMap[trimmed].push(subj);
                                }
                            });

                            // Map subject IDs to their rowSpan and group size
                            const subjRowSpanMap = new Map<number, number>();
                            applicableSubjects.forEach((subj: any) => {
                                const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                                const isGrouped =
                                    subj.GropuFlag === 1 ||
                                    subj.GropuFlag === '1' ||
                                    subj.GropuFlag === true ||
                                    subj.GropuFlag === 'true' ||
                                    subj.gropuFlag === 1 ||
                                    subj.gropuFlag === '1' ||
                                    subj.gropuFlag === true ||
                                    subj.gropuFlag === 'true';
                                const currentSubjId = subj.ISMS_Id ?? subj.ismS_Id;

                                if (isGrouped && groupName) {
                                    const trimmed = groupName.trim();
                                    const groupSubjs = groupMap[trimmed];
                                    groupSubjs.sort((a, b) => (a.grporder ?? 0) - (b.grporder ?? 0));
                                    const firstSubj = groupSubjs[0];
                                    const firstSubjId = firstSubj.ISMS_Id ?? firstSubj.ismS_Id;

                                    if (Number(currentSubjId) === Number(firstSubjId)) {
                                        subjRowSpanMap.set(currentSubjId, groupSubjs.length);
                                    } else {
                                        subjRowSpanMap.set(currentSubjId, -1);
                                    }
                                } else {
                                    subjRowSpanMap.set(currentSubjId, 1);
                                }
                            });

                            // Scholastic Calculations for TOTAL row
                            const scholasticSubjects = applicableSubjects.filter((subj: any) => {
                                const isGradeOnly =
                                    (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                                    !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);
                                return !isGradeOnly;
                            });

                            let sem1TotalObt = 0;
                            let sem1TotalMax = 0;
                            let sem2TotalObt = 0;
                            let sem2TotalMax = 0;

                            scholasticSubjects.forEach((subj: any) => {
                                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                const rowSpan = subjRowSpanMap.get(subjId);
                                if (rowSpan !== undefined && rowSpan === -1) {
                                    return; // Skip non-first grouped subjects to avoid double-counting
                                }

                                const sem1Group = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 1');
                                if (sem1Group && typeof sem1Group.obtained === 'number') {
                                    sem1TotalObt += sem1Group.obtained;
                                    sem1TotalMax += sem1Group.max;
                                }

                                const sem2Group = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 2');
                                if (sem2Group && typeof sem2Group.obtained === 'number') {
                                    sem2TotalObt += sem2Group.obtained;
                                    sem2TotalMax += sem2Group.max;
                                }
                            });

                            const grandTotalObt = sem1TotalObt + sem2TotalObt;
                            const grandTotalMax = sem1TotalMax + sem2TotalMax;

                            const yearlyAvgObtSum = Math.round(grandTotalObt / 2);
                            const yearlyAvgMaxSum = Math.round(grandTotalMax / 2);

                            const sem1Percentage = sem1TotalMax > 0 ? Math.round((sem1TotalObt / sem1TotalMax) * 100) : 0;
                            const sem2Percentage = sem2TotalMax > 0 ? Math.round((sem2TotalObt / sem2TotalMax) * 100) : 0;
                            const grandPercentage = grandTotalMax > 0 ? Math.round((grandTotalObt / grandTotalMax) * 100) : 0;
                            const yearlyPercentage = yearlyAvgMaxSum > 0 ? Math.round((yearlyAvgObtSum / yearlyAvgMaxSum) * 100) : 0;

                            return (
                                <div
                                    key={index}
                                    className={`mx-auto max-w-[1000px] bg-white p-4 font-sans ${index < reportData.studentdetails.length - 1 ? 'page-break mb-8' : ''}`}>
                                    {/* Header Spacer */}
                                    <div className='pt-24 print:pt-36'></div>

                                    {/* Academic Session */}
                                    <div className='mb-2 flex justify-center'>
                                        <div className='border border-black bg-white px-8 py-1'>
                                            <h2 className='font-bold text-[20px] uppercase tracking-wider'>
                                                ACADEMIC SESSION{' '}
                                                {payload?.ASMAY_Year ||
                                                    student.asmaY_Year ||
                                                    reportData.getinstitution?.[0]?.asmaY_Year ||
                                                    ''}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Student Info Block */}
                                    <table
                                        className='mb-2 w-full table-fixed border-collapse border border-black'
                                        style={{ fontFamily: 'system-ui' }}>
                                        <tbody>
                                            <tr>
                                                <td className='w-full border border-black p-4'>
                                                    <div className='flex w-full'>
                                                        <div className='flex-1 space-y-2'>
                                                            <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                                <div className='text-left font-bold'>Student's Name</div>
                                                                <div className='text-left uppercase'>
                                                                    :{' '}
                                                                    {student.studentname ||
                                                                        `${student.amsT_FirstName || ''} ${student.amsT_MiddleName || ''} ${student.amsT_LastName || ''}`.trim()}
                                                                </div>
                                                            </div>
                                                            <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                                <div className='text-left font-bold'>Scholar No.</div>
                                                                <div className='text-left'>
                                                                    : {student.admno || student.amsT_AdmNo || ''}
                                                                </div>
                                                            </div>
                                                            <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                                <div className='text-left font-bold'>Total Students</div>
                                                                <div className='text-left'>: {reportData.studentdetails.length}</div>
                                                            </div>
                                                        </div>
                                                        <div className='flex flex-1'>
                                                            <div className='flex-1 space-y-2'>
                                                                <div className='grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]'>
                                                                    <div className='text-left font-bold'>Class & Sec</div>
                                                                    <div className='text-left uppercase'>
                                                                        : {student.classname || student.asmcL_ClassName || ''} -{' '}
                                                                        {student.sectionname || student.asmC_SectionName || ''}
                                                                    </div>
                                                                </div>
                                                                <div className='grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]'>
                                                                    <div className='text-left font-bold'>Roll No</div>
                                                                    <div className='text-left'>
                                                                        : {student.rollno || student.amaY_RollNo || ''}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='flex w-[100px] items-center justify-center text-right'>
                                                                {student.amsT_Photoname || student.AMST_Photoname ? (
                                                                    <div className='relative h-[100px] w-[100px] border border-gray-300'>
                                                                        <img
                                                                            src={student.amsT_Photoname || student.AMST_Photoname}
                                                                            alt='Student Photo'
                                                                            className='h-full w-full object-contain'
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className='flex h-[100px] w-[100px] items-center justify-center border border-gray-300 bg-gray-100 text-gray-400 text-xs'>
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
                                    <div className='pt-2'>
                                        <table
                                            className='w-full border-collapse border border-black text-sm'
                                            style={{ fontFamily: 'system-ui' }}>
                                            <thead>
                                                <tr>
                                                    <td
                                                        rowSpan={2}
                                                        className='w-[300px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        SUBJECTS
                                                    </td>
                                                    <td
                                                        colSpan={2}
                                                        className='border border-black bg-[#d1d5db] p-1 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                        SEMESTER 1
                                                    </td>
                                                    <td
                                                        colSpan={2}
                                                        className='border border-black bg-[#d1d5db] p-1 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                        SEMESTER 2
                                                    </td>
                                                    <td
                                                        rowSpan={2}
                                                        className='w-[100px] border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        Grand Total
                                                        <br />
                                                        [200]
                                                    </td>
                                                    <td
                                                        rowSpan={2}
                                                        className='w-[150px] border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        Yearly Avg
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        SEMESTER I <br /> [100]
                                                    </th>
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        Total <br /> [100]
                                                    </th>
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        SEMESTER II <br /> [100]
                                                    </th>
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        Total <br /> [100]
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Applicable Subjects */}
                                                {applicableSubjects.map((subj: any, sIdx: number) => {
                                                    const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                                    const isSubjGrouped =
                                                        subj.GropuFlag === 1 ||
                                                        subj.GropuFlag === '1' ||
                                                        subj.GropuFlag === true ||
                                                        subj.GropuFlag === 'true' ||
                                                        subj.gropuFlag === 1 ||
                                                        subj.gropuFlag === '1' ||
                                                        subj.gropuFlag === true ||
                                                        subj.gropuFlag === 'true';

                                                    const rowSpanVal = subjRowSpanMap.get(subjId) ?? 1;
                                                    const isGradeOnly =
                                                        (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                                                        !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);

                                                    const sem1MarksObj = getSubjectSemesterMarks(student, subjId, 'SEMESTER 1');
                                                    const sem1GroupObj = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 1');
                                                    const sem2MarksObj = getSubjectSemesterMarks(student, subjId, 'SEMESTER 2');
                                                    const sem2GroupObj = getSemesterGroupTotal(student, groupMap, subj, 'SEMESTER 2');

                                                    let grandObt: number | string | null = null;
                                                    let grandMax = 0;
                                                    if (sem1GroupObj.obtained !== null || sem2GroupObj.obtained !== null) {
                                                        if (
                                                            typeof sem1GroupObj.obtained === 'number' ||
                                                            typeof sem2GroupObj.obtained === 'number'
                                                        ) {
                                                            grandObt =
                                                                (Number(sem1GroupObj.obtained) || 0) + (Number(sem2GroupObj.obtained) || 0);
                                                        } else if (sem1GroupObj.obtained === 'AB' && sem2GroupObj.obtained === 'AB') {
                                                            grandObt = 'AB';
                                                        }
                                                        grandMax = sem1GroupObj.max + sem2GroupObj.max;
                                                    }

                                                    let yearlyAvgObt: number | string | null = null;
                                                    if (grandObt !== null) {
                                                        if (typeof grandObt === 'number') {
                                                            const val = grandObt / 2;
                                                            yearlyAvgObt = val % 1 === 0 ? val : Number(val.toFixed(1));
                                                        } else {
                                                            yearlyAvgObt = grandObt;
                                                        }
                                                    }

                                                    return (
                                                        <tr key={sIdx}>
                                                            {/* Column 1: Subject Name */}
                                                            <td className='break-words border border-black p-1 text-left font-bold'>
                                                                {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                            </td>

                                                            {/* Column 2: SEMESTER I Subject Total */}
                                                            <td className='border border-black p-1 text-center'>
                                                                {isGradeOnly ? '-' : (sem1MarksObj?.obtained ?? '-')}
                                                            </td>

                                                            {/* Column 3: SEMESTER I Group Total */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly
                                                                        ? getSubjectSemesterGrade(student, subjId, 'SEMESTER 1')
                                                                        : (sem1GroupObj.obtained ?? '-')}
                                                                </td>
                                                            )}

                                                            {/* Column 4: SEMESTER II Subject Total */}
                                                            <td className='border border-black p-1 text-center'>
                                                                {isGradeOnly ? '-' : (sem2MarksObj?.obtained ?? '-')}
                                                            </td>

                                                            {/* Column 5: SEMESTER II Group Total */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly
                                                                        ? getSubjectSemesterGrade(student, subjId, 'SEMESTER 2')
                                                                        : (sem2GroupObj.obtained ?? '-')}
                                                                </td>
                                                            )}

                                                            {/* Column 6: Grand Total */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly ? '-' : (grandObt ?? '-')}
                                                                </td>
                                                            )}

                                                            {/* Column 7: Yearly Avg */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly ? '-' : (yearlyAvgObt ?? '-')}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}

                                                {/* Non-Applicable Subjects */}
                                                {student.studentsubjects.map((subj: any, sIdx: number) => {
                                                    const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                                                    if (appToResult === true || appToResult === 'true') return null;

                                                    const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                                    const sem1Marks = getSubjectSemesterMarks(student, subjId, 'SEMESTER 1');
                                                    const sem2Marks = getSubjectSemesterMarks(student, subjId, 'SEMESTER 2');

                                                    return (
                                                        <tr key={`non-app-${sIdx}`}>
                                                            <td className='break-words border border-black p-1 text-left font-bold'>
                                                                {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                            </td>
                                                            <td className='border border-black p-1 text-center'>
                                                                {sem1Marks?.obtained ?? '-'}
                                                            </td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                            <td className='border border-black p-1 text-center'>
                                                                {sem2Marks?.obtained ?? '-'}
                                                            </td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* TOTAL Row */}
                                                <tr>
                                                    <td className='border border-black p-1 text-left font-bold uppercase'>TOTAL</td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {sem1TotalObt}/{sem1TotalMax}
                                                    </td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {sem2TotalObt}/{sem2TotalMax}
                                                    </td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {grandTotalObt}/{grandTotalMax}
                                                    </td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {yearlyAvgObtSum}/{yearlyAvgMaxSum}
                                                    </td>
                                                </tr>

                                                {/* PERCENTAGE Row */}
                                                <tr>
                                                    <td className='border border-black p-1 text-left font-bold uppercase'>PERCENTAGE</td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>{sem1Percentage}%</td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>{sem2Percentage}%</td>
                                                    <td className='border border-black p-1 text-center font-bold'>{grandPercentage}%</td>
                                                    <td className='border border-black p-1 text-center font-bold'>{yearlyPercentage}%</td>
                                                </tr>

                                                {/* Attendance Row */}
                                                <tr>
                                                    <td className='border border-black p-1 text-left font-bold'>Attendance</td>
                                                    <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                        {(() => {
                                                            const att = student.attendance?.find(
                                                                (a: any) => a.term?.trim().toUpperCase() === 'SEMESTER 1'
                                                            );
                                                            return att?.percentage ? `${att.percentage}%` : '';
                                                        })()}
                                                    </td>
                                                    <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                        {(() => {
                                                            const att = student.attendance?.find(
                                                                (a: any) => a.term?.trim().toUpperCase() === 'SEMESTER 2'
                                                            );
                                                            return att?.percentage ? `${att.percentage}%` : '';
                                                        })()}
                                                    </td>
                                                    <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                        {(() => {
                                                            const att = student.attendance?.find(
                                                                (a: any) => a.term?.trim().toUpperCase() === 'ATT_AVERAGE'
                                                            );
                                                            return att?.percentage ? `${att.percentage}%` : '';
                                                        })()}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Suggestion Section */}
                                    <div className='pt-2'>
                                        <table className='w-full border-collapse border-[0.5px] border-black text-sm'>
                                            <tbody>
                                                <tr className='border-[0.5px] border-black bg-gray-300'>
                                                    <th className='p-2 text-center font-bold text-black uppercase'>Assessment - II</th>
                                                </tr>
                                                <tr>
                                                    <td className='min-h-[40px] border-[0.5px] border-black p-2 text-left'>
                                                        <b>Suggestion : </b> <b>{remarks}</b>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className='flex w-full pt-2'>
                                        <div className='w-full text-left font-bold text-sm'>
                                            Conduct : <span className='font-normal'>{conduct}</span>
                                        </div>
                                    </div>

                                    {/* Graph Analysis Box */}
                                    <div className='pt-2'>
                                        <table className='mb-4 w-full border-collapse border-[0.5px] border-black font-bold text-xs'>
                                            <tbody>
                                                <tr className='border-[0.5px] border-black bg-gray-300'>
                                                    <td colSpan={3} className='p-2 text-center font-bold text-black uppercase'>
                                                        GRAPHICAL ANALYSIS
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={3} className='border-[0.5px] border-black p-2'>
                                                        <div className='mx-auto h-[250px] w-[98%]'>
                                                            <ResponsiveContainer width='100%' height='100%'>
                                                                <BarChart
                                                                    data={student.chartData}
                                                                    margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                                                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                                                    <XAxis
                                                                        dataKey='subject'
                                                                        tick={{ fontSize: 9 }}
                                                                        tickLine={false}
                                                                        axisLine={true}
                                                                        interval={0}
                                                                        angle={-15}
                                                                        textAnchor='end'
                                                                    />
                                                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={true} />
                                                                    <Bar dataKey='highest' fill='#3f51b5' barSize={15} />
                                                                    <Bar dataKey='average' fill='#ff5722' barSize={15} />
                                                                    <Bar dataKey='obtained' fill='#00ff00' barSize={15} />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className='border-[0.5px] border-black'>
                                                    <td className='w-1/3 p-2 text-center'>
                                                        <span className='mr-2 inline-block h-3 w-3 bg-[#3f51b5]'></span> Highest Marks
                                                    </td>
                                                    <td className='w-1/3 p-2 text-center'>
                                                        <span className='mr-2 inline-block h-3 w-3 bg-[#ff5722]'></span> Average Marks
                                                    </td>
                                                    <td className='w-1/3 p-2 text-center'>
                                                        <span className='mr-2 inline-block h-3 w-3 bg-[#00ff00]'></span> Obtained Marks
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Signatures */}
                                    <div className='mt-16'>
                                        <table className='w-full border-collapse border-[0.5px] border-black text-sm'>
                                            <tbody>
                                                <tr className='border-[0.5px] border-black'>
                                                    <th className='w-1/3 border-[0.5px] border-black p-2 text-center font-bold'>
                                                        Principal's Signature
                                                    </th>
                                                    <th className='w-1/3 border-[0.5px] border-black p-2 text-center font-bold'>
                                                        Class Teacher's Signature
                                                    </th>
                                                    <th className='w-1/3 border-[0.5px] border-black p-2 text-center font-bold'>
                                                        Parent's Signature
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Dates */}
                                    <div className='pt-4'>
                                        <table className='w-full border-collapse border-[0.5px] border-black text-sm'>
                                            <tbody>
                                                <tr className='border-[0.5px] border-black'>
                                                    <td className='border-[0.5px] border-black p-2 text-left'>
                                                        <b>Date of Issue: </b> &nbsp;{formatDate(payload?.issueDate)}
                                                        <br />
                                                        <b>New Academic Session Commences on: </b> &nbsp;{formatDate(payload?.academicDate)}
                                                    </td>
                                                    <td className='border-[0.5px] border-black p-2 text-right align-top'>
                                                        <b>Report Card Printed On : {formatDate(payload?.reportPrintedDate)}</b> <br />
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
            )}
        </div>
    );
}
