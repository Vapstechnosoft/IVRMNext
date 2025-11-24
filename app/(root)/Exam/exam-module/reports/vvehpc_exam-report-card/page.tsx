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
    const [headerInfo, setHeaderInfo] = useState<Partial<any>>({});
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
            const selectedIds = payload.amsT_Ids ? new Set(payload.amsT_Ids.split(',').map(Number)) : new Set();

            const subjMap = new Map<number, ISubject>();
            flatRows.forEach((r: any) => {
                if (!subjMap.has(r.ismS_Id)) {
                    subjMap.set(r.ismS_Id, {
                        ismS_Id: r.ismS_Id,
                        ismS_SubjectName: r.ismS_SubjectName,
                        eyceS_AplResultFlg: r.eyceS_AplResultFlg ?? true,
                        type: r.eyceS_GradeDisplayFlg ? 'Grade' : 'Marks',
                        eyceS_MarksDisplayFlg: r.eyceS_MarksDisplayFlg ?? false,
                        eyceS_GradeDisplayFlg: r.eyceS_GradeDisplayFlg ?? false,
                        eyceS_SubjectOrder: r.eyceS_SubjectOrder ?? 999
                    });
                }
            });

            const subjectsList = Array.from(subjMap.values()).sort((a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999));

            const studentMap = new Map<number, IExamReportCard>();
            flatRows.forEach((r: any) => {
                const sid = r.amsT_Id;
                if (selectedIds.size > 0 && !selectedIds.has(sid)) return;

                if (!studentMap.has(sid)) {
                    studentMap.set(sid, {
                        amsT_Id: sid,
                        amsT_FirstName: [r.amsT_FirstName, r.amsT_MiddleName, r.amsT_LastName].filter(Boolean).join(' ').trim(),
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
                        classheld: r.classheld ?? null,
                        classatt: r.classatt ?? null,
                        estmP_TotalGradeRemark: r.estmP_TotalGradeRemark ?? null
                    });
                }

                studentMap.get(sid)!.sub_list.push({
                    ismS_Id: r.ismS_Id,
                    estmpS_ObtainedMarks: r.estmpS_ObtainedMarks ?? null,
                    estmpS_ObtainedGrade: r.estmpS_ObtainedGrade ?? null,
                    estmpS_PassFailFlg: r.estmpS_PassFailFlg ?? null,
                    estmpS_MaxMarks: r.estmpS_MaxMarks ?? null
                });
            });

            const first = flatRows[0];
            const header = {
                mI_name: first.mI_Name || 'Vidya Vikasa Vidya Samsthe (R)',
                cla: first.asmcL_ClassName,
                sec: first.asmC_SectionName,
                yr: first.asmaY_Year,
                exmmid: first.emE_ExamName
            };

            setSubjects(subjectsList);
            setReportData(Array.from(studentMap.values()));
            setHeaderInfo(header);
            setExamName(first.emE_ExamName || 'Progress Card');
            setYear(first.asmaY_Year || '');
            setIsReportVisible(true);
            toast.success('Progress cards generated successfully');
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
                <CollapsibleSection title='Progress Cards (Print View)' defaultOpen>
                    <div className='no-print my-4 flex justify-end'>
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
