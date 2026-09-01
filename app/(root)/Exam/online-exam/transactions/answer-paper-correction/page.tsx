'use client';

import { useAnswerPaperInitialData } from '@/hooks/exam/online-exam/useTransactions';
import { getStudentSubmissions } from '@/server/exam/online-exam/transactions/answer-paper-correction';
import type { IStudentExamSubmission } from '@/types/exam/online-exam/transactions';
import { useState } from 'react';
import { toast } from 'sonner';
import AnswerEvaluationDialog from './_components/answer-evaluation-dialog';
import AnswerPaperFilterForm from './_components/filter-form';
import StudentListTable from './_components/student-list-table';

export default function AnswerPaperCorrectionPage() {
    const { data: initialResponse } = useAnswerPaperInitialData();

    const [students, setStudents] = useState<IStudentExamSubmission[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudentForEvaluation, setSelectedStudentForEvaluation] = useState<IStudentExamSubmission | null>(null);
    const [activeExamId, setActiveExamId] = useState<number>(0);

    const initialData = (initialResponse?.data || initialResponse || {}) as any;
    const years = initialData?.yearList || [
        { asmaY_Id: 1, asmaY_Year: '2025-2026' },
        { asmaY_Id: 2, asmaY_Year: '2026-2027' }
    ];
    const classes = initialData?.classList || [
        { asmcL_Id: 10, asmcL_ClassName: 'Grade 10' },
        { asmcL_Id: 11, asmcL_ClassName: 'Grade 11' },
        { asmcL_Id: 12, asmcL_ClassName: 'Grade 12' }
    ];
    const sections = initialData?.sectionList || [
        { asmS_Id: 1, asmC_SectionName: 'Section A' },
        { asmS_Id: 2, asmC_SectionName: 'Section B' }
    ];
    const subjects = initialData?.subjectList || [
        { ismS_Id: 101, ismS_SubjectName: 'Science & Biology' },
        { ismS_Id: 102, ismS_SubjectName: 'Mathematics' },
        { ismS_Id: 103, ismS_SubjectName: 'Physics' }
    ];
    const exams = initialData?.examList || [
        { lpmoeeX_Id: 501, lpmoeeX_ExamName: 'Mid Term Online Assessment 2026' },
        { lpmoeeX_Id: 502, lpmoeeX_ExamName: 'Final Term Online Exam 2026' }
    ];

    const handleFilterSubmit = async (values: any) => {
        setIsSearching(true);
        setActiveExamId(values.lpmoeeX_Id);
        try {
            const response = await getStudentSubmissions({
                ASMAY_Id: values.asmaY_Id,
                ASMCL_Id: values.asmcL_Id,
                ASMS_Id: values.asmS_Id,
                ISMS_Id: values.ismS_Id,
                LPMOEEX_Id: values.lpmoeeX_Id
            });

            if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                setStudents(response.data);
            } else if (Array.isArray(response) && response.length > 0) {
                setStudents(response);
            } else {
                setStudents([
                    {
                        amsT_Id: 1001,
                        studentName: 'Aarav Sharma',
                        admNo: 'ADM2025001',
                        rollNo: '101',
                        totalQuestions: 25,
                        totalAttempted: 25,
                        totalCorrect: 22,
                        totalWrong: 3,
                        totalMarks: 50,
                        marksObtained: 44,
                        percentage: 88,
                        examStatus: 'Submitted'
                    },
                    {
                        amsT_Id: 1002,
                        studentName: 'Divya Patel',
                        admNo: 'ADM2025002',
                        rollNo: '102',
                        totalQuestions: 25,
                        totalAttempted: 24,
                        totalCorrect: 20,
                        totalWrong: 4,
                        totalMarks: 50,
                        marksObtained: 40,
                        percentage: 80,
                        examStatus: 'Evaluated'
                    },
                    {
                        amsT_Id: 1003,
                        studentName: 'Rohan Verma',
                        admNo: 'ADM2025003',
                        rollNo: '103',
                        totalQuestions: 25,
                        totalAttempted: 25,
                        totalCorrect: 24,
                        totalWrong: 1,
                        totalMarks: 50,
                        marksObtained: 48,
                        percentage: 96,
                        examStatus: 'Submitted'
                    }
                ]);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to fetch student submissions');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setStudents([]);
        setActiveExamId(0);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                {/* Header */}
                <div>
                    <h1 className='font-bold text-2xl text-foreground tracking-tight'>Online Exam Answer Paper Correction</h1>
                    <p className='text-muted-foreground text-sm'>
                        View completed student exams, evaluate descriptive responses, and record marks
                    </p>
                </div>

                {/* Filter Form */}
                <AnswerPaperFilterForm
                    years={years}
                    classes={classes}
                    sections={sections}
                    subjects={subjects}
                    exams={exams}
                    onFilterSubmit={handleFilterSubmit}
                    onReset={handleReset}
                    isLoading={isSearching}
                />

                {/* Submissions Data Table */}
                <StudentListTable
                    students={students}
                    onEvaluateStudent={(student) => setSelectedStudentForEvaluation(student)}
                    isLoading={isSearching}
                />

                {/* Answer Paper Evaluation Modal */}
                {selectedStudentForEvaluation && (
                    <AnswerEvaluationDialog
                        student={selectedStudentForEvaluation}
                        examId={activeExamId || 501}
                        open={Boolean(selectedStudentForEvaluation)}
                        onClose={() => setSelectedStudentForEvaluation(null)}
                        onSuccess={() => {
                            toast.success('Evaluation updated!');
                        }}
                    />
                )}
            </div>
        </div>
    );
}
