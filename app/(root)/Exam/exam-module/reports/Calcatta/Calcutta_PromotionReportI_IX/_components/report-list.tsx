'use client';

import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportViewProps {
    data: any;
    institution: IMasterInstitution | Institution | null;
    examwisetotal?: any[]; // Array of highest in class records
}

const CalcuttaPromotionReportItoIXView = ({ data, dateInfo, institution }: CalcuttaPromotionReportItoIXViewProps) => {
    const handleExport = () => {};
const CalcuttaPromotionReportView = ({ data, institution, examwisetotal }: CalcuttaPromotionReportViewProps) => {
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

    const { getgroupdetails, groupwiseexamlist, studentdetails, examwiseremarkstemp, skilllist_temp, activitylist_temp, gettermdetails } =
        data;
    const { getgroupdetails = [], groupwiseexamlist = [], studentdetails = [], skilllist_temp = [] } = data;
    const EMPG_GroupName = data.EMPG_GroupName || data.empG_GroupName;

    return (
        <div className='flex flex-col gap-4'>
            <div className='mb-4 flex justify-end gap-2 print:hidden'>
                <Button onClick={handleExport} variant='outline' className='inline-flex items-center gap-2'>
                    <FileSpreadsheet className='h-4 w-4' />
                    Export Excel
                </Button>
                <Button onClick={handlePrint} className='inline-flex items-center gap-2 bg-primary text-white'>
                    <Printer className='h-4 w-4' />
                    Print
                </Button>
            </div>

            <div id='printable-area' className='printable-content text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        body {
                            font-family: system-ui, -apple-system, sans-serif !important;
                            background-color: white !important;
                            color: black !important;
                        }
                        .printable-content {
                            padding: 0 !important;
                            width: 100% !important;
                        }
                        .page-break {
                            page-break-after: always !important;
                            width: 98% !important;
                            max-width: 98% !important;
                            margin-left: auto !important;
                            margin-right: auto !important;
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

                {studentdetails.map((student: any, index: number) => {
                    const semesterRemarks = examwiseremarkstemp?.find(
                        (r: any) => r.amsT_Id === student.amsT_Id || r.AMST_Id === student.amsT_Id
                    );
                    const dob = student.amsT_DOB ? new Date(student.amsT_DOB).toLocaleDateString('en-GB') : '';

                    // 1. Filter applicable subjects (all subjects returned)
                    const applicableSubjects = (student.studentsubjects || []).filter((subj: any) => {
                        const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                        return appToResult === true || appToResult === 'true' || Number(appToResult) === 1;
                    });

                    // 2. Group subjects by esG_SubjectGroupName
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
                    // 3. Map subject IDs to their rowSpan and group size
                    const subjRowSpanMap = new Map<number, number>();
                    const subjGroupSizeMap = new Map<number, number>();
                        const currentSubjId = subj.ISMS_Id ?? subj.ismS_Id;
                    });

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
                            const groupSubjs = groupMap[trimmed];
                            // Sort by grporder to ensure consistent ordering
                            groupSubjs.sort((a: any, b: any) => (a.grporder ?? 0) - (b.grporder ?? 0));
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
                    const matchTermName = (termA: string, termB: string) => {
                        const normalize = (str: string) => {
                            return (str ?? '')
                                .trim()
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, '')
                                .replace(/SEMESTER/g, 'SEM')
                                .replace(/SEM1/g, 'SEMI')
                                .replace(/SEM2/g, 'SEMII')
                                .replace(/SEM-1/g, 'SEMI')
                                .replace(/SEM-2/g, 'SEMII')
                                .replace(/SEMESTER1/g, 'SEMI')
                                .replace(/SEMESTER2/g, 'SEMII')
                                .replace(/SEMESTERI/g, 'SEMI')
                                .replace(/SEMESTERII/g, 'SEMII');
                        };
                        const a = normalize(termA);
                        const b = normalize(termB);
                        if (a === b) return true;
                        if ((a === 'SEMI' || a === 'SEM1') && (b === 'SEMI' || b === 'SEM1')) return true;
                        if ((a === 'SEMII' || a === 'SEM2') && (b === 'SEMII' || b === 'SEM2')) return true;
                        return false;
                    };
                    const getGrpExams = (g: any) => {
                        return g.groupewiseexam ?? g.groupwiseexam ?? g.groupWiseExam ?? [];

                    };
                    const getMarkRecord = (subjId: number, emeId: number, termName: string) => {
                        return student.studentmarks?.find((mrks: any) => {
                            const mSubjId = mrks.ISMS_Id ?? mrks.ismS_Id;
                            const mEmeId = mrks.EME_Id ?? mrks.emE_Id;
                            const mGrpName =
                                mrks.EMPSG_DisplayName ?? mrks.empsG_DisplayName ?? mrks.EMPSG_GroupName ?? mrks.empG_GroupName ?? '';
                            return (
                                Number(mSubjId) === Number(subjId) && Number(mEmeId) === Number(emeId) && matchTermName(mGrpName, termName)
                            );
                        });
                    };
                    const getSubjectSemesterTotal = (subj: any, grpName: string) => {
                        const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                        const realGrp = getgroupdetails.find((g: any) =>
                            matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                        ) || { empG_DistplayName: grpName };
                        const exams = getGrpExams(realGrp).filter(
                            (e: any) => Number(e.EME_Id) !== 9800000 && Number(e.EME_Id) !== 98000012
                        );
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
                                totalMax += Number(exam.EMPSGE_ForMaxMarkrs ?? 0);
                        return { obtained: hasMarks ? (allAbsent ? 'AB' : totalObt) : null, max: totalMax };
                    const getSubjectSemesterHighest = (subj: any, grpName: string) => {
                        let maxHighest = 0;
                        let hasHighest = false;
                            } else {
                            }
                        });
                    };

                        const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                        const realGrp = getgroupdetails.find((g: any) =>
                            matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                        ) || { empG_DistplayName: grpName };
                        const exams = getGrpExams(realGrp).filter(
                            (e: any) => Number(e.EME_Id) !== 9800000 && Number(e.EME_Id) !== 98000012
                        );
                        exams.forEach((exam: any) => {
                            const rec = getMarkRecord(subjId, exam.EME_Id, grpName);
                            if (rec) {
                                const hVal =
                                    rec.ESTMPPS_ClassHighest ??
                                    rec.estmppS_ClassHighest ??
                                    rec.ESTMPS_ClassHighest ??
                                    rec.estmpS_ClassHighest ??
                                    null;
                                if (hVal !== null && !isNaN(Number(hVal))) {
                                    maxHighest = Math.max(maxHighest, Number(hVal));
                                    hasHighest = true;
                        return hasHighest ? maxHighest : '';
                                }
                            }
                        });
                    };
                    const getGroupSemesterTotal = (groupName: string, grpName: string) => {
                        const subjsInGroup = groupMap[groupName.trim()] || [];
                        let sumObt = 0;
                        let sumMax = 0;
                        let count = 0;
                        subjsInGroup.forEach((s: any) => {
                            const tot = getSubjectSemesterTotal(s, grpName);
                            if (tot.obtained !== null) {
                                if (typeof tot.obtained === 'number') {
                                    sumObt += tot.obtained;
                                sumMax += tot.max;
                                count++;
                                }
                            }
                        });
                        if (count === 0) return { obtained: null, max: 0 };
                        return {
                            obtained: Math.round(sumObt / count),
                            max: Math.round(sumMax / count)
                    const getSemesterTotalSum = (grpName: string) => {
                        };
                    };

                        let sumObt = 0;
                        let sumMax = 0;
                        let hasMarks = false;
                        applicableSubjects.forEach((subj: any) => {
                            const subjId = subj.ISMS_Id || subj.ismS_Id;
                            const rowSpan = subjRowSpanMap.get(subjId);
                            if (rowSpan !== undefined && rowSpan === -1) return;
                            const anyRec = student.studentmarks?.find((m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === Number(subjId));
                            if (anyRec) {
                                const marksDisplay =
                                    anyRec.EYCES_MarksDisplayFlg === true ||
                                    anyRec.EYCES_MarksDisplayFlg === 1 ||
                                    anyRec.EYCES_MarksDisplayFlg === 'true' ||
                                    anyRec.eyceS_MarksDisplayFlg === true ||
                                    anyRec.eyceS_MarksDisplayFlg === 1 ||
                                    anyRec.eyceS_MarksDisplayFlg === 'true';
                                const gradeDisplay =
                                    anyRec.EYCES_GradeDisplayFlg === true ||
                                    anyRec.EYCES_GradeDisplayFlg === 1 ||
                                    anyRec.EYCES_GradeDisplayFlg === 'true' ||
                                    anyRec.eyceS_GradeDisplayFlg === true ||
                                    anyRec.eyceS_GradeDisplayFlg === 1 ||
                                    anyRec.eyceS_GradeDisplayFlg === 'true';
                                const isGradeOnly = gradeDisplay && !marksDisplay;
                                if (isGradeOnly) return;
                            }
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
                                const tot = getGroupSemesterTotal(groupName, grpName);
                                if (tot.obtained !== null && typeof tot.obtained === 'number') {
                                    sumMax += tot.max;
                                    hasMarks = true;
                                const tot = getSubjectSemesterTotal(subj, grpName);
                        return hasMarks ? { obtained: sumObt, max: sumMax } : null;
                    const scholasticSubjects = applicableSubjects.filter((subj: any) => {
                        const anyRec = student.studentmarks?.find(
                            (m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === Number(subj.ISMS_Id ?? subj.ismS_Id)
                                    sumObt += tot.obtained;
                                }
                            } else {
                                if (tot.obtained !== null && typeof tot.obtained === 'number') {
                            }
                        });
                    };

                        );
                        if (anyRec) {
                            const marksDisplay =
                                anyRec.EYCES_MarksDisplayFlg === true ||
                                anyRec.EYCES_MarksDisplayFlg === 1 ||
                                anyRec.EYCES_MarksDisplayFlg === 'true' ||
                                anyRec.eyceS_MarksDisplayFlg === true ||
                                anyRec.eyceS_MarksDisplayFlg === 1 ||
                                anyRec.eyceS_MarksDisplayFlg === 'true';
                            const gradeDisplay =
                                anyRec.EYCES_GradeDisplayFlg === true ||
                                anyRec.EYCES_GradeDisplayFlg === 1 ||
                                anyRec.EYCES_GradeDisplayFlg === 'true' ||
                                anyRec.eyceS_GradeDisplayFlg === true ||
                                anyRec.eyceS_GradeDisplayFlg === 1 ||
                                anyRec.eyceS_GradeDisplayFlg === 'true';
                            return marksDisplay || !gradeDisplay;
                        return true;
                        }
                    });
                    const localChartData =
                        student.chartData && student.chartData.length > 0
                            ? student.chartData
                            : scholasticSubjects.map((subj: any) => {
                                  const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                  const subjectName = subj.ISMS_SubjectName ?? subj.ismS_SubjectName;

                                  const totalRec = student.studentmarks?.find((m: any) => {
                                      const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                      const mEmeId = m.EME_Id ?? m.emE_Id;
                                      const mGrpName = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                      const targetGrpName = (EMPG_GroupName ?? '')?.trim().toUpperCase();
                                      return (
                                          Number(mSubjId) === Number(subjId) &&
                                          Number(mEmeId) === 9800000 &&
                                          matchTermName(mGrpName, targetGrpName)
                                      );
                                  });
                                  const highestRec = student.studentmarks?.find((m: any) => {
                                          Number(mEmeId) === 98000012 &&

                                      const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                      const mEmeId = m.EME_Id ?? m.emE_Id;
                                      const mGrpName = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                      const targetGrpName = (EMPG_GroupName ?? '')?.trim().toUpperCase();
                                      return (
                                          Number(mSubjId) === Number(subjId) &&
                                          matchTermName(mGrpName, targetGrpName)
                                      );
                                  });
                                  let obtained = 0;
                                  if (totalRec) {
                                      const passFail = totalRec.PassFailFlag ?? totalRec.passFailFlag;
                                      const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                      if (!isAbsent) {
                                          const isGroupFlag =
                                              totalRec.GropuFlag === true ||
                                              totalRec.GropuFlag === 1 ||
                                              totalRec.GropuFlag === 'true' ||
                                              totalRec.gropuFlag === true ||
                                              totalRec.gropuFlag === 1 ||
                                              totalRec.gropuFlag === 'true';
                                          obtained = isGroupFlag
                                              ? Number(totalRec.GroupMarks ?? totalRec.groupMarks ?? 0)
                                              : Number(totalRec.ObtainedMarks ?? totalRec.obtainedMarks ?? 0);
                                      }
                                  }

                                  let highest = obtained;
                                  if (highestRec) {
                                      const hVal =
                                          highestRec.ESTMPPS_ClassHighest ??
                                          highestRec.estmppS_ClassHighest ??
                                          highestRec.ESTMPS_ClassHighest ??
                                          highestRec.estmpS_ClassHighest;
                                      if (hVal !== undefined && hVal !== null && !isNaN(Number(hVal)) && Number(hVal) > 0) {
                                          highest = Number(hVal);
                                  } else if (totalRec) {
                                      }
                                      const hVal =
                                          totalRec.ESTMPPS_ClassHighest ??
                                          totalRec.estmppS_ClassHighest ??
                                          totalRec.ESTMPS_ClassHighest ??
                                          totalRec.estmpS_ClassHighest;
                                  let average = Math.round(highest * 0.82) || obtained;
                                      if (hVal !== undefined && hVal !== null && !isNaN(Number(hVal)) && Number(hVal) > 0) {
                                          highest = Number(hVal);
                                      }
                                  }

                                  if (totalRec) {
                                      const avgVal =
                                          totalRec.ESTMPPS_SectionAverage ??
                                          totalRec.ESTMPS_SectionAverage ??
                                          totalRec.estmppS_SectionAverage ??
                                          totalRec.estmpS_SectionAverage ??
                                          totalRec.ESTMPPS_ClassAverage ??
                                          totalRec.ESTMPS_ClassAverage ??
                                          totalRec.estmppS_ClassAverage ??
                                          totalRec.estmpS_ClassAverage;
                                      if (avgVal !== undefined && avgVal !== null && !isNaN(Number(avgVal)) && Number(avgVal) > 0) {
                                          average = Number(avgVal);
                                      }
                                  }
                                  return {
                                      subject: subjectName,
                                      obtained,
                                      highest,
                                      average
                                  };
                              });

                    const getCellValue = (subj: any, exam: any) => {
                        const subjId = subj.ISMS_Id || subj.ismS_Id;
                        const examId = exam.EME_Id;
                        const grpName = exam.EMPG_DistplayName || exam.empG_DistplayName;
                        const isME = (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'ME';
                        const isSE = (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'SE';
                        const anyRec = student.studentmarks?.find((m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === Number(subjId));
                        const marksDisplay =
                            anyRec?.EYCES_MarksDisplayFlg === true ||
                            anyRec?.EYCES_MarksDisplayFlg === 1 ||
                            anyRec?.EYCES_MarksDisplayFlg === 'true' ||
                            anyRec?.eyceS_MarksDisplayFlg === true ||
                            anyRec?.eyceS_MarksDisplayFlg === 1 ||
                            anyRec?.eyceS_MarksDisplayFlg === 'true';
                        const gradeDisplay =
                            anyRec?.EYCES_GradeDisplayFlg === true ||
                            anyRec?.EYCES_GradeDisplayFlg === 1 ||
                            anyRec?.EYCES_GradeDisplayFlg === 'true' ||
                            anyRec?.eyceS_GradeDisplayFlg === true ||
                            anyRec?.eyceS_GradeDisplayFlg === 1 ||
                            anyRec?.eyceS_GradeDisplayFlg === 'true';
                        const isGradeOnly = gradeDisplay && !marksDisplay;
                        const mr = getMarkRecord(subjId, examId, grpName);
                        const passFail = mr?.PassFailFlag ?? mr?.passFailFlag;
                        const isAbsent = ['AB', 'M', 'L'].includes(passFail || '');

                        if (examId !== 9800000 && examId !== 98000012) {
                            if (!mr) return '';
                            if (isAbsent) return gradeDisplay && isME ? '-' : 'AB';
                            if (isGradeOnly) return '-';
                            const obtainedMarks = mr.ObtainedMarks ?? mr.obtainedMarks ?? 0;
                            const maxmarks = mr.maxmarks ?? mr.maxMarks ?? mr.max_marks ?? 0;
                            if (isME && obtainedMarks !== 0) return '-';
                            return isSE ? `${obtainedMarks} / ${maxmarks}` : obtainedMarks;
                        }
                        if (examId === 9800000) {
                            if (isGradeOnly) {
                                if (!mr) return '-';
                                return mr.ObtainedGrade ?? mr.obtainedGrade ?? '-';
                            }
                            if (mr) {
                                const oVal = mr.ObtainedMarks ?? mr.obtainedMarks;
                                if (oVal !== undefined && oVal !== null && oVal !== '') {
                                    const maxVal = mr.maxmarks ?? mr.maxMarks ?? mr.max_marks;
                                    return isSE && maxVal ? `${oVal} / ${maxVal}` : oVal;
                                if (tot.obtained === null) return '';
                                if (tot.obtained.toString() === 'AB') return 'AB';
                                return isSE ? `${tot.obtained} / ${tot.max}` : tot.obtained;
                                }
                            }
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
                                const tot = getGroupSemesterTotal(groupName, grpName);
                            const semTotal = getSubjectSemesterTotal(subj, grpName);
                            if (semTotal.obtained === null) return '';
                            if (semTotal.obtained === 'AB') return 'AB';
                            return isSE ? `${semTotal.obtained} / ${semTotal.max}` : semTotal.obtained;
                        // 3. If it's the Highest Column (98000012)
                        if (examId === 98000012) {
                                return mr.ESTMPPS_ObtainedGrade ?? mr.estmppS_ObtainedGrade ?? mr.ObtainedGrade ?? mr.obtainedGrade ?? '-';
                                const hVal = mr.ESTMPPS_ClassHighest ?? mr.estmppS_ClassHighest;
                                if (hVal !== undefined && hVal !== null && hVal !== '') {
                                    return hVal;
                        }

                            if (isGradeOnly) {
                                if (!mr) return '-';
                            }
                            if (mr) {
                                }
                            // Use examwisetotal prop to get highest value
                            if (student.examwisetotal && Array.isArray(student.examwisetotal)) {
                                const highestRec = student.examwisetotal.find((rec: any) => {
                                    const recSubjId = rec.ismS_Id ?? rec.ISMS_Id;
                                    const recExamId = rec.emE_Id ?? rec.EME_Id;
                                    const recGrpName = rec.empsG_GroupName ?? rec.EMPSG_GroupName ?? '';
                                    return (
                                        Number(recSubjId) === Number(subjId) &&
                                        (Number(recExamId) === 98000012 || Number(recExamId) === 9800000) &&
                                        (!recGrpName || matchTermName(recGrpName, grpName))
                                    );
                                });
                                if (highestRec) {
                                    const hVal = highestRec.estmppS_ClassHighest ?? highestRec.ESTMPPS_ClassHighest;
                                    if (hVal !== undefined && hVal !== null && !isNaN(Number(hVal))) {
                                        return Number(hVal);
                                    }
                            // Fallback to existing calculation if not found
                            const semHighest = getSubjectSemesterHighest(subj, grpName);
                            return semHighest !== '' ? semHighest : '';
                        return '';
                                }
                            }
                        }

                    };

                    return (
                        <div
                            key={student.amsT_Id || index}
                            className={`mx-auto max-w-[1000px] bg-white p-4 font-sans text-black ${index < studentdetails.length - 1 ? 'page-break mb-8' : ''}`}>
                            {/* Academic Session Badge */}
                            <div className='mt-12 mb-2 flex justify-center'>
                                <div className='border border-black bg-white px-8 py-1'>
                                    <h2 className='font-bold text-[20px] uppercase tracking-wider'>
                                        ACADEMIC SESSION {student.asmaY_Year}
                                    </h2>
                                </div>
                            </div>

                            {/* Student Info Box */}
                            <div className='mb-2 flex border-[0.5px] border-black p-1'>
                                <div className='flex-1 pr-2'>
                                    <div className='mt-2 grid grid-cols-[120px_10px_1fr] gap-y-1 font-bold text-[14px]'>
                                        <div>Student's Name</div>
                                        <div>:</div>
                                        <div className='uppercase'>{student.amsT_FirstName || student.studentname}</div>
                                        <div>Scholar No.</div>
                                        <div>:</div>
                                        <div>{student.amsT_AdmNo || student.admno}</div>
                                        <div>Total Students</div>
                                        <div>:</div>
                                        <div>{studentdetails.length}</div>
                                    </div>
                                </div>
                                <div className='flex-1 px-2'>
                                    <div className='mt-2 grid grid-cols-[100px_10px_1fr] gap-y-1 font-bold text-[14px]'>
                                        <div>Class & sec</div>
                                        <div>:</div>
                                        <div className='uppercase'>
                                            {student.asmcL_ClassName} - {student.asmC_SectionName}
                                        </div>
                                        <div>Roll No</div>
                                        <div>:</div>
                                        <div>{student.amaY_RollNo || student.rollno || 1}</div>
                                    </div>
                                </div>
                                <div className='mt-2 mr-1 flex h-[100px] w-[100px] items-center justify-center'>
                                    {student.amsT_Photoname ? (
                                        <img src={student.amsT_Photoname} alt='Student' className='h-full w-full object-contain' />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center border border-black text-gray-400 text-xs'>
                                            Photo
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Subject Table */}
                            <div className='pt-2'>
                                <table className='mb-2 w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={2}
                                                className='w-[300px] break-words border-[0.5px] border-black p-2 text-center align-middle font-bold'>
                                                SUBJECTS
                                            </th>
                                            {getgroupdetails?.map((grp: any, idx: number) => (
                                                <th
                                                    key={idx}
                                                    colSpan={grp.groupewiseexam?.length || 1}
                                                    className='border-[0.5px] border-black bg-gray-400 p-2 text-center uppercase'>
                                                    {grp.empG_DistplayName}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr>
                                            {groupwiseexamlist?.map((exam: any, idx: number) => (
                                                <th
                                                    key={idx}
                                                    className='w-[150px] break-words border-[0.5px] border-black p-2 text-center font-bold'>
                                                    {exam.examnamedisplay}
                                                    {exam.EMPSGE_ForMaxMarkrs && exam.examnamedisplay !== 'Highest in Class' ? (
                                                        <>
                                                            <br />[{exam.EMPSGE_ForMaxMarkrs}]
                                                        </>
                                                    ) : (
                                                        ''
                                                    )}
                                                    {!exam.EMPSGE_ForMaxMarkrs &&
                                                    exam.EME_Id === 9800000 &&
                                                    exam.examnamedisplay === 'Total' ? (
                                                        <>
                                                            <br />
                                                            [200]
                                                        </>
                                                    ) : (
                                                        ''
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Applicable Subjects */}
                                        {student.studentsubjects
                                            ?.filter((s: any) => s.EYCES_MarksDisplayFlg || s.eyceS_MarksDisplayFlg)
                                            .map((subj: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className='break-words border-[0.5px] border-black p-2 text-left font-bold'>
                                                        {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                    </td>
                                                    {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                        const marks = student.studentmarks?.filter((mrks: any) => {
                                                            const mSubjId = mrks.ISMS_Id || mrks.ismS_Id;
                                                            const sSubjId = subj.ISMS_Id || subj.ismS_Id;
                                                            const mEmeId = mrks.EME_Id || mrks.emE_Id;
                                                            const gEmeId = exam.EME_Id || exam.emE_Id;

                                                            // Robust group matching (casing and key variants)
                                                            const mGrp = (
                                                                mrks.EMPG_GroupName ||
                                                                mrks.empG_GroupName ||
                                                                mrks.EMPSG_DisplayName ||
                                                                mrks.empsG_DisplayName ||
                                                                ''
                                                            )
                                                                ?.trim()
                                                                .toUpperCase();
                                                            const gGrp = (
                                                                exam.EMPG_GroupName ||
                                                                exam.empG_GroupName ||
                                                                exam.EMPG_DistplayName ||
                                                                exam.empG_DistplayName ||
                                                                ''
                                                            )
                                                                ?.trim()
                                                                .toUpperCase();

                                                            const subjMatch = mSubjId && sSubjId && Number(mSubjId) === Number(sSubjId);
                                                            const grpMatch = !mGrp || !gGrp || mGrp === gGrp;

                                                            if (exam.EME_ExamName === 'Highest in Class') {
                                                                return (
                                                                    subjMatch &&
                                                                    grpMatch &&
                                                                    (Number(mEmeId) === 9800000 || Number(mEmeId) === Number(gEmeId))
                                                                );
                                                            }

                                                            return subjMatch && grpMatch && Number(mEmeId) === Number(gEmeId);
                                                        });

                                                        let cellValue: any = '-';

                                                        if (marks && marks.length > 0) {
                                                            const isHighestExam = exam.EME_ExamName === 'Highest in Class';

                                                            if (isHighestExam) {
                                                                const highestEntry =
                                                                    marks.find(
                                                                        (m: any) =>
                                                                            m.ESTMPPS_ClassHighest !== undefined &&
                                                                            m.ESTMPPS_ClassHighest !== null &&
                                                                            m.ESTMPPS_ClassHighest !== '' &&
                                                                            m.ESTMPPS_ClassHighest !== 0
                                                                    ) ||
                                                                    marks.find(
                                                                        (m: any) =>
                                                                            m.estmppS_ClassHighest !== undefined &&
                                                                            m.estmppS_ClassHighest !== null &&
                                                                            m.estmppS_ClassHighest !== '' &&
                                                                            m.estmppS_ClassHighest !== 0
                                                                    ) ||
                                                                    marks.find((m: any) => Number(m.EME_Id || m.emE_Id) === 98000012) ||
                                                                    marks[0];
                                                                cellValue =
                                                                    highestEntry?.ESTMPPS_ClassHighest ??
                                                                    highestEntry?.estmppS_ClassHighest ??
                                                                    highestEntry?.ESTMPPS_MaxHighest ??
                                                                    '';
                                                            } else {
                                                                const mr = marks[0];
                                                                const passFail = mr.PassFailFlag || mr.passFailFlag;
                                                                const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                                                if (isAbsent) {
                                                                    cellValue = passFail;
                                                                } else {
                                                                    cellValue =
                                                                        mr.ObtainedMarks !== undefined
                                                                            ? mr.ObtainedMarks
                                                                            : mr.obtainedMarks;
                                                                    if (cellValue === undefined || cellValue === null) {
                                                                        cellValue =
                                                                            mr.GroupMarks || mr.ObtainedGrade || mr.obtainedGrade || '-';
                                                                    }
                                                                }
                                                            }
                                                        } else if (exam.EME_Id === 9800000) {
                                                            cellValue = subj.ESTMPPSG_GroupObtMarks ?? subj.estmppsG_GroupObtMarks ?? '-';
                                                        }

                                                        return (
                                                            <td key={eIdx} className='border-[0.5px] border-black p-2 text-center'>
                                                                {cellValue}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                        {/* TOTAL row */}
                                        <tr>
                                            <td className='border-[0.5px] border-black p-2 text-left font-bold uppercase'>TOTAL</td>
                                            {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                let totalValue: any = '';
                                                const mr = student.student_marks?.find(
                                                    (m: any) =>
                                                        Number(m.EME_Id ?? m.emE_Id) === Number(exam.EME_Id) &&
                                                        (m.EMPSG_DisplayName ?? m.empsG_DisplayName) === exam.EMPG_DistplayName
                                                );
                                                if (mr) {
                                                    totalValue = `${mr.ObtainedMarks ?? mr.obtainedMarks ?? mr.ESTMPS_ObtainedMarks ?? ''} / ${mr.maxmarks ?? mr.maxMarks ?? mr.EMPS_MaxMarks ?? ''}`;
                                                }
                                                return (
                                                    <td key={eIdx} className='border-[0.5px] border-black p-2 text-center font-bold'>
                                                        {totalValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* Percentage row */}
                                        <tr>
                                            <td className='border-[0.5px] border-black p-2 text-left font-bold uppercase'>PERCENTAGE</td>
                                            {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                let percValue: any = '';
                                                const mr = student.student_marks?.find(
                                                    (m: any) =>
                                                        Number(m.EME_Id ?? m.emE_Id) === Number(exam.EME_Id) &&
                                                        (m.EMPSG_DisplayName ?? m.empsG_DisplayName) === exam.EMPG_DistplayName
                                                );
                                                if (mr) {
                                                    const p =
                                                        mr.TotalPercentage ??
                                                        mr.totalPercentage ??
                                                        mr.ESTMPS_Percentage ??
                                                        mr.estmpS_Percentage;
                                                    percValue = p !== undefined && p !== null ? `${Number(p).toFixed(2)}%` : '';
                                                }
                                                return (
                                                    <td key={eIdx} className='border-[0.5px] border-black p-2 text-center font-bold'>
                                                        {percValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* Attendance row */}
                                        <tr>
                                            <td className='border-[0.5px] border-black p-2 text-left font-bold'>Attendance</td>
                                            {getgroupdetails?.map((grp: any, gIdx: number) => {
                                                const att = student.attendance?.find((a: any) => a.term === grp.empG_DistplayName);
                                                return (
                                                    <td
                                                        key={gIdx}
                                                        colSpan={grp.groupewiseexam?.length || 1}
                                                        className='border-[0.5px] border-black p-2 text-center'>
                                                        {att?.percentage ? `${att.percentage} %` : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>

                                    {/* Non-Applicable Subjects (Grades mostly) */}
                                    <tbody>
                                        {student.studentsubjects
                                            ?.filter((s: any) => !s.EYCES_MarksDisplayFlg && !s.eyceS_MarksDisplayFlg)
                                            .map((subj: any, idx: number) => (
                                                <tr key={`non-app-${idx}`}>
                                                    <td className='break-words border-[0.5px] border-black p-2 text-left font-bold'>
                                                        {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                    </td>
                                                    {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                        let cellValue: any = '';
                                                        const mr = student.studentmarks?.find(
                                                            (m: any) =>
                                                                m.EME_Id === exam.EME_Id &&
                                                                (m.ISMS_Id === subj.ISMS_Id || m.ismS_Id === subj.ismS_Id) &&
                                                                m.EMPSG_DisplayName === exam.EMPG_DistplayName
                                                        );
                                                        if (mr) {
                                                            if (
                                                                mr.ESTMPS_PassFailFlg !== 'AB' &&
                                                                mr.ESTMPS_PassFailFlg !== 'M' &&
                                                                mr.ESTMPS_PassFailFlg !== 'L' &&
                                                                mr.PassFailFlag !== 'AB' &&
                                                                mr.PassFailFlag !== 'M' &&
                                                                mr.PassFailFlag !== 'L'
                                                            ) {
                                                                if (exam.EME_ExamName === 'Grade') {
                                                                    cellValue = mr.ObtainedGrade || mr.ESTMPS_ObtainedGrade || '';
                                                                } else {
                                                                    cellValue =
                                                                        mr.ObtainedMarks ||
                                                                        mr.ESTMPS_ObtainedMarks ||
                                                                        mr.ObtainedGrade ||
                                                                        mr.ESTMPS_ObtainedGrade ||
                                                                        '';
                                                                }
                                                            } else {
                                                                cellValue = mr.ESTMPS_PassFailFlg || mr.PassFailFlag;
                                                            }
                                                        }
                                                        return (
                                                            <td key={eIdx} className='border-[0.5px] border-black p-2 text-center'>
                                                                {cellValue}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Remarks Box */}
                            <div className='pt-2'>
                                <table className='w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th className='bg-gray-400 p-2 text-center font-bold text-black uppercase'>SEMESTER-II</th>
                                        </tr>
                                        <tr>
                                            <td className='min-h-[40px] border-[0.5px] border-black p-2 text-left font-bold'>
                                                {semesterRemarks?.ECTERE_Remarks || semesterRemarks?.ecterE_Remarks || ''}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className='pt-2 pb-2'>
                                    <h5 className='font-bold text-[16px]'>
                                        Conduct :{' '}
                                        <span className='font-normal'>
                                            {semesterRemarks?.ECTERE_Conduct || semesterRemarks?.ecterE_Conduct || ''}
                                        </span>
                                    </h5>
                                </div>
                            </div>

                            {/* Skills Section (Co-Scholastic) */}
                            {skilllist_temp && skilllist_temp.length > 0 && (
                                <div className='flex flex-wrap gap-x-2 gap-y-4 pt-2 pb-4'>
                                    {skilllist_temp.map((skill: any, skIdx: number) => {
                                        const skillId = skill.ECS_Id ?? skill.ecS_Id;
                                        const skillName = skill.ECS_SkillName ?? skill.ecS_SkillName;

                                        return (
                                            <div key={skIdx} className='w-full flex-grow p-1 sm:w-[48%]'>
                                                <table className='w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                                    <tbody>
                                                        <tr className='border-[0.5px] border-black'>
                                                            <td className='border-[0.5px] border-black bg-gray-400 p-2 font-bold uppercase'>
                                                                {skillName}
                                                            </td>
                                                            {gettermdetails?.map((cos: any, cIdx: number) => {
                                                                const termName = cos.ecT_TermName ?? cos.ECT_TermName ?? cos.termName ?? '';
                                                                return (
                                                                    <td
                                                                        key={cIdx}
                                                                        className='w-[120px] border-[0.5px] border-black bg-gray-400 p-2 text-center font-bold uppercase'>
                                                                        {termName}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                        {activitylist_temp
                                                            ?.filter((ax: any) => (ax.ECS_Id ?? ax.ecS_Id) === skillId)
                                                            .map((skillx: any, axIdx: number) => {
                                                                const skillAreaId = skillx.ECSA_Id ?? skillx.ecsA_Id;
                                                                const skillAreaName = skillx.ECSA_SkillArea ?? skillx.ecsA_SkillArea;

                                                                return (
                                                                    <tr key={axIdx} className='border-[0.5px] border-black'>
                                                                        <td className='border-[0.5px] border-black p-2 font-semibold'>
                                                                            {skillAreaName}
                                                                        </td>
                                                                        {gettermdetails?.map((cosx: any, cIdx: number) => {
                                                                            const termId = cosx.ecT_Id ?? cosx.ECT_Id;
                                                                            const matchingSkills = student.studentSkills?.filter(
                                                                                (gradex: any) => {
                                                                                    const gTermId = gradex.ECT_Id ?? gradex.ecT_Id;
                                                                                    const gAreaId = gradex.ECSA_Id ?? gradex.ecsA_Id;
                                                                                    return (
                                                                                        Number(gTermId) === Number(termId) &&
                                                                                        Number(gAreaId) === Number(skillAreaId)
                                                                                    );
                                                                                }
                                                                            );

                                                                            return (
                                                                                <td
                                                                                    key={cIdx}
                                                                                    className='border-[0.5px] border-black p-2 text-center font-bold'>
                                                                                    {matchingSkills?.map((gradex: any, gxIdx: number) => {
                                                                                        const gradeName =
                                                                                            gradex.EMGD_Name ?? gradex.emgD_Name ?? '';
                                                                                        return <span key={gxIdx}>{gradeName}</span>;
                                                                                    })}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                );
                                                            })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            className='page-break mx-auto w-[98%] max-w-[98%] bg-white p-4 pt-16 font-sans text-black'>
                            <table
                                className='mb-2 w-full table-fixed border-collapse border border-black'
                                style={{ fontFamily: 'system-ui' }}>
                                <caption className='relative top-4 caption-top text-center'>
                                    <span className='border border-black bg-white px-8 py-1 font-semibold text-[23px] uppercase tracking-wide'>
                                        ACADEMIC SESSION{' '}
                                        {student.asmaY_Year ||
                                            data.ASMAY_Year ||
                                            (institution as any)?.asmaY_Year ||
                                            data.getinstitution?.[0]?.asmaY_Year ||
                                            ''}
                                    </span>
                                </caption>
                                <tbody>
                                    <tr>
                                        <td className='w-full border border-black p-4'>
                                            <div className='flex w-full'>
                                                <div className='flex-1 space-y-2'>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 pt-6 text-[14px]'>
                                                        <div className='font-bold'>Student's Name</div>
                                                        <div className='uppercase'>
                                                            : {student.amsT_FirstName || student.studentname || ''}
                                                        </div>
                                                    </div>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                        <div className='font-bold'>Scholar No.</div>
                                                        <div>: {student.amsT_AdmNo || student.admno || ''}</div>
                                                        <div className='font-bold'>Total Students</div>
                                                        <div>: {studentdetails.length}</div>
                                                    </div>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                </div>
                                                <div className='flex flex-1'>
                                                    <div className='flex-1 space-y-2'>
                                                        <div className='grid grid-cols-[80px_1fr] items-center gap-2 pt-6 text-[14px]'>
                                                            <div className='font-bold'>Class & Sec</div>
                                                            <div className='uppercase'>
                                                                : {student.classname || student.asmcL_ClassName || ''} -{' '}
                                                                {student.sectionname || student.asmC_SectionName || ''}
                                                            </div>
                                                        <div className='grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]'>
                                                            <div className='font-bold'>Roll No</div>
                                                            <div>: {student.amaY_RollNo || student.rollno || 1}</div>
                                                        </div>
                                                    </div>
                                                    <div className='ml-auto flex w-[100px] items-center justify-center text-right'>
                                                        {student.amsT_Photoname || student.student_photo ? (
                                                            <div className='relative h-[100px] w-[100px] border border-gray-300'>
                                                                <img
                                                                    src={student.amsT_Photoname || student.student_photo}
                                                                    alt='Student Photo'
                                                                    className='h-full w-full object-contain'
                                                                />
                                                        ) : (
                                                            <div className='flex h-[100px] w-[100px] items-center justify-center border border-gray-300 bg-gray-100 text-gray-400 text-xs'>
                                                                Photo
                                                        )}
                                                            </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {/* Main Split Table */}
                            <table className='mb-2 w-full border-collapse border-[1.5px] border-black text-[12px]'>

                                <tbody>
                                    <tr>
                                        {/* Left section: Subjects */}
                                        <td className='w-[100%] border-black border-r p-0 align-top'>
                                            <table className='w-full border-collapse'>
                                                <thead>
                                                    <tr>
                                                        <th rowSpan={2} className='border-black border-r border-b p-1 text-left'>
                                                            SUBJECTS
                                                        </th>
                                                        {getgroupdetails?.map((grp: any, idx: number) => (
                                                            <th
                                                                key={idx}
                                                                colSpan={grp.groupewiseexam?.length || 1}
                                                                className='border-black border-b bg-gray-500 p-1 text-center font-bold text-[12px] text-white uppercase'>
                                                                {EMPG_GroupName || grp.empG_DistplayName}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                        {groupwiseexamlist?.map((exam: any, idx: number) => (
                                                                className='whitespace-pre-wrap border-black border-b border-l p-1 text-center leading-tight'>
                                                                {exam.examnamedisplay}
                                                                {exam.EMPSGE_ForMaxMarkrs ? `\n[${exam.EMPSGE_ForMaxMarkrs}]` : ''}
                                                    <tr>
                                                            <th
                                                                key={idx}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {applicableSubjects.map((subj: any, sIdx: number) => {
                                                        const subjId = subj.ISMS_Id || subj.ismS_Id;
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

                                                        return (
                                                            <tr key={sIdx}>
                                                                <td className='border-black border-r border-b p-1 text-left'>
                                                                    {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                                </td>
                                                                {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                                    const examId = Number(exam.EME_Id);
                                                                    const isTotalCol = examId === 9800000;
                                                                    const isHighestCol = examId === 98000012;
                                                                    if (isSubjGrouped && isTotalCol && rowSpanVal === -1) return null;
                                                                    const rs = isSubjGrouped && isTotalCol ? rowSpanVal : 1;
                                                                    const cellValue = getCellValue(subj, exam);

                                                                    return (
                                                                        <td
                                                                            key={eIdx}
                                                                            rowSpan={rs}
                                                                            className='border-black border-b border-l p-1 text-center font-semibold'>
                                                                            {cellValue}
                                                                    );
                                                                })}
                                                            </tr>
                                                    {/* TOTAL row */}
                                                                        </td>
                                                        );
                                                    })}

                                                    <tr>
                                                        <td className='border-black border-r border-b p-1 text-left font-bold uppercase'>
                                                            TOTAL
                                                        </td>
                                                        {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                            const isTotalCol = Number(exam.EME_Id) === 9800000;
                                                            let totalValue = '';
                                                            if (isTotalCol) {
                                                                const grpName = exam.EMPG_DistplayName || exam.empG_DistplayName;
                                                                const semSum = getSemesterTotalSum(grpName);
                                                                if (semSum) {
                                                                    totalValue = `${semSum.obtained} / ${semSum.max}`;
                                                                    totalValue = '-';
                                                                } else {
                                                                }
                                                            }
                                                            return (
                                                                <td
                                                                    key={eIdx}
                                                                    className='border-black border-b border-l p-1 text-center font-bold'>
                                                                    {totalValue}
                                                            );
                                                        })}
                                                    {/* Percentage row */}
                                                            PERCENTAGE
                                                            let percValue = '';
                                                                if (semSum && semSum.max > 0) {
                                                                    percValue = `${((semSum.obtained / semSum.max) * 100).toFixed(2)}%`;
                                                                    percValue = '-';
                                                                    {percValue}
                                                    {/* Attendance row */}
                                                        <td className='border-black border-r p-1 text-left font-bold uppercase'>
                                                            Attendance
                                                                </td>
                                                    </tr>

                                                    <tr>
                                                        <td className='border-black border-r border-b p-1 text-left font-bold uppercase'>
                                                        </td>
                                                        {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                            const isTotalCol = Number(exam.EME_Id) === 9800000;
                                                            if (isTotalCol) {
                                                                const grpName = exam.EMPG_DistplayName || exam.empG_DistplayName;
                                                                const semSum = getSemesterTotalSum(grpName);
                                                                } else {
                                                                }
                                                            }
                                                            return (
                                                                <td
                                                                    key={eIdx}
                                                                    className='border-black border-b border-l p-1 text-center font-bold'>
                                                        {getgroupdetails?.map((grp: any, gIdx: number) => {
                                                            const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;
                                                            const att = student.attendance?.find((a: any) => {
                                                                const aTerm = a.EMPSG_DisplayName ?? a.term ?? '';
                                                                return matchTermName(aTerm, grpName);
                                                            });
                                                            const attVal = att?.TOTALAttendancePercentage ?? att?.percentage;
                                                            const attText =
                                                                attVal !== undefined && attVal !== null && attVal !== ''
                                                                    ? `${attVal}%`
                                                                    : '-';
                                                            return (
                                                                <td
                                                                    key={gIdx}
                                                                    colSpan={grp.groupewiseexam?.length || 1}
                                                                    className='border-black border-l p-1 text-center font-bold'>
                                                                    {attText}
                                                </tbody>
                                            </table>
                            {/* Suggestion Box */}
                            <table className='mb-2 w-full border-collapse border-[1.5px] border-black font-bold text-[12px]'>
                                        <td className='border-black border-b bg-gray-100 p-1 text-center uppercase'>
                                            {EMPG_GroupName || 'SEMESTER 1'}
                                        <td className='p-2 text-left uppercase'>Suggestion : {student.suggestions[0] || ''}</td>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                                <tbody>
                                    <tr>

                            {/* Graph Analysis Box */}
                            {localChartData && localChartData.length > 0 && (
                                <table className='mb-8 w-full border-collapse border-[1.5px] border-black font-bold text-[12px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th colSpan={3} className='bg-gray-400 p-2 text-center font-bold text-black uppercase'>
                                        <tr>
                                            <td colSpan={3} className='border-black border-b bg-gray-100 p-1 text-center uppercase'>
                                                GRAPHICAL ANALYSIS
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className='border-black border-b p-2'>
                                                <div className='mx-auto h-[320px] w-[98%]'>
                                                    <ResponsiveContainer width='100%' height='100%'>
                                                        <BarChart
                                                            data={student.chartData}
                                                            margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                                            <XAxis
                                                                dataKey='subject'
                                                                tick={{ fontSize: 10 }}
                                                            data={localChartData}
                                                            barGap={0}
                                                            margin={{ top: 30, right: 10, left: -20, bottom: 10 }}>
                                                                tick={{ fontSize: 14, fontWeight: 'bold', fill: '#000' }}
                                                                tickLine={false}
                                                                axisLine={true}
                                                                interval={0}
                                                                angle={-25}
                                                                textAnchor='end'
                                                            />
                                                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={true} />
                                                            <Bar dataKey='highest' fill='#3f51b5' barSize={20} />
                                                            <Bar dataKey='average' fill='#ff5722' barSize={20} />
                                                            <Bar dataKey='obtained' fill='#00ff00' barSize={20} />
                                                                height={85}
                                                            <YAxis
                                                                domain={[0, 100]}
                                                                ticks={[0, 50, 100]}
                                                                tick={{ fontSize: 14, fontWeight: 'bold', fill: '#000' }}
                                                                tickLine={false}
                                                                axisLine={true}
                                                            />

                                                            <Bar dataKey='highest' fill='#3f51b5' barSize={20}>
                                                                <LabelList
                                                                    dataKey='highest'
                                                                    position='top'
                                                                    style={{ fontSize: 13, fill: '#000', fontWeight: 'bold' }}
                                                                />
                                                            </Bar>
                                                            <Bar dataKey='average' fill='#ff5722' barSize={20}>
                                                                    dataKey='average'
                                                            <Bar dataKey='obtained' fill='#00ff00' barSize={20}>
                                                                    dataKey='obtained'
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className='border-[0.5px] border-black'>
                                            <td className='p-2 text-center font-bold'>
                                                <span className='mr-2 inline-block h-3 w-3 bg-[#3f51b5]'></span> Highest Marks
                                            </td>
                                            <td className='p-2 text-center font-bold'>
                                                <span className='mr-2 inline-block h-3 w-3 bg-[#ff5722]'></span> Average Marks
                                            </td>
                                            <td className='p-2 text-center font-bold'>
                                                <span className='mr-2 inline-block h-3 w-3 bg-[#00ff00]'></span> Obtained Marks
                                        <tr style={{ border: '0.5px solid black' }}>
                                            <td colSpan={3} className='border border-black p-2 text-center font-bold'>
                                                <div className='flex items-center justify-center gap-12 font-bold text-black text-sm'>
                                                    <span className='flex items-center gap-2'>
                                                        <span
                                                            className='inline-block h-3.5 w-3.5 bg-[#3f51b5]'
                                                            style={{ border: '0.5px solid black' }}></span>
                                                        Highest Marks
                                                    </span>
                                                            className='inline-block h-3.5 w-3.5 bg-[#ff5722]'
                                                        Average Marks
                                                            className='inline-block h-3.5 w-3.5 bg-[#00ff00]'
                                                        Obtained Marks
                                                </div>
                                                    <span className='flex items-center gap-2'>
                                                        <span
                                                            style={{ border: '0.5px solid black' }}></span>
                                                    </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Promotion Status Box */}
                            {student.remarks && (
                                <div className='pt-2'>
                                    <table className='w-full border-collapse border-[0.5px] border-black text-[14px]'>
                                        <tbody>
                                            <tr className='border-[0.5px] border-black'>
                                                <th className='bg-gray-400 p-2 text-center font-bold text-black uppercase'>
                                                    PROMOTION STATUS
                                                </th>
                                            </tr>
                                            <tr>
                                                <td className='min-h-[40px] border-[0.5px] border-black p-2 text-left font-bold'>
                                                    {student.remarks}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Signatures Box */}
                            <div className='mt-16'>
                                <table className='w-full border-collapse border-[0.5px] border-black text-center text-[14px]'>
                                    <tbody>
                                        <tr className='border-[0.5px] border-black'>
                                            <th className='w-1/3 border-[0.5px] border-black p-2 font-bold'>Principal's Signature</th>
                                            <th className='w-1/3 border-[0.5px] border-black p-2 font-bold'>Class Teacher's Signature</th>
                                            <th className='w-1/3 border-[0.5px] border-black p-2 font-bold'>Parent's Signature</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Issue Dates Box */}
                            <div className='pt-8 text-right'>
                                <span className='font-bold text-[16px]'>
                                    Date of issue : &emsp;
                                    {dateInfo?.issueDate ? new Date(dateInfo.issueDate).toLocaleDateString('en-GB') : ''}
                                </span>
                            </div>
                            <table className='w-full border-collapse border-[1.5px] border-black text-center font-bold text-[13px]'>
                                <tbody>
                                    <tr>
                                        <td className='w-1/3 border-black border-r p-2'>Principal's Signature</td>
                                        <td className='w-1/3 border-black border-r p-2'>Class Teacher's Signature</td>
                                        <td className='w-1/3 p-2'>Parent's Signature</td>
                                    </tr>
                                </tbody>
                            </table>
                            {/* Issue Date */}
                            <div className='mt-2 font-bold text-[13px]'>Date of issue : {new Date().toLocaleDateString('en-GB')}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportView;
