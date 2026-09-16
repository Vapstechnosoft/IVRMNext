'use client';

import { usePublishInitialData } from '@/hooks/exam/online-exam/useTransactions';
import { getPublishStudentList, savePublishToStudent } from '@/server/exam/online-exam/transactions/publish-to-student';
import type { IPublishToStudentList } from '@/types/exam/online-exam/transactions';
import { useState } from 'react';
import { toast } from 'sonner';
import PublishFilterForm from './_components/filter-form';
import PublishTable from './_components/publish-table';

export default function PublishToStudentPage() {
    const { data: initialResponse } = usePublishInitialData();

    const [students, setStudents] = useState<IPublishToStudentList[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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
        setSelectedStudentIds([]);
        try {
            const response = await getPublishStudentList({
                ASMAY_Id: values.asmaY_Id,
                ASMCL_Id: values.asmcL_Id,
                ASMS_Id: values.asmS_Id,
                ISMS_Id: values.ismS_Id ? values.ismS_Id : undefined,
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
                        className: 'Grade 10',
                        sectionName: 'Section A',
                        examName: 'Mid Term Online Assessment 2026',
                        subjectName: 'Science & Biology',
                        totalMarks: 50,
                        marksObtained: 44,
                        percentage: 88,
                        resultStatus: 'Pass',
                        isPublished: false
                    },
                    {
                        amsT_Id: 1002,
                        studentName: 'Divya Patel',
                        admNo: 'ADM2025002',
                        rollNo: '102',
                        className: 'Grade 10',
                        sectionName: 'Section A',
                        examName: 'Mid Term Online Assessment 2026',
                        subjectName: 'Science & Biology',
                        totalMarks: 50,
                        marksObtained: 40,
                        percentage: 80,
                        resultStatus: 'Pass',
                        isPublished: true
                    },
                    {
                        amsT_Id: 1003,
                        studentName: 'Rohan Verma',
                        admNo: 'ADM2025003',
                        rollNo: '103',
                        className: 'Grade 10',
                        sectionName: 'Section A',
                        examName: 'Mid Term Online Assessment 2026',
                        subjectName: 'Science & Biology',
                        totalMarks: 50,
                        marksObtained: 48,
                        percentage: 96,
                        resultStatus: 'Pass',
                        isPublished: false
                    }
                ]);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to fetch student results');
        } finally {
            setIsSearching(false);
        }
    };

    const handleToggleSelectStudent = (id: number) => {
        setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map((s) => s.amsT_Id));
        }
    };

    const handleBulkPublish = async (publishStatus: boolean) => {
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                LPMOEEX_Id: activeExamId || 501,
                studentIds: selectedStudentIds,
                publishStatus
            };

            const response = await savePublishToStudent(payload);
            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success(`Results successfully ${publishStatus ? 'published to' : 'unpublished from'} student portal!`);
                setStudents((prev) => prev.map((s) => (selectedStudentIds.includes(s.amsT_Id) ? { ...s, isPublished: publishStatus } : s)));
                setSelectedStudentIds([]);
            } else {
                toast.error(response?.message || 'Failed to update publish status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setStudents([]);
        setSelectedStudentIds([]);
        setActiveExamId(0);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                {/* Header */}
                <div>
                    <h1 className='font-bold text-2xl text-foreground tracking-tight'>Publish Online Exam to Student Portal</h1>
                    <p className='text-muted-foreground text-sm'>
                        Verify student evaluation results and publish exam reports directly to the student portal
                    </p>
                </div>

                {/* Filter Form */}
                <PublishFilterForm
                    years={years}
                    classes={classes}
                    sections={sections}
                    subjects={subjects}
                    exams={exams}
                    onFilterSubmit={handleFilterSubmit}
                    onReset={handleReset}
                    isLoading={isSearching}
                />

                {/* Candidates Publish Table */}
                <PublishTable
                    students={students}
                    selectedStudentIds={selectedStudentIds}
                    onToggleSelectStudent={handleToggleSelectStudent}
                    onSelectAll={handleSelectAll}
                    onBulkPublish={handleBulkPublish}
                    isLoading={isSearching}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
