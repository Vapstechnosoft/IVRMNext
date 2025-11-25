'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IExamReportCard, ISubject } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ProgressCardReportForm from './_components/add-form';
import ProgressCardPrintView from './_components/progress-card-printable';

export default function ProgressCardReportPage() {
    const [reportData, setReportData] = useState<IExamReportCard[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<any>({});
    const [examName, setExamName] = useState<string>('');
    const [examCode, setExamCode] = useState<string>('FA1');
    const [year, setYear] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getExamReportCard(payload);
            if (!res?.success || !Array.isArray(res?.data) || res.data.length === 0) {
                toast.error('No records found');
                setIsReportVisible(false);
                return;
            }

            const flatRows: any[] = res.data;

            const studentMap = new Map<number, IExamReportCard>();
            const subjectMap = new Map<number, ISubject>();

            flatRows.forEach((row) => {
                const studentId = row.amsT_Id;

                // Build unique subjects
                if (row.ismS_Id && !subjectMap.has(row.ismS_Id)) {
                    subjectMap.set(row.ismS_Id, {
                        ismS_Id: row.ismS_Id,
                        ismS_SubjectName: row.ismS_SubjectName,
                        eyceS_AplResultFlg: row.eyceS_AplResultFlg ?? true,
                        eyceS_MarksDisplayFlg: row.eyceS_MarksDisplayFlg ?? true,
                        eyceS_GradeDisplayFlg: row.eyceS_GradeDisplayFlg ?? true,
                        eyceS_SubjectOrder: row.eyceS_SubjectOrder ?? 999,
                        type: row.eyceS_GradeDisplayFlg ? 'Grade' : 'Marks'
                    });
                }

                // Initialize student
                if (!studentMap.has(studentId)) {
                    studentMap.set(studentId, {
                        amsT_Id: studentId,
                        amsT_FirstName: row.amsT_FirstName.trim(),
                        amsT_FatherName: row.amsT_FatherName || 'N/A',
                        amsT_DOB: row.amsT_DOB,
                        amaY_RollNo: row.amaY_RollNo,
                        amsT_AdmNo: row.amsT_AdmNo,
                        amsT_RegistrationNo: row.amsT_RegistrationNo,
                        sub_list: [],
                        estmP_TotalMaxMarks: row.estmP_TotalMaxMarks,
                        estmP_TotalObtMarks: row.estmP_TotalObtMarks,
                        estmP_Percentage: row.estmP_Percentage,
                        estmP_TotalGrade: row.estmP_TotalGrade,
                        estmP_Result: row.estmP_Result,
                        estmP_ClassRank: row.estmP_ClassRank,
                        estmP_SectionRank: row.estmP_SectionRank,
                        classheld: row.asA_ClassHeld,
                        classatt: row.asA_Class_Attended,
                        estmP_TotalGradeRemark: row.emgD_Remarks || row.estmP_TotalGradeRemark || 'Good'
                    });
                }

                // Only add subjects with actual marks
                if (row.ismS_Id && row.estmpS_MaxMarks > 0) {
                    studentMap.get(studentId)!.sub_list.push({
                        ismS_Id: row.ismS_Id,
                        estmpS_MaxMarks: row.estmpS_MaxMarks,
                        estmpS_ObtainedMarks: row.estmpS_ObtainedMarks ?? null,
                        estmpS_ObtainedGrade: row.estmpS_ObtainedGrade || '-',
                        estmpS_PassFailFlg: row.estmpS_PassFailFlg
                    });
                }
            });

            // Filter subjects that actually have marks
            const validSubjectIds = new Set(Array.from(studentMap.values()).flatMap((s) => s.sub_list.map((m) => m.ismS_Id)));

            const filteredSubjects = Array.from(subjectMap.values())
                .filter((s) => validSubjectIds.has(s.ismS_Id))
                .sort((a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999));

            const firstRow = flatRows[0];

            setSubjects(filteredSubjects);
            setReportData(Array.from(studentMap.values()));
            const safeReportData = Array.from(studentMap.values());
            console.log('reportData', safeReportData);
            console.log(reportData);
            setHeaderInfo({
                cla: firstRow.asmcL_ClassName,
                sec: firstRow.asmC_SectionName
            });
            setExamName(firstRow.emE_ExamName || 'Progress Card');
            setYear(firstRow.asmaY_Year || new Date().getFullYear().toString());
            setIsReportVisible(true);
            toast.success(`${studentMap.size} progress card(s) generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <ProgressCardReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div className='no Print my-4 flex justify-end'>
                        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                        <button
                            onClick={handlePrint}
                            className='flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
                            <Printer className='h-4 w-4' />
                            Print All Cards
                        </button>
                    </div>
                    <ProgressCardPrintView
                        reportData={reportData}
                        subjects={subjects}
                        headerInfo={headerInfo}
                        examName={examName}
                        examCode={examCode}
                        year={year}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
