'use client';

import { getExamReportCard } from '@/server/exam/exam-module/reports/cumulative-report';
import { useState } from 'react';
import { toast } from 'sonner';
import BCOEDIReportForm from './_components/add-form';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Loader2 } from 'lucide-react';
import BCOEDIReportView from './_components/report-view';

export default function BCOEDIReportPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [gradeRemarks, setGradeRemarks] = useState<any[]>([]);
    const [attendanceWork, setAttendanceWork] = useState<any[]>([]);
    const [attendancePresent, setAttendancePresent] = useState<any[]>([]);
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [classTeacher, setClassTeacher] = useState('');
    const [showRemarks, setShowRemarks] = useState(true);
    const [showRank, setShowRank] = useState(false);

    const handleFormSuccess = async (payload: any) => {
        try {
            setIsLoading(true);
            setIsReportVisible(false);
            const res = await getExamReportCard(payload);

            if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
                const flatRows: any[] = res.data;

                // Group by student
                const studentMap = new Map<number, any>();

                flatRows.forEach((row: any) => {
                    const studentId = row.amsT_Id;
                    if (!studentMap.has(studentId)) {
                        studentMap.set(studentId, {
                            student_id: studentId,
                            amsT_FirstName: row.amsT_FirstName,
                            amsT_DOB: row.amsT_DOB,
                            amsT_AdmNo: row.amsT_AdmNo,
                            amaY_RollNo: row.amaY_RollNo,
                            asmcL_ClassName: row.asmcL_ClassName,
                            asmC_SectionName: row.asmC_SectionName,
                            estmP_TotalMaxMarks: row.estmP_TotalMaxMarks,
                            estmP_TotalObtMarks: row.estmP_TotalObtMarks,
                            estmP_Percentage: row.estmP_Percentage,
                            classheld: row.classheld || row.asA_ClassHeld,
                            classatt: row.classatt || row.asA_Class_Attended,
                            estmP_TotalGrade: row.estmP_TotalGrade,
                            estmP_TotalGradeRemark: row.estmP_TotalGradeRemark,
                            estmP_SectionRank: row.estmP_SectionRank,
                            sub_list: []
                        });
                    }

                    const student = studentMap.get(studentId);
                    student.sub_list.push({
                        ismS_Id: row.ismS_Id,
                        ismS_SubjectName: row.ismS_SubjectName,
                        emgR_Id: row.emgR_Id,
                        eyceS_MarksEntryMax: row.eyceS_MarksEntryMax,
                        eyceS_MaxMarks: row.eyceS_MaxMarks,
                        eyceS_MinMarks: row.eyceS_MinMarks,
                        estM_Marks: row.estM_Marks,
                        estmpS_ObtainedMarks: row.estmpS_ObtainedMarks,
                        estmpS_ObtainedGrade: row.estmpS_ObtainedGrade,
                        estmpS_Percentage: row.estmpS_Percentage,
                        estmpS_PassFailFlg: row.estmpS_PassFailFlg,
                        eyceS_AplResultFlg: row.eyceS_AplResultFlg,
                        EYCES_GradeDisplayFlg: row.eyceS_GradeDisplayFlg || row.EYCES_GradeDisplayFlg,
                        emgD_Remarks: row.emgD_Remarks
                    });
                });

                const grade_details = (res as any).grade_details || [];
                const stud_work_attendence = (res as any).stud_work_attendence || [];
                const stud_present_attendence = (res as any).stud_present_attendence || [];
                const clstchname = (res as any).clstchname || [];

                setReportData(Array.from(studentMap.values()));
                setGradeRemarks(grade_details);
                setAttendanceWork(stud_work_attendence);
                setAttendancePresent(stud_present_attendence);
                setExamName(flatRows[0].emE_ExamName || '');
                setAcademicYear(payload.asmaY_Year || ''); // Need to pass year name from form
                setClassTeacher(clstchname?.[0]?.hrmE_EmployeeFirstName || '');
                setShowRemarks(payload.showRemarks);
                setShowRank(payload.showRank);

                setIsReportVisible(true);
            } else {
                toast.error('No records found for the selected criteria');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex flex-col gap-6 p-4'>
            <CollapsibleSection title='BCOEDI Report Criteria' defaultOpen>
                <BCOEDIReportForm onSuccess={handleFormSuccess} onReset={() => window.location.reload()} />
            </CollapsibleSection>

            {isLoading && (
                <div className='flex flex-col items-center justify-center gap-4 p-12'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='animate-pulse text-muted-foreground'>Generating BCOEDI Reports...</p>
                </div>
            )}

            {isReportVisible && !isLoading && (
                <CollapsibleSection title='Report Preview' defaultOpen>
                    <BCOEDIReportView
                        reportData={reportData}
                        gradeRemarks={gradeRemarks}
                        attendanceWork={attendanceWork}
                        attendancePresent={attendancePresent}
                        examName={examName}
                        academicYear={academicYear}
                        classTeacher={classTeacher}
                        showRemarks={showRemarks}
                        showRank={showRank}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
