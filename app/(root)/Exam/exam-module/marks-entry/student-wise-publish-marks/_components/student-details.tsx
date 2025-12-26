// app/exam/exam-module/student-marks-publish/_components/student-details.tsx
'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormProvider } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Send, Mail, Bell, X } from 'lucide-react';
import { Label } from '@/components/ui/extension/field';
import { StudentMarksPublishColumns } from './student-details-columns';
import { IStudentDetails } from '@/types/exam/exam-module/marks-entry';

interface Props {
    searchParams: any;
    studentData: any[];
    isLoading: boolean;
    onClose: () => void;
    onRefresh: (params: any, data: any[]) => void;
}

export default function StudentMarksPublishDetails({
    searchParams,
    studentData,
    isLoading,
    onClose,
    onRefresh
}: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<IStudentDetails[]>([]);
    const [smsFlag, setSmsFlag] = useState(false);
    const [emailFlag, setEmailFlag] = useState(false);
    const [notificationFlag, setNotificationFlag] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const tableProps = useDataTableProps({
        data: studentData,
        isLoading: isLoading || localLoading
    });

    // Handle refresh when search params change
    useEffect(() => {
        if (searchParams) {
            // Optionally refresh data when search params change
        }
    }, [searchParams]);

    // Handle refresh search
    const handleRefresh = async () => {
        if (!searchParams) return;

        setLocalLoading(true);
        try {
            // Simulate API call to refresh data
            await new Promise(resolve => setTimeout(resolve, 500));

            // Use the same mock data for refresh
            const mockData = [
                ...studentData,
                {
                    amsT_Id: studentData.length + 1,
                    amsT_FirstName: "NEW STUDENT",
                    amsT_AdmNo: `ADM/${1000 + studentData.length}/24-25`,
                    amaY_Rollno: studentData.length + 1,
                    obtainedmarks: 25,
                    totalmaxmarks: 46,
                    percentage: 54,
                    estmP_PublishToStudentFlg: 0,
                    estmP_Id: 200 + studentData.length
                }
            ];

            onRefresh(searchParams, mockData);
            toast.success('Data refreshed successfully');
        } catch (error: any) {
            toast.error('Failed to refresh data');
        } finally {
            setLocalLoading(false);
        }
    };

    // ---- UPDATE BUTTON HANDLER ----
    async function handleUpdate() {
        setIsSubmitting(true);
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one student');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                ASMAY_Id: searchParams.asmaY_Id,
                ASMCL_Id: searchParams.asmcL_Id,
                ASMS_Id: searchParams.asmS_Id,
                EME_Id: searchParams.emE_Id || 0,
                radiotype: searchParams.radiotype,
                SMSFLAG: smsFlag,
                EMAILFLAG: emailFlag,
                selectedstudents: selectedRows.map(s => ({
                    AMST_Id: s.amsT_Id,
                    ESTMP_Id: s.estmP_Id,
                    AMST_FirstName: s.amsT_FirstName,
                    ESTMP_PublishToStudentFlg: s.estmP_PublishToStudentFlg
                })),
                ELP_ActiveFlg: notificationFlag,
                EME_ExamName: searchParams.emE_ExamName || ''
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success(`${selectedRows.length} student(s) updated successfully`);

            // Clear selections after update
            setSelectedRows([]);
            setSmsFlag(false);
            setEmailFlag(false);
            setNotificationFlag(false);

        } catch (error: any) {
            toast.error(error.message || 'Failed to update records');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Get title based on search type
    const getTitle = () => {
        const year = searchParams.asmaY_Year || academicYearName(searchParams.asmaY_Id);
        const className = searchParams.asmcL_ClassName || classData.find(c => c.asmcL_Id === searchParams.asmcL_Id)?.asmcL_ClassName || 'Class';
        const sectionName = searchParams.asmC_SectionName || sectionData.find(s => s.asmS_Id === searchParams.asmS_Id)?.asmC_SectionName || 'Section';

        const baseTitle = `${year} / ${className} / ${sectionName}`;

        if (searchParams.radiotype === 'EXAM') {
            const examName = searchParams.emE_ExamName || examData.find(e => e.emE_Id === searchParams.emE_Id)?.emE_ExamName || 'Exam';
            return `${baseTitle} / ${examName}`;
        }

        return `${baseTitle} / Promotion`;
    };

    // Mock data for display
    const academicYearName = (id: number) => {
        const years = ['2024-25', '2023-24', '2022-23'];
        return years[id % years.length] || '2024-25';
    };

    const classData = [
        { asmcL_Id: 1, asmcL_ClassName: 'Class I' },
        { asmcL_Id: 2, asmcL_ClassName: 'Class II' },
        { asmcL_Id: 3, asmcL_ClassName: 'Class III' },
    ];

    const sectionData = [
        { asmS_Id: 1, asmC_SectionName: 'Section A' },
        { asmS_Id: 2, asmC_SectionName: 'Section B' },
        { asmS_Id: 3, asmC_SectionName: 'Section C' },
    ];

    const examData = [
        { emE_Id: 1, emE_ExamName: 'First Term Exam' },
        { emE_Id: 2, emE_ExamName: 'Mid Term Exam' },
        { emE_Id: 3, emE_ExamName: 'Final Exam' },
    ];

    return (
        <FormProvider>
            <div className="relative w-fit">
                {/* Close Button - Top Right */}
                <Button
                    type="button"
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="flex w-fit z-10"
                >
                    <X className="h-4 w-4 mr-2" />
                    Close
                </Button>
                <div className="mt-4">
                    <GenericDataTable
                        {...tableProps}
                        columns={StudentMarksPublishColumns}
                        isLoading={isLoading || localLoading}
                        showViewOptions={false}
                        onRowSelectionChange={(rows) => {
                            setSelectedRows(rows);
                        }}
                        noDataTitle="No Students Found"
                        noDataDescription="No student marks data available for the selected criteria."
                    />
                </div>

                {/* Communication Options */}
                {selectedRows.length > 0 && (
                    <div className="mt-6 flex justify-center gap-6 border-t pt-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sms"
                                checked={smsFlag}
                                onCheckedChange={(checked) => setSmsFlag(checked as boolean)}
                            />
                            <Label htmlFor="sms" className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                SMS
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="email"
                                checked={emailFlag}
                                onCheckedChange={(checked) => setEmailFlag(checked as boolean)}
                            />
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                EMAIL
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="notification"
                                checked={notificationFlag}
                                onCheckedChange={(checked) => setNotificationFlag(checked as boolean)}
                            />
                            <Label htmlFor="notification" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                NOTIFICATION
                            </Label>
                        </div>
                    </div>
                )}

                {/* BOTTOM BUTTONS */}
                <div className="mt-6 flex w-fit justify-center gap-4 pt-4">

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={localLoading}
                    >
                        {localLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>

                    <Button
                        onClick={handleUpdate}
                        disabled={isSubmitting || selectedRows.length === 0}
                        className="px-8 py-2"
                    >
                        {isSubmitting ? 'Updating...' : 'UPDATE'}
                    </Button>
                </div>
            </div>
        </FormProvider>
    );
}