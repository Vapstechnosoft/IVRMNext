'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard } from '@/server/exam/exam-module/reports/cumulative-report';
import type { IExamReportCard, IReportHeader, ISubject } from '@/types/exam/exam-module/report';
import { useState } from 'react';
import { toast } from 'sonner';
import ProgressCardReportForm from './_components/add-form';
import { getExamReportCardColumns } from './_components/columns';
import ProgressCardReport from './_components/progress-card-report';

export default function ExamReportCardPage() {
    const [reportData, setReportData] = useState<IExamReportCard[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<Partial<IReportHeader>>({});
    const [isReportVisible, setIsReportVisible] = useState(false);
    const tableProps = useDataTableProps(reportData);

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getExamReportCard(payload);
            if (!res?.success || !Array.isArray(res?.data) || res.data.length === 0) {
                toast.error('No records found');
                setReportData([]);
                setSubjects([]);
                setHeaderInfo({});
                setIsReportVisible(false);
                return;
            }

            const flatRows: any[] = res.data;

            // -------------------------------------------------
            // 1. Keep only the IDs that the user selected
            // -------------------------------------------------
            const selectedIds = new Set(payload?.amsT_Ids?.split(',').map(Number) ?? []);

            // ---------- Build unique subjects list ----------
            const subjMap = new Map<number, ISubject>();
            flatRows.forEach((r) => {
                if (!subjMap.has(r.ismS_Id)) {
                    subjMap.set(r.ismS_Id, {
                        ismS_Id: r.ismS_Id,
                        ismS_SubjectName: r.ismS_SubjectName,
                        eyceS_AplResultFlg: r.eyceS_AplResultFlg ?? true,
                        type: r.eyceS_GradeDisplayFlg ? 'Grade' : 'Marks',
                        eyceS_MarksDisplayFlg: r.eyceS_MarksDisplayFlg ?? false,
                        eyceS_GradeDisplayFlg: r.eyceS_GradeDisplayFlg ?? false,
                        eyceS_SubjectOrder: r.eyceS_SubjectOrder ?? 999,
                        estmpS_MaxMarks: r.estmpS_MaxMarks ?? null
                    });
                }
            });
            const subjectsList: ISubject[] = Array.from(subjMap.values()).sort(
                (a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999)
            );

            // ---------- Group by student ----------
            const studentMap = new Map<number, IExamReportCard>();
            flatRows.forEach((r) => {
                const sid = r.amsT_Id;

                // ← ONLY SELECTED STUDENTS
                if (!selectedIds.has(sid)) return;

                if (!studentMap.has(sid)) {
                    studentMap.set(sid, {
                        amsT_FirstName: r.amsT_FirstName,
                        amsT_FatherName: r.amsT_FatherName ?? null,
                        amsT_DOB: r.amsT_DOB ?? null,
                        amaY_RollNo: r.amaY_RollNo ?? null,
                        amsT_AdmNo: r.amsT_AdmNo ?? null,
                        amsT_RegistrationNo: r.amsT_RegistrationNo ?? null,
                        sub_list: [],
                        estmP_TotalMaxMarks: r.estmP_TotalMaxMarks ?? null,
                        estmP_TotalObtMarks: r.estmP_TotalObtMarks ?? null,
                        estmP_Percentage: r.estmP_Percentage ?? null,
                        estmP_TotalGrade: r.estmP_TotalGrade ?? null,
                        estmP_Result: r.estmP_Result ?? null,
                        estmP_ClassRank: r.estmP_ClassRank ?? null,
                        estmP_SectionRank: r.estmP_SectionRank ?? null,
                        classheld: r.asA_ClassHeld ?? null,
                        classatt: r.asA_Class_Attended ?? null,
                        estmP_TotalGradeRemark: r.estmP_TotalGradeRemark ?? null
                    });
                }
                const student = studentMap.get(sid)!;
                student.sub_list.push({
                    ismS_Id: r.ismS_Id,
                    estmpS_ObtainedMarks: r.estmpS_ObtainedMarks ?? null,
                    estmpS_ObtainedGrade: r.estmpS_ObtainedGrade ?? null,
                    estmpS_PassFailFlg: r.estmpS_PassFailFlg ?? null,
                    estmpS_MaxMarks: r.estmpS_MaxMarks ?? null
                });
            });

            const formatted: IExamReportCard[] = Array.from(studentMap.values());

            // ---------- Header ----------
            const first = flatRows[0];
            const header: Partial<IReportHeader> = {
                mI_name: first.instname ?? undefined,
                yr: first.asmaY_Year ?? undefined,
                cla: first.asmcL_ClassName,
                sec: first.asmC_SectionName,
                exmmid: first.emE_ExamName
            };

            setSubjects(subjectsList);
            setReportData(formatted);
            setHeaderInfo(header);
            setIsReportVisible(true);
            toast.success('Report generated successfully');
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setReportData([]);
            setSubjects([]);
            setHeaderInfo({});
            setIsReportVisible(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <>
            {/* ------------------- FORM ------------------- */}
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <ProgressCardReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {/* ------------------- SCREEN TABLE ------------------- */}
            {isReportVisible && (
                <CollapsibleSection title='Result Table (Screen only)' defaultOpen={false}>
                    <div className='mt-6'>
                        <GenericDataTable
                            isLoading={false}
                            {...tableProps}
                            columns={getExamReportCardColumns(subjects)}
                            data={reportData}
                            noDataTitle='No results.'
                            noDataDescription='No student data matches the selected criteria.'
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* ------------------- PRINTABLE REPORT (ALL SELECTED STUDENTS) ------------------- */}

            {isReportVisible && (
                <ProgressCardReport
                    reportData={reportData}
                    subjects={subjects}
                    headerInfo={headerInfo}
                    examName={headerInfo.exmmid || 'Term Exam'}
                    examCode='FA1' // or pass dynamically
                    year={headerInfo.yr || '2024-2025'}
                    onPrint={handlePrint}
                />
            )}
        </>
    );
}
