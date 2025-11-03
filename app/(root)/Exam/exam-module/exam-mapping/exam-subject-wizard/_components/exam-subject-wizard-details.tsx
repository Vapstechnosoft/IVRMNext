'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { getExamSubjectWizardDetails } from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import type { IExamSubjectWizard, IExamSubjectWizardDetails } from '@/types/exam/exam-module/exam-mapping';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ToggleExamSubjectWizardDetailsForm from './details-toggle-form';
import { ExamSubjectWizardDetailsColumns } from './exam-subject-wizard-details-columns';

interface ExamSubjectWizardDetailsPageProps {
    rowData: IExamSubjectWizard;
    onClose: () => void;
}

export default function ExamSubjectWizardDetailsPage({ rowData, onClose }: ExamSubjectWizardDetailsPageProps) {
    return (
        <FormProvider<IExamSubjectWizardDetails>>
            <ExamSubjectWizardDetailsPageContent rowData={rowData} onClose={onClose} />
        </FormProvider>
    );
}

function ExamSubjectWizardDetailsPageContent({
    rowData,
    onClose
}: {
    rowData: IExamSubjectWizard;
    onClose: () => void;
}) {
    const [details, setDetails] = useState<IExamSubjectWizardDetails[]>([]);
    const [loading, setLoading] = useState(false);

    const { openToggleForm, selectedRow } = useFormContext<IExamSubjectWizardDetails>();

    // -------------------------
    // Fetch Exam Subject Wizard Details
    // -------------------------
    useEffect(() => {
        async function fetchDetails() {
            if (!rowData.eycE_Id) return;
            setLoading(true);

            try {
                const response = await getExamSubjectWizardDetails(30, rowData.eycE_Id);
                const apiResponse = response as unknown as {
                    success: boolean;
                    message: string;
                    data: IExamSubjectWizardDetails[];
                };

                const data = apiResponse?.data || [];
                setDetails(data);
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch Exam Subject Wizard details');
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [rowData]);

    // -------------------------
    // Data table setup
    // -------------------------
    const tableProps = useDataTableProps({
        data: details,
        total: details.length,
        pageIndex: 0,
        pageSize: 10
    });

    // -------------------------
    // Render
    // -------------------------
    return (
        <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]'>
            <div className='relative mx-auto w-[80%] rounded-2xl bg-white p-6 shadow-xl'>
                {/* Header */}
                <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading
                            title={`Exam Subject Wizard ${rowData.emE_ExamName ? `- ${rowData.emE_ExamName}` : ''}`}
                            description={`View all subject mappings for "${rowData.emE_ExamName}"`}
                        />
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            type='button'
                            variant='secondary'
                            onClick={onClose}
                            className='shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            Close
                        </Button>
                    </div>
                </div>
                <GenericDataTable<IExamSubjectWizardDetails>
                    {...tableProps}
                    columns={ExamSubjectWizardDetailsColumns}
                    isLoading={loading}
                    noDataTitle='No Subjects Found'
                    noDataDescription='No subjects are mapped for this exam.'
                    errorTitle='Error Loading Details'
                    showViewOptions={false}
                />

                <FormSections />
            </div>
        </div>
    );
}

export function FormSections() {
    const { isToggleFormOpen, selectedRow, closeToggleForm } = useFormContext<IExamSubjectWizardDetails>();

    return (
        <>
            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleExamSubjectWizardDetailsForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
