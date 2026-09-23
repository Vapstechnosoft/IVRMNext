'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard, getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IExamReportCard, IMasterInstitution, Institution, ISubject } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import ProgressCardReportForm from './_components/add-form';
import ProgressCardReport from './_components/progress-card-report';

export default function ProgressCardReportPage() {
    const [reportData, setReportData] = useState<IExamReportCard[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<any>({});
    const [examName, setExamName] = useState<string>('');
    const [examCode] = useState<string>('FA1');
    const [year, setYear] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    })

    const handleReportSuccess = async (payload: any) => {
        try {
            console.log('Progress Card Report payload:', payload);
            const res = await getExamReportCard(payload);
            console.log('progress card report api response', res);

            let flatRows: any[] = [];
            const rawData = res?.data ?? res;
            if (Array.isArray(rawData)) {
                flatRows = rawData;
            } else if (rawData && typeof rawData === 'object') {
                if (Array.isArray(rawData.$values)) flatRows = rawData.$values;
                else if (Array.isArray(rawData.getstudentmarksdetails)) flatRows = rawData.getstudentmarksdetails;
                else if (Array.isArray(rawData.getstudentmarksdetails?.$values)) flatRows = rawData.getstudentmarksdetails.$values;
                else if (Array.isArray(rawData.savelist)) flatRows = rawData.savelist;
                else if (Array.isArray(rawData.savelist?.$values)) flatRows = rawData.savelist.$values;
                else if (Array.isArray(rawData.studentlist)) flatRows = rawData.studentlist;
                else if (Array.isArray(rawData.reportlist)) flatRows = rawData.reportlist;
                else if (Array.isArray(rawData.getstudentdetails)) flatRows = rawData.getstudentdetails;
                else {
                    for (const key of Object.keys(rawData)) {
                        if (Array.isArray(rawData[key]) && rawData[key].length > 0) {
                            flatRows = rawData[key];
                            break;
                        }
                    }
                }
            }

            if (!flatRows || flatRows.length === 0) {
                toast.error(res?.message || 'No records found for the selected criteria');
                setIsReportVisible(false);
                return;
            }

            console.log('progress card report response Data', flatRows);

            const studentMap = new Map<number, IExamReportCard>();
            const subjectMap = new Map<number, ISubject>();

            flatRows.forEach((row) => {
                const studentId = Number(row.amsT_Id ?? row.AMST_Id ?? 0);
                if (!studentId) return;

                const ismsId = Number(row.ismS_Id ?? row.ISMS_Id ?? 0);
                const ismsName = String(row.ismS_SubjectName ?? row.ISMS_SubjectName ?? row.subjectName ?? '');

                // Build unique subjects
                if (ismsId && !subjectMap.has(ismsId)) {
                    subjectMap.set(ismsId, {
                        ismS_Id: ismsId,
                        ismS_SubjectName: ismsName,
                        eyceS_AplResultFlg: row.eyceS_AplResultFlg ?? row.EYCES_AplResultFlg ?? true,
                        eyceS_MarksDisplayFlg: row.eyceS_MarksDisplayFlg ?? row.EYCES_MarksDisplayFlg ?? true,
                        eyceS_GradeDisplayFlg: row.eyceS_GradeDisplayFlg ?? row.EYCES_GradeDisplayFlg ?? true,
                        eyceS_SubjectOrder: row.eyceS_SubjectOrder ?? row.EYCES_SubjectOrder ?? 999,
                        type: (row.eyceS_GradeDisplayFlg ?? row.EYCES_GradeDisplayFlg) ? 'Grade' : 'Marks'
                    });
                }

                // Initialize student
                if (!studentMap.has(studentId)) {
                    const firstName = String(row.amsT_FirstName ?? row.AMST_FirstName ?? row.studentName ?? row.studentname ?? '').trim();
                    studentMap.set(studentId, {
                        amsT_Id: studentId,
                        amsT_FirstName: firstName || `Student ${studentId}`,
                        amsT_FatherName: String(row.amsT_FatherName ?? row.AMST_FatherName ?? 'N/A'),
                        amsT_DOB: row.amsT_DOB ?? row.AMST_DOB,
                        amaY_RollNo: row.amaY_RollNo ?? row.AMAY_RollNo,
                        amsT_AdmNo: row.amsT_AdmNo ?? row.AMST_AdmNo,
                        amsT_RegistrationNo: row.amsT_RegistrationNo ?? row.AMST_RegistrationNo,
                        sub_list: [],
                        estmP_TotalMaxMarks: row.estmP_TotalMaxMarks ?? row.ESTMP_TotalMaxMarks,
                        estmP_TotalObtMarks: row.estmP_TotalObtMarks ?? row.ESTMP_TotalObtMarks,
                        estmP_Percentage: row.estmP_Percentage ?? row.ESTMP_Percentage,
                        estmP_TotalGrade: row.estmP_TotalGrade ?? row.ESTMP_TotalGrade,
                        estmP_Result: row.estmP_Result ?? row.ESTMP_Result,
                        estmP_ClassRank: row.estmP_ClassRank ?? row.ESTMP_ClassRank,
                        estmP_SectionRank: row.estmP_SectionRank ?? row.ESTMP_SectionRank,
                        classheld: row.asA_ClassHeld ?? row.ASA_ClassHeld,
                        classatt: row.asA_Class_Attended ?? row.ASA_Class_Attended,
                        estmP_TotalGradeRemark: row.emgD_Remarks ?? row.EMGD_Remarks ?? row.estmP_TotalGradeRemark ?? 'Good'
                    });
                }

                // Only add subjects with actual marks
                const maxMarks = Number(row.estmpS_MaxMarks ?? row.ESTMPS_MaxMarks ?? 0);
                if (ismsId && maxMarks > 0) {
                    studentMap.get(studentId)!.sub_list.push({
                        ismS_Id: ismsId,
                        estmpS_MaxMarks: maxMarks,
                        estmpS_ObtainedMarks: row.estmpS_ObtainedMarks ?? row.ESTMPS_ObtainedMarks ?? null,
                        estmpS_ObtainedGrade: row.estmpS_ObtainedGrade ?? row.ESTMPS_ObtainedGrade ?? '-',
                        estmpS_PassFailFlg: row.estmpS_PassFailFlg ?? row.ESTMPS_PassFailFlg
                    });
                }
            });

            // Filter subjects that actually have marks
            const validSubjectIds = new Set(Array.from(studentMap.values()).flatMap((s) => s.sub_list.map((m) => m.ismS_Id)));

            const filteredSubjects = Array.from(subjectMap.values())
                .filter((s) => validSubjectIds.has(s.ismS_Id))
                .sort((a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999));

            const firstRow = flatRows[0] || {};

            setSubjects(filteredSubjects);
            setReportData(Array.from(studentMap.values()));
            setHeaderInfo({
                cla: firstRow.asmcL_ClassName ?? firstRow.ASMCL_ClassName ?? payload.selectedClassName,
                sec: firstRow.asmC_SectionName ?? firstRow.ASMC_SectionName ?? payload.selectedSectionName
            });
            setExamName(firstRow.emE_ExamName ?? firstRow.EME_ExamName ?? payload.selectedExamName ?? 'Progress Card');
            setYear(firstRow.asmaY_Year ?? firstRow.ASMAY_Year ?? payload.selectedYearName ?? new Date().getFullYear().toString());
            setIsReportVisible(true);
            toast.success(`${studentMap.size} progress card(s) generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    // 🔥 STATIC MOCK DATA (100 Students × 5 Subjects)
    const generateStaticData = () => {
        const subjects = [
            { id: 101, name: "Mathematics", order: 1 },
            { id: 102, name: "Science", order: 2 },
            { id: 103, name: "English", order: 3 },
            { id: 104, name: "Social", order: 4 },
            { id: 105, name: "Computer", order: 5 }
        ];

        const rows: any[] = [];

        for (let i = 1; i <= 100; i++) {
            const totalMax = subjects.length * 100;
            let totalObt = 0;

            subjects.forEach((sub) => {
                const marks = Math.floor(Math.random() * 60) + 40; // 40–100
                totalObt += marks;

                rows.push({
                    // Student Info
                    amsT_Id: 15000 + i,
                    amsT_FirstName: `Student ${i}`,
                    amsT_FatherName: `Father ${i}`,
                    amsT_DOB: "2016-01-01T00:00:00",
                    amaY_RollNo: i,
                    amsT_AdmNo: `ADM${i}`,
                    amsT_RegistrationNo: `REG${i}`,

                    // Class Info
                    asmcL_ClassName: "ClassnRhd",
                    asmC_SectionName: "AAAA",
                    emE_ExamName: "Vaps Exam1(Raju)",
                    asmaY_Year: "2025",

                    // Subject Info
                    ismS_Id: sub.id,
                    ismS_SubjectName: sub.name,
                    eyceS_AplResultFlg: true,
                    eyceS_MarksDisplayFlg: true,
                    eyceS_GradeDisplayFlg: false,
                    eyceS_SubjectOrder: sub.order,

                    // Marks
                    estmpS_MaxMarks: 100,
                    estmpS_ObtainedMarks: marks,
                    estmpS_ObtainedGrade: "",
                    estmpS_PassFailFlg: marks >= 35,

                    // Totals
                    estmP_TotalMaxMarks: totalMax,
                    estmP_TotalObtMarks: 0, // temp
                    estmP_Percentage: 0,
                    estmP_TotalGrade: "",
                    estmP_Result: "",
                    estmP_ClassRank: i,
                    estmP_SectionRank: i,
                    asA_ClassHeld: 46,
                    asA_Class_Attended: 44,
                    emgD_Remarks: "Good"
                });
            });

            // Update totals for this student
            const percentage = Math.round((totalObt / totalMax) * 100);
            const grade =
                percentage >= 90 ? "A+" :
                    percentage >= 75 ? "A" :
                        percentage >= 60 ? "B" :
                            percentage >= 50 ? "C" : "D";

            rows
                .filter(r => r.amsT_Id === 15000 + i)
                .forEach(r => {
                    r.estmP_TotalObtMarks = totalObt;
                    r.estmP_Percentage = percentage;
                    r.estmP_TotalGrade = grade;
                    r.estmP_Result = percentage >= 35 ? "Pass" : "Fail";
                });
        }

        return rows;
    };

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const institution_res = await getMasterInstitution();
                const { data: institution_data } = institution_res;
                setInstitution(institution_data);
            } catch (error) {
                console.error("Error fetching institution:", error);
            }
        };

        fetchInstitution();
    }, []);




    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <ProgressCardReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <ProgressCardReport
                        reportData={reportData}
                        institution={institution}
                        subjects={subjects}
                        headerInfo={headerInfo}
                        examName={examName}
                        examCode={examCode}
                        year={year}
                        onPrint={handlePrint}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}