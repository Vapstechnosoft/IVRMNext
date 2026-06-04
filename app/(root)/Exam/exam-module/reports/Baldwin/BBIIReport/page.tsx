'use client';

import { useState } from 'react';
import BBIIReportForm from './_components/add-form';
import BBIIReportView from './_components/report-view';
import { getExamReportCard } from '@/server/exam/exam-module/reports/cumulative-report';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Loader2 } from 'lucide-react';

export default function BBIIReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [gradeRemarks, setGradeRemarks] = useState<any[]>([]);
    const [attendanceWork, setAttendanceWork] = useState<any[]>([]);
    const [attendancePresent, setAttendancePresent] = useState<any[]>([]);
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [classTeacher, setClassTeacher] = useState('');
    const [showRemarks, setShowRemarks] = useState(true);
    const [showRank, setShowRank] = useState(false);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSuccess = async (payload: any) => {
        try {
            setIsLoading(true);
            setReportData([]);
            setIsReportVisible(false);
            console.log(payload, "pay");
            const res = await getExamReportCard(payload);
            console.log("response", res);

            const apiData = res?.data;
            const flatRows: any[] = apiData?.list || (Array.isArray(apiData) ? apiData : []);

            if (res && res.success && Array.isArray(flatRows) && flatRows.length > 0) {
                // Extract extra lists from response
                const grade_details = apiData?.grade_details || (res as any).grade_details || [];
                const stud_work_attendence = apiData?.stud_work_attendence || (res as any).stud_work_attendence || [];
                const stud_present_attendence = apiData?.stud_present_attendence || (res as any).stud_present_attendence || [];
                const clstchname = apiData?.clstchname || (res as any).clstchname || [];

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
                            estmP_ClassRank: row.estmP_ClassRank,
                            estmP_SectionRank: row.estmP_SectionRank,
                            estmP_TotalGradeRemark: row.estmP_TotalGradeRemark,
                            stu_grandmin_marks: row.estmpssS_ObtainedMarks,
                            totaleyceS_MarksEntryMax: row.totaleyceS_MarksEntryMax,
                            totalestM_Marks: row.totalestM_Marks,
                            sub_list: []
                        });
                    } else {
                        const existing = studentMap.get(studentId);
                        if (row.estmP_TotalGradeRemark && (!existing.estmP_TotalGradeRemark || existing.estmP_TotalGradeRemark.trim() === '')) {
                            existing.estmP_TotalGradeRemark = row.estmP_TotalGradeRemark;
                        }
                        if (row.estmP_TotalMaxMarks && !existing.estmP_TotalMaxMarks) {
                            existing.estmP_TotalMaxMarks = row.estmP_TotalMaxMarks;
                        }
                        if (row.estmP_TotalObtMarks && !existing.estmP_TotalObtMarks) {
                            existing.estmP_TotalObtMarks = row.estmP_TotalObtMarks;
                        }
                        if (row.estmP_Percentage && !existing.estmP_Percentage) {
                            existing.estmP_Percentage = row.estmP_Percentage;
                        }
                        if (row.estmP_TotalGrade && !existing.estmP_TotalGrade) {
                            existing.estmP_TotalGrade = row.estmP_TotalGrade;
                        }
                        if (row.estmP_SectionRank && !existing.estmP_SectionRank) {
                            existing.estmP_SectionRank = row.estmP_SectionRank;
                        }
                    }

                    if (row.ismS_Id) {
                        const rawObt = row.estM_Marks !== null && row.estM_Marks !== undefined ? row.estM_Marks : row.estmpS_ObtainedMarks;
                        const obtained = rawObt !== null && rawObt !== undefined && !isNaN(Number(rawObt)) ? Number(rawObt) : null;

                        const rawMax = row.eyceS_MarksEntryMax || row.eyceS_MaxMarks || row.estmpS_MaxMarks;
                        const max = rawMax !== null && rawMax !== undefined && !isNaN(Number(rawMax)) ? Number(rawMax) : null;

                        let subjectPercentage = '';
                        if (obtained !== null && max !== null && max > 0) {
                            subjectPercentage = ((obtained / max) * 100).toFixed(2);
                        }

                        studentMap.get(studentId).sub_list.push({
                            amsT_Id: row.amsT_Id,
                            ismS_Id: row.ismS_Id,
                            ismS_SubjectName: row.ismS_SubjectName,
                            eyceS_MaxMarks: row.eyceS_MaxMarks || row.estmpS_MaxMarks,
                            eyceS_MinMarks: row.eyceS_MinMarks || row.estmpS_MinMarks,
                            eyceS_MarksEntryMax: row.eyceS_MarksEntryMax,
                            estM_Marks: row.estM_Marks,
                            estmpS_ObtainedMarks: row.estmpS_ObtainedMarks,
                            estmpS_Percentage: subjectPercentage || '',
                            estmP_Percentage: row.estmP_Percentage || '',
                            estmpS_ObtainedGrade: row.estmpS_ObtainedGrade,
                            estmpS_PassFailFlg: row.estmpS_PassFailFlg,
                            eyceS_AplResultFlg: row.eyceS_AplResultFlg,
                            emgR_Id: row.emgR_Id,
                            EYCES_MarksDisplayFlg: row.EYCES_MarksDisplayFlg || row.eyceS_MarksDisplayFlg,
                            EYCES_GradeDisplayFlg: row.EYCES_GradeDisplayFlg || row.eyceS_GradeDisplayFlg,
                            emgD_Remarks: row.emgD_Remarks,
                        });
                    }
                });

                setReportData(Array.from(studentMap.values()));
                setGradeRemarks(grade_details);
                setAttendanceWork(stud_work_attendence);
                setAttendancePresent(stud_present_attendence);
                setExamName(flatRows[0].emE_ExamName || 'Progress Card');
                setAcademicYear(flatRows[0].asmaY_Year || flatRows[0].amaY_Year || '');
                setClassTeacher(clstchname?.[0]?.hrmE_EmployeeFirstName || clstchname?.[0]?.clstchname || '');
                setShowRemarks(true);
                setShowRank(false);
                setIsReportVisible(true);
                toast.success('Report generated successfully');
            } else {
                toast.error('No record found');
                setIsReportVisible(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch report data');
            setIsReportVisible(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Progress Card Report (BBII)</CardTitle>
                </CardHeader>
                <CardContent>
                    <BBIIReportForm onSuccess={handleFormSuccess} onReset={handleReset} />
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}

            {isReportVisible && !isLoading && (
                <CollapsibleSection title="Report Preview" defaultOpen>
                    <BBIIReportView
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
